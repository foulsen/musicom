import { CHROMATIC_SCALE, Pitch } from "@music-workspace/music-theory";

import type { Difficulty } from "./question-generators";

/**
 * Ditado melódico: uma melodia curta numa tonalidade maior, respondida em graus da escala.
 * A resposta é agnóstica de oitava — cada nota vale pelo seu grau (semitons mod 12 a partir da
 * tônica), os mesmos ids do quiz de graus ("0", "2", "4", "5", "7", "9", "11").
 */
export interface DictationQuestion {
  tonic: Pitch;
  /** Notas da melodia, na ordem de execução. */
  notes: Pitch[];
  /** Grau de cada nota (semitons mod 12 a partir da tônica), em ordem. */
  degreeIds: string[];
  /** Graus oferecidos no teclado desta questão (e aceitos como entrada). */
  vocabulary: string[];
}

/** Semitons de cada grau da escala maior (1..7), em ordem. */
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const;

/** Ids dos graus da escala maior (1..7): o teclado do ditado, em ordem. */
export const DICTATION_DEGREE_IDS: readonly string[] = MAJOR_DEGREE_SEMITONES.map(String);

/** Oitavas da tônica (o baixo da cadência fica uma oitava abaixo, como no quiz de graus). */
const DICTATION_TONIC_OCTAVES = [3, 4];

/** Registro da melodia em posições de escala em relação à tônica: do 5º grau abaixo (-3) à oitava acima (7). */
const REGISTER_MIN_POSITION = -3;
const REGISTER_MAX_POSITION = 7;

/** Graus iniciais permitidos (1, 3 ou 5) nos níveis fácil e médio: começar num grau estável ajuda a ancorar. */
const STABLE_START_DEGREE_IDS = ["0", "4", "7"];

/** Chance de preferir o passo conjunto (1 grau de escala) quando ele existe — o nível fácil é "quase só graus conjuntos". */
const STEPWISE_BIAS = 0.7;

interface DictationRules {
  length: number;
  /** Quantos graus (1..N) da escala entram. */
  degreeCount: number;
  /** Maior salto entre notas, em passos de escala (2 = terça, 3 = quarta, 7 = oitava). */
  maxStep: number;
  /** Começa só em 1, 3 ou 5. */
  stableStart: boolean;
}

const RULES: Record<Difficulty, DictationRules> = {
  easy: { length: 3, degreeCount: 5, maxStep: 2, stableStart: true },
  medium: { length: 4, degreeCount: 7, maxStep: 3, stableStart: true },
  hard: { length: 5, degreeCount: 7, maxStep: 7, stableStart: false },
};

/** Número de notas da melodia no nível. */
export function dictationLength(difficulty: Difficulty): number {
  return RULES[difficulty].length;
}

/** Graus disponíveis no nível (ids em semitons): fácil usa só 1–5. */
export function dictationVocabulary(difficulty: Difficulty): string[] {
  return DICTATION_DEGREE_IDS.slice(0, RULES[difficulty].degreeCount);
}

/** Semitons a partir da tônica de uma posição de escala (0 = tônica, 7 = oitava; negativas descem). */
function positionSemitones(position: number): number {
  const octave = Math.floor(position / 7);
  const degree = position - octave * 7;

  return MAJOR_DEGREE_SEMITONES[degree] + octave * 12;
}

function degreeIdOf(semitones: number): string {
  return (((semitones % 12) + 12) % 12).toString();
}

/** Escolhe um item com `random` ∈ [0, 1) injetável. */
function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/**
 * Posições do registro cujo grau está no vocabulário e que têm algum vizinho dentro do salto máximo.
 * Como a vizinhança é simétrica, toda posição que sobra sempre tem para onde ir — a melodia nunca empaca
 * (ex.: no nível fácil o 5 grave e a oitava ficam de fora, pois nenhum grau 1–5 está a ≤ 2 passos deles).
 */
function playablePositions(vocabulary: ReadonlySet<string>, maxStep: number): number[] {
  const inVocabulary: number[] = [];

  for (let position = REGISTER_MIN_POSITION; position <= REGISTER_MAX_POSITION; position++) {
    if (vocabulary.has(degreeIdOf(positionSemitones(position)))) inVocabulary.push(position);
  }

  return inVocabulary.filter((position) =>
    inVocabulary.some((other) => other !== position && Math.abs(other - position) <= maxStep),
  );
}

/** Gera a melodia (posições de escala) respeitando vocabulário, salto máximo e regra de início. */
function melodyPositions(difficulty: Difficulty, random: () => number): number[] {
  const { length, maxStep, stableStart } = RULES[difficulty];
  const vocabulary = new Set(dictationVocabulary(difficulty));
  const playable = playablePositions(vocabulary, maxStep);

  const starts = stableStart
    ? playable.filter((position) => STABLE_START_DEGREE_IDS.includes(degreeIdOf(positionSemitones(position))))
    : playable;

  const positions = [pick(starts, random)];

  while (positions.length < length) {
    const current = positions[positions.length - 1];
    // Sem repetir a nota anterior: ditado de nota repetida vira só contagem de notas.
    const reachable = playable.filter(
      (position) => position !== current && Math.abs(position - current) <= maxStep,
    );
    const stepwise = reachable.filter((position) => Math.abs(position - current) === 1);
    const pool = stepwise.length > 0 && random() < STEPWISE_BIAS ? stepwise : reachable;

    positions.push(pick(pool, random));
  }

  return positions;
}

/** Sorteia tônica e melodia do nível; `random` (0 ≤ x < 1) é injetável para testar sem acaso. */
export function generateDictation(difficulty: Difficulty, random: () => number = Math.random): DictationQuestion {
  const tonic = Pitch.from(pick(CHROMATIC_SCALE, random), pick(DICTATION_TONIC_OCTAVES, random));
  const semitones = melodyPositions(difficulty, random).map(positionSemitones);

  return {
    tonic,
    notes: semitones.map((offset) => tonic.transpose(offset)),
    degreeIds: semitones.map(degreeIdOf),
    vocabulary: dictationVocabulary(difficulty),
  };
}

/** Separador dos graus na resposta composta (`correctId` da questão e escolha registrada). */
const ANSWER_SEPARATOR = "-";

/** Resposta composta de um ditado — o `correctId`/`selectedOptionId` de uma questão de ditado. */
export function dictationAnswerId(degreeIds: readonly string[]): string {
  return degreeIds.join(ANSWER_SEPARATOR);
}

export interface DictationGrade {
  /** Acerto por posição; posições ainda não preenchidas contam como erro. */
  perNote: boolean[];
  allCorrect: boolean;
}

/** Compara posição a posição; o ditado só é correto se todas as notas batem. */
export function gradeDictation(expected: readonly string[], entered: readonly string[]): DictationGrade {
  const perNote = expected.map((id, index) => entered[index] === id);

  return { perNote, allCorrect: entered.length === expected.length && perNote.every(Boolean) };
}

/** Tecla de dígito → grau (id em semitons) da escala maior: 1→"0", 2→"2", 3→"4", 4→"5", 5→"7", 6→"9", 7→"11". */
export function degreeIdForDigit(key: string): string | null {
  if (!/^[1-7]$/.test(key)) return null;

  return DICTATION_DEGREE_IDS[Number(key) - 1];
}
