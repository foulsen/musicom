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
} from "@/modules/shared/application/music-terms";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";
import type { QuizOption } from "@/modules/shared/application/quiz";

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

export type QuizKind = "interval" | "chordQuality" | "scale";

export interface Question {
  kind: QuizKind;
  correctId: string;
  options: QuizOption[];
  pitches: Pitch[];
  playback: "chord" | "sequence";
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

function generateIntervalQuestion(difficulty: Difficulty): Question {
  const pool = poolForDifficulty(INTERVAL_SEMITONE_ENTRIES, difficulty);
  const root = randomRootNote();
  const semitones = randomChoice(pool);

  const distractors = sampleDistinct(pool, 3, (value) => value === semitones);

  const options = shuffle(
    [semitones, ...distractors].map((value) => ({ id: value.toString(), label: intervalLabel(value) })),
  );

  return {
    kind: "interval",
    correctId: semitones.toString(),
    options,
    pitches: pitchesFor(root, randomChoice(PLAYBACK_OCTAVES), [0, semitones]),
    playback: "sequence",
  };
}

function generateChordQualityQuestion(difficulty: Difficulty): Question {
  const pool = poolForDifficulty(CHORD_QUALITY_ENTRIES, difficulty);
  const root = randomRootNote();
  const pattern = randomChoice(pool);

  const distractors = sampleDistinct(pool, 3, (item) => item.name === pattern.name);

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

function generateScaleQuestion(difficulty: Difficulty): Question {
  const pool = poolForDifficulty(SCALE_ENTRIES, difficulty);
  const root = randomRootNote();
  const pattern = randomChoice(pool);

  const distractors = sampleDistinct(pool, 3, (item) => item.name === pattern.name);

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

export function generateQuestion(kind: QuizKind, difficulty: Difficulty = "medium"): Question {
  if (kind === "chordQuality") return generateChordQualityQuestion(difficulty);
  if (kind === "scale") return generateScaleQuestion(difficulty);

  return generateIntervalQuestion(difficulty);
}

/**
 * Reconstrói as pitches de uma opção específica (não necessariamente a tocada
 * originalmente) para permitir "ouvir sua resposta" vs "ouvir a correta" no
 * feedback de erro. Reusa a mesma fundamental (`question.pitches[0]`) da questão.
 */
export function pitchesForOption(question: Question, optionId: string): Pitch[] {
  const root = question.pitches[0];

  if (question.kind === "interval") {
    return [root, root.transpose(Number(optionId))];
  }

  if (question.kind === "chordQuality") {
    const pattern = CHORD_QUALITY_ENTRIES.map(([item]) => item).find((item) => item.name === optionId);
    if (!pattern) return question.pitches;

    return pattern.degrees.map((degree) => root.transpose(degree.semitones()));
  }

  const pattern = SCALE_ENTRIES.map(([item]) => item).find((item) => item.name === optionId);
  if (!pattern) return question.pitches;

  return [...pattern.degrees.map((degree) => root.transpose(degree.semitones())), root.transpose(12)];
}
