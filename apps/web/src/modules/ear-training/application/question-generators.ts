import {
  CHROMATIC_SCALE,
  MAJOR_7_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  AUGMENTED_CHORD_PATTERN,
  DORIAN_SCALE_PATTERN,
  HARMONIC_MINOR_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MAJOR_SCALE_PATTERN,
  MELODIC_MINOR_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
  Note,
  Pitch,
  type ChordPattern,
  type ScalePattern,
} from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  intervalLabel,
  scaleLabel,
  type TermLabel,
} from "@/modules/shared/application/music-terms";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";
import type { QuizOption } from "@/modules/shared/application/quiz";

import { itemWeight, pickWeighted, topConfusionId, type ItemStatsState } from "./item-stats";

/** Oitavas possíveis de playback — sorteada por questão para o ouvido não ancorar em frequências absolutas. */
const PLAYBACK_OCTAVES = [3, 4, 5];

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

/** Filtra `entries` (item + rank de dificuldade) para tudo até o nível pedido, cumulativo. */
function poolForDifficulty<T>(entries: [T, number][], difficulty: Difficulty): T[] {
  const maxRank = DIFFICULTY_RANK[difficulty];

  return entries.filter(([, rank]) => rank <= maxRank).map(([item]) => item);
}

// Cada pool cresce por nível (fácil ⊂ médio ⊂ difícil); todo nível tem >= 4 itens
// para garantir 3 distratores distintos + a resposta certa.
const INTERVAL_SEMITONE_ENTRIES: [number, number][] = [
  [4, 1],
  [5, 1],
  [7, 1],
  [12, 1],
  [2, 2],
  [3, 2],
  [9, 2],
  [10, 2],
  [11, 2],
  [1, 3],
  [6, 3],
  [8, 3],
];

const CHORD_QUALITY_ENTRIES: [ChordPattern, number][] = [
  [MAJOR_CHORD_PATTERN, 1],
  [MINOR_CHORD_PATTERN, 1],
  [DIMINISHED_CHORD_PATTERN, 1],
  [AUGMENTED_CHORD_PATTERN, 1],
  [MAJOR_7_CHORD_PATTERN, 2],
  [MINOR_7_CHORD_PATTERN, 2],
  [DOMINANT_7_CHORD_PATTERN, 3],
  [HALF_DIMINISHED_CHORD_PATTERN, 3],
];

/**
 * Um nome canônico por conjunto de intervalos: Ionian/Aeolian ficam fora do pool
 * porque soam **identicos** a Major/Natural Minor — um distrator não pode ser
 * aurally indistinguível da resposta certa (o usuário ouve certo e o quiz marca
 * errado por ter sorteado o nome "gêmeo").
 */
const SCALE_ENTRIES: [ScalePattern, number][] = [
  [MAJOR_SCALE_PATTERN, 1],
  [NATURAL_MINOR_SCALE_PATTERN, 1],
  [HARMONIC_MINOR_SCALE_PATTERN, 1],
  [MELODIC_MINOR_SCALE_PATTERN, 1],
  [DORIAN_SCALE_PATTERN, 2],
  [MIXOLYDIAN_SCALE_PATTERN, 2],
  [LYDIAN_SCALE_PATTERN, 2],
  [LOCRIAN_SCALE_PATTERN, 3],
  [PHRYGIAN_SCALE_PATTERN, 3],
];

/**
 * Graus da escala (semitons a partir da tônica) ouvidos dentro de uma tonalidade maior.
 * Fácil: notas estáveis da tônica + 4; médio: completa a escala maior; difícil: cromáticos.
 */
const SCALE_DEGREE_ENTRIES: [number, number][] = [
  [0, 1],
  [4, 1],
  [5, 1],
  [7, 1],
  [2, 2],
  [9, 2],
  [11, 2],
  [1, 3],
  [3, 3],
  [6, 3],
  [8, 3],
  [10, 3],
];

/** Rótulo do grau pelo id (semitons): notação de grau, igual em qualquer idioma. */
const SCALE_DEGREE_LABELS: Record<number, string> = {
  0: "1",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♯4",
  7: "5",
  8: "♭6",
  9: "6",
  10: "♭7",
  11: "7",
};

/** Oitavas da tônica no quiz de graus (o baixo da cadência fica uma oitava abaixo). */
const SCALE_DEGREE_TONIC_OCTAVES = [3, 4];

export function scaleDegreeLabel(semitones: number): TermLabel {
  return SCALE_DEGREE_LABELS[semitones] ?? semitones.toString();
}

export type QuizKind = "interval" | "chordQuality" | "scale" | "scaleDegree";

