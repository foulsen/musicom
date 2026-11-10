import { createPassage, KeySignature, type KeyMode, type Passage } from "@music-workspace/music-theory";

import { itemWeight, pickWeighted } from "@/modules/shared/application/weighted-sampling";

import type { ItemScore, KeySignatureLevelId } from "./reading-types";

export type KeyQuestionKind = "name" | "signature";

export interface KeySignatureQuestion {
  /** "name": mostra a armadura e pergunta o tom; "signature": dá o tom e pergunta a armadura. */
  kind: KeyQuestionKind;
  mode: KeyMode;
  correctFifths: number;
  /** 4 armaduras distintas (inclui a correta), já embaralhadas; o id da opção é `String(fifths)`. */
  optionFifths: number[];
  /** Chave da estatística: `${fifths}:${mode}`. */
  itemKey: string;
}

const MODES: readonly KeyMode[] = ["major", "minor"];
const OPTION_COUNT = 4;

/** Faixa de quintas (negativo = bemóis) de cada nível. */
export function fifthsRange(levelId: KeySignatureLevelId): { min: number; max: number } {
  const limit = levelId === "up-to-2" ? 2 : levelId === "up-to-4" ? 4 : 7;

  return { min: -limit, max: limit };
}

export function keyItemKey(fifths: number, mode: KeyMode): string {
  return `${fifths}:${mode}`;
}

/** Nome do tom (tônica) na armadura, ex.: fifths 3 + minor → "F#". */
export function keyTonicName(fifths: number, mode: KeyMode): string {
  return new KeySignature(fifths).tonic(mode).toString();
}

/** Pauta de clave de sol com a armadura, para desenhar a pergunta ou a opção (compasso sem notas). */
export function keySignaturePassage(fifths: number): Passage {
  return createPassage({ fifths }, [[]]);
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/** Distratores: vizinhas (±1, ±2) e a de sinal oposto com a mesma contagem; completa com o resto da faixa. */
function pickDistractors(correct: number, min: number, max: number, random: () => number): number[] {
  const inRange = (value: number) => value >= min && value <= max && value !== correct;
  const preferred = [...new Set([correct - 1, correct + 1, correct - 2, correct + 2, -correct])].filter(inRange);
  const chosen = shuffle(preferred, random).slice(0, OPTION_COUNT - 1);

  if (chosen.length < OPTION_COUNT - 1) {
    const rest: number[] = [];
    for (let fifths = min; fifths <= max; fifths++) {
      if (inRange(fifths) && !chosen.includes(fifths)) rest.push(fifths);
    }
    chosen.push(...shuffle(rest, random).slice(0, OPTION_COUNT - 1 - chosen.length));
  }

  return chosen;
}

/**
 * Sorteia o tom (ponderado por erro suavizado, com piso), o tipo da pergunta (50/50) e 3 distratores.
 * Pura: a renderização deriva pautas e rótulos a partir de `correctFifths`/`mode`/`optionFifths`.
 */
export function generateKeySignatureQuestion(
  levelId: KeySignatureLevelId,
  stats: Record<string, ItemScore> | undefined,
  random: () => number = Math.random,
): KeySignatureQuestion {
  const { min, max } = fifthsRange(levelId);
  const pool: { fifths: number; mode: KeyMode }[] = [];

  for (let fifths = min; fifths <= max; fifths++) {
    for (const mode of MODES) pool.push({ fifths, mode });
  }

  const { fifths, mode } = pickWeighted(
    pool,
    pool.map((item) => itemWeight(stats?.[keyItemKey(item.fifths, item.mode)])),
    random,
  );
  const kind: KeyQuestionKind = random() < 0.5 ? "name" : "signature";
  const optionFifths = shuffle([fifths, ...pickDistractors(fifths, min, max, random)], random);

  return { kind, mode, correctFifths: fifths, optionFifths, itemKey: keyItemKey(fifths, mode) };
}