/** Direção do intervalo melódico; "mixed" sorteia por questão. */
export type IntervalDirection = "ascending" | "descending" | "mixed";

export function resolveIntervalDescending(direction: IntervalDirection, random: () => number = Math.random): boolean {
  if (direction === "mixed") return random() < 0.5;

  return direction === "descending";
}

export interface Question {
  kind: QuizKind;
  correctId: string;
  options: QuizOption[];
  /** Sempre ascendentes a partir da fundamental (ou só a nota-alvo, no quiz de graus). */
  pitches: Pitch[];
  playback: "chord" | "sequence" | "cadence";
  /** Intervalo melódico tocado de cima para baixo (aplicado só na hora de tocar). */
  descending?: boolean;
  /** Tônica da tonalidade do quiz de graus: base da cadência e de "ouvir sua resposta". */
  tonic?: Pitch;
}

function randomRootNote(): Note {
  return Note.from(randomChoice(CHROMATIC_SCALE));
}

/**
 * Constrói pitches **estritamente ascendentes** a partir de uma fundamental,
 * uma por semitom-offset, via `Pitch.transpose` (aritmética MIDI). Ao contrário
 * de `Note.transpose` + oitava fixa, nunca "cai" de registro ao cruzar B->C —
 * é o helper único que os três geradores usam para evitar o bug de wrap.
 */
function pitchesFor(root: Note, octave: number, semitoneOffsets: number[]): Pitch[] {
  const rootPitch = Pitch.from(root.value, octave);

  return semitoneOffsets.map((offset) => rootPitch.transpose(offset));
}

export interface GenerateOptions {
  /** Histórico por item: quando presente, o item correto é sorteado com viés para os pontos fracos. */
  stats?: ItemStatsState;
  /** Aleatoriedade [0, 1) do sorteio ponderado — injetável para testes. */
  random?: () => number;
  /** Só para intervalos: direção do intervalo melódico. */
  intervalDirection?: IntervalDirection;
}

/**
 * Sorteia o item correto (ponderado por erro suavizado, com piso — ver `itemWeight`) e 3 distratores.
 * Se o usuário costuma confundir o correto com outro item que está no pool, esse item entra
 * sempre como distrator: é o que torna a prática de discriminação útil.
 */
export function pickItemAndDistractors<T>(
  pool: readonly T[],
  idOf: (item: T) => string,
  kind: QuizKind,
  { stats, random = Math.random }: GenerateOptions = {},
): { correct: T; distractors: T[] } {
  const kindStats = stats?.itemStats?.[kind];
  const correct = pickWeighted(
    pool,
    pool.map((item) => itemWeight(kindStats?.[idOf(item)])),
    random,
  );

  const correctId = idOf(correct);
  const confusedId = topConfusionId(stats?.confusions?.[kind]?.[correctId], pool.map(idOf), correctId);
  const confused = confusedId === null ? undefined : pool.find((item) => idOf(item) === confusedId);

  const others = sampleDistinct(pool, 3, (item) => idOf(item) === correctId || item === confused);
  const distractors = (confused ? [confused, ...others] : others).slice(0, 3);

  return { correct, distractors };
}

function generateIntervalQuestion(difficulty: Difficulty, generate: GenerateOptions): Question {
  const pool = poolForDifficulty(INTERVAL_SEMITONE_ENTRIES, difficulty);
  const root = randomRootNote();
  const { correct: semitones, distractors } = pickItemAndDistractors(pool, String, "interval", generate);

  const options = shuffle(
    [semitones, ...distractors].map((value) => ({ id: value.toString(), label: intervalLabel(value) })),
  );

  return {
    kind: "interval",
    correctId: semitones.toString(),
    options,
    pitches: pitchesFor(root, randomChoice(PLAYBACK_OCTAVES), [0, semitones]),
    playback: "sequence",
    descending: resolveIntervalDescending(generate.intervalDirection ?? "ascending"),
  };
}

function generateChordQualityQuestion(difficulty: Difficulty, generate: GenerateOptions): Question {
  const pool = poolForDifficulty(CHORD_QUALITY_ENTRIES, difficulty);
  const root = randomRootNote();
  const { correct: pattern, distractors } = pickItemAndDistractors(
    pool,
    (item) => item.name,
    "chordQuality",
    generate,
  );

  const options = shuffle(
    [pattern, ...distractors].map((item) => ({ id: item.name, label: chordQualityLabel(item.name) })),
  );

  return {
    kind: "chordQuality",
    correctId: pattern.name,
    options,
    pitches: pitchesFor(
      root,
      randomChoice(PLAYBACK_OCTAVES),
      pattern.degrees.map((degree) => degree.semitones()),
    ),
    playback: "chord",
  };
}

function generateScaleQuestion(difficulty: Difficulty, generate: GenerateOptions): Question {
  const pool = poolForDifficulty(SCALE_ENTRIES, difficulty);
  const root = randomRootNote();
  const { correct: pattern, distractors } = pickItemAndDistractors(pool, (item) => item.name, "scale", generate);

  const options = shuffle(
    [pattern, ...distractors].map((item) => ({ id: item.name, label: scaleLabel(item.name) })),
  );

  // Fecha a sequência com a tônica uma oitava acima, para o contorno soar
  // completo e sempre ascendente (nunca cai de registro ao cruzar B->C).
  const semitoneOffsets = [...pattern.degrees.map((degree) => degree.semitones()), 12];

  return {
    kind: "scale",
    correctId: pattern.name,
    options,
    pitches: pitchesFor(root, randomChoice(PLAYBACK_OCTAVES), semitoneOffsets),
    playback: "sequence",
  };
}

function generateScaleDegreeQuestion(difficulty: Difficulty, generate: GenerateOptions): Question {
  const pool = poolForDifficulty(SCALE_DEGREE_ENTRIES, difficulty);
  const tonic = Pitch.from(randomRootNote().value, randomChoice(SCALE_DEGREE_TONIC_OCTAVES));
  const { correct: semitones, distractors } = pickItemAndDistractors(pool, String, "scaleDegree", generate);

  const options = shuffle(
    [semitones, ...distractors].map((value) => ({ id: value.toString(), label: scaleDegreeLabel(value) })),
  );

  return {
    kind: "scaleDegree",
    correctId: semitones.toString(),
    options,
    pitches: [tonic.transpose(semitones)],
    playback: "cadence",
    tonic,
  };
}

export type ScaleDirection = "ascending" | "descending" | "both";

/**
 * Ordena a escala (gerada sempre ascendente, tônica a tônica) conforme a direção escolhida.
 * "both" sobe e desce sem repetir a tônica aguda.
 */
export function orderScalePitches<T>(ascending: readonly T[], direction: ScaleDirection): T[] {
  const descending = [...ascending].reverse();

  if (direction === "descending") return descending;
  if (direction === "both") return [...ascending, ...descending.slice(1)];

  return [...ascending];
}

export function generateQuestion(
  kind: QuizKind,
  difficulty: Difficulty = "medium",
  options: GenerateOptions = {},
): Question {
  if (kind === "chordQuality") return generateChordQualityQuestion(difficulty, options);
  if (kind === "scale") return generateScaleQuestion(difficulty, options);
  if (kind === "scaleDegree") return generateScaleDegreeQuestion(difficulty, options);

  return generateIntervalQuestion(difficulty, options);
}

/** Rótulo traduzível de um item pelo id estável (semitons, nome do padrão) — para listas fora de uma questão. */
export function labelForItem(kind: QuizKind, id: string): TermLabel {
  if (kind === "interval") return intervalLabel(Number(id));
  if (kind === "chordQuality") return chordQualityLabel(id);
  if (kind === "scaleDegree") return scaleDegreeLabel(Number(id));

  return scaleLabel(id);
}

/** Pitches de um item a partir de uma fundamental — base de `pitchesForOption` e do painel de pontos fracos. */
export function pitchesForItem(kind: QuizKind, id: string, root: Pitch): Pitch[] | null {
  if (kind === "interval") {
    return [root, root.transpose(Number(id))];
  }

  // `root` é a tônica: a resposta é só a nota-alvo (a cadência vem do playback).
  if (kind === "scaleDegree") {
    return [root.transpose(Number(id))];
  }

  if (kind === "chordQuality") {
    const pattern = CHORD_QUALITY_ENTRIES.map(([item]) => item).find((item) => item.name === id);

    return pattern ? pattern.degrees.map((degree) => root.transpose(degree.semitones())) : null;
  }

  const pattern = SCALE_ENTRIES.map(([item]) => item).find((item) => item.name === id);

  return pattern
    ? [...pattern.degrees.map((degree) => root.transpose(degree.semitones())), root.transpose(12)]
    : null;
}

/**
 * Reconstrói as pitches de uma opção específica (não necessariamente a tocada
 * originalmente) para permitir "ouvir sua resposta" vs "ouvir a correta" no
 * feedback de erro. Reusa a mesma fundamental (`question.pitches[0]`) da questão.
 */
export function pitchesForOption(question: Question, optionId: string): Pitch[] {
  return pitchesForItem(question.kind, optionId, question.tonic ?? question.pitches[0]) ?? question.pitches;
}
