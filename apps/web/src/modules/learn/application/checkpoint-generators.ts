import {
  AEOLIAN_SCALE_PATTERN,
  DOMINANT,
  MAJOR_SCALE_MODE_PATTERNS,
  MAJOR_SCALE_PATTERN,
  Note,
  SUBDOMINANT,
  TONIC,
  createScale,
  detectTwoFiveOne,
  type Chord,
  type ChordQuality,
  type ScalePattern,
} from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  harmonicFunctionLabel,
  scaleLabel,
  type TermLabel,
} from "@/modules/shared/application/music-terms";
import type { QuizOption } from "@/modules/shared/application/quiz";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";
import { findScalePattern } from "@/modules/shared/application/scale-patterns";

import type { LessonContext } from "./curriculum";

export interface CheckpointQuestion {
  id: string;
  promptKey: string;
  /** Parâmetros do prompt; nomes de escala etc. vão como `TermLabel` e são traduzidos na renderização. */
  promptParams?: Record<string, string | number | TermLabel>;
  options: QuizOption[];
  correctId: string;
}

/** Graus não-tônicos: perguntar sobre o 1º grau é trivial demais para um checkpoint. */
const NON_TONIC_DEGREES = [2, 3, 4, 5, 6, 7];

/** Símbolo da qualidade -> nome do padrão no domínio (id estável da opção; o rótulo é traduzido na renderização). */
const TRIAD_QUALITY_NAMES: Record<string, string> = {
  "": "Major",
  m: "Minor",
  dim: "Diminished",
  aug: "Augmented",
};

function triadQualityName(quality: ChordQuality): string {
  return TRIAD_QUALITY_NAMES[quality.toString()] ?? quality.toString();
}

function toOption(id: string, label: TermLabel = id): QuizOption {
  return { id, label };
}

function buildScale(ctx: LessonContext) {
  return createScale(Note.from(ctx.root), findScalePattern(ctx.pattern));
}

// ── Escala maior & graus ────────────────────────────────────────────────────

function degreeNameQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const degrees = scale.degrees();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = degrees[degreeNumber - 1];

  const distractors = sampleDistinct(degrees, 3, (item) => item.degree.toString() === correct.degree.toString());

  const options = shuffle(
    [correct, ...distractors].map((item) => toOption(item.degree.toString(), item.spelled.toString())),
  );

  return {
    id: "degree-name",
    promptKey: "learn.checkpoints.majorScale.degreeName",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correct.degree.toString(),
  };
}

function leadingToneQuestion(ctx: LessonContext): CheckpointQuestion {
  const correct = "7";
  const distractors = sampleDistinct(["1", "2", "3", "4", "5", "6"], 3, () => false);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "leading-tone",
    promptKey: "learn.checkpoints.majorScale.leadingTone",
    promptParams: { root: ctx.root },
    options,
    correctId: correct,
  };
}

// ── Tríades ──────────────────────────────────────────────────────────────────

function triadNotesQuestion(ctx: LessonContext): CheckpointQuestion {
  const triads = buildScale(ctx).triads();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = triads[degreeNumber - 1];

  const distractors = sampleDistinct(triads, 3, (chord) => chord.degree.toString() === correct.degree.toString());

  const options = shuffle(
    [correct, ...distractors].map((chord) =>
      toOption(chord.degree.toString(), chord.spelledNotes.map((note) => note.toString()).join(" - ")),
    ),
  );

  return {
    id: "triad-notes",
    promptKey: "learn.checkpoints.triads.triadNotes",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correct.degree.toString(),
  };
}

function triadQualityQuestion(ctx: LessonContext): CheckpointQuestion {
  const triads = buildScale(ctx).triads();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = triads[degreeNumber - 1];
  const correctName = triadQualityName(correct.quality);

  const distractorNames = sampleDistinct(
    Object.values(TRIAD_QUALITY_NAMES),
    3,
    (name) => name === correctName,
  );

  const options = shuffle(
    [correctName, ...distractorNames].map((name) => toOption(name, chordQualityLabel(name))),
  );

  return {
    id: "triad-quality",
    promptKey: "learn.checkpoints.triads.triadQuality",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correctName,
  };
}

// ── Campo diatônico ──────────────────────────────────────────────────────────

const HARMONIC_FUNCTION_NAMES = [TONIC.name, SUBDOMINANT.name, DOMINANT.name];

/** Graus sem função Dominante — pool de distratores seguro para `dominantDegreeQuestion`. */
const NON_DOMINANT_DEGREES = ["1", "2", "3", "4", "6"];

function harmonicFunctionQuestion(ctx: LessonContext): CheckpointQuestion {
  const sevenths = buildScale(ctx).seventhChords();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = sevenths[degreeNumber - 1];
  const correctName = correct.harmonicFunction?.name ?? TONIC.name;

  const distractorNames = sampleDistinct(HARMONIC_FUNCTION_NAMES, 2, (name) => name === correctName);

  const options = shuffle(
    [correctName, ...distractorNames].map((name) => toOption(name, harmonicFunctionLabel(name))),
  );

  return {
    id: "harmonic-function",
    promptKey: "learn.checkpoints.diatonicField.harmonicFunction",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correctName,
  };
}

function dominantDegreeQuestion(ctx: LessonContext): CheckpointQuestion {
  const correct = "5";
  const distractors = sampleDistinct(NON_DOMINANT_DEGREES, 3, () => false);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "dominant-degree",
    promptKey: "learn.checkpoints.diatonicField.dominantDegree",
    promptParams: { root: ctx.root },
    options,
    correctId: correct,
  };
}

// ── ii-V-I ───────────────────────────────────────────────────────────────────

const ROMAN_TO_DEGREE_INDEX: Record<string, number> = { ii: 1, V: 4, I: 0 };

function chordNameQuestion(ctx: LessonContext): CheckpointQuestion {
  const sevenths = buildScale(ctx).seventhChords();
  const roman = randomChoice(Object.keys(ROMAN_TO_DEGREE_INDEX));
  const correct = sevenths[ROMAN_TO_DEGREE_INDEX[roman]];

  const distractors = sampleDistinct(sevenths, 3, (chord) => chord.name === correct.name);

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.name, chord.name)));

  return {
    id: "chord-name",
    promptKey: "learn.checkpoints.twoFiveOne.chordName",
    promptParams: { roman, root: ctx.root },
    options,
    correctId: correct.name,
  };
}

/** Três graus (1-based) que, em ordem, NÃO formam um ii-V-I — usado como fallback do distrator. */
const SAFE_NON_PROGRESSION_DEGREES = [1, 3, 5];

function isProgressionQuestion(ctx: LessonContext): CheckpointQuestion {
  const sevenths = buildScale(ctx).seventhChords();
  const showPositive = Math.random() < 0.5;

  let chords: Chord[];
  if (showPositive) {
    chords = [1, 4, 0].map((index) => sevenths[index]);
  } else {
    const degrees = sampleDistinct([1, 2, 3, 4, 5, 6, 7], 3, () => false);
    const candidate = degrees.map((degree) => sevenths[degree - 1]);
    const isAccidentallyTwoFiveOne = detectTwoFiveOne(candidate).length > 0;

    chords = isAccidentallyTwoFiveOne
      ? SAFE_NON_PROGRESSION_DEGREES.map((degree) => sevenths[degree - 1])
      : candidate;
  }

  const isProgression = detectTwoFiveOne(chords).length > 0;
  const sequence = chords.map((chord) => chord.name).join(" – ");

  const options = shuffle([toOption("yes", { key: "common.yes" }), toOption("no", { key: "common.no" })]);

  return {
    id: "is-progression",
    promptKey: "learn.checkpoints.twoFiveOne.isProgression",
    promptParams: { sequence, root: ctx.root },
    options,
    correctId: isProgression ? "yes" : "no",
  };
}

// ── Modos ────────────────────────────────────────────────────────────────────

function modeDegreeIndex(pattern: ScalePattern): number {
  const index = MAJOR_SCALE_MODE_PATTERNS.findIndex((item) => item.name === pattern.name);
  return index >= 0 ? index : 0;
}

function modeOfMajorQuestion(ctx: LessonContext): CheckpointQuestion {
  const pattern = findScalePattern(ctx.pattern);
  const index = modeDegreeIndex(pattern);
  const offset = MAJOR_SCALE_PATTERN.degrees[index].semitones();
  const tonic = Note.from(ctx.root);
  const parentRoot = tonic.transpose(-offset);

  const distractors = sampleDistinct(
    ["C", "D", "E", "F", "G", "A", "B"] as const,
    3,
    (value) => Note.from(value).equals(parentRoot),
  );

  const options = shuffle(
    [parentRoot.value, ...distractors].map((value) => toOption(value, value)),
  );

  return {
    id: "mode-of-major",
    promptKey: "learn.checkpoints.modes.modeOfMajor",
    promptParams: { tonic: ctx.root, pattern: scaleLabel(pattern.name), degree: index + 1 },
    options,
    correctId: parentRoot.value,
  };
}

function changingNoteQuestion(ctx: LessonContext): CheckpointQuestion {
  const pattern = findScalePattern(ctx.pattern);
  const tonic = Note.from(ctx.root);

  const scaleA = createScale(tonic, pattern);
  const scaleB = createScale(tonic, AEOLIAN_SCALE_PATTERN);

  const notesA = scaleA.spelledNotes();
  const notesB = scaleB.spelledNotes();

  const differingIndex = notesA.findIndex((note, index) => note.toString() !== notesB[index]?.toString());
  const safeIndex = differingIndex >= 0 ? differingIndex : 0;

  const correct = notesA[safeIndex].toString();
  const distractors = sampleDistinct(notesA.map((note) => note.toString()), 3, (value) => value === correct);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "changing-note",
    promptKey: "learn.checkpoints.modes.changingNote",
    promptParams: { root: ctx.root, pattern: scaleLabel(pattern.name) },
    options,
    correctId: correct,
  };
}

const CHECKPOINT_GENERATORS: Record<string, ((ctx: LessonContext) => CheckpointQuestion)[]> = {
  "major-scale": [degreeNameQuestion, leadingToneQuestion],
  triads: [triadNotesQuestion, triadQualityQuestion],
  "diatonic-field": [harmonicFunctionQuestion, dominantDegreeQuestion],
  "two-five-one": [chordNameQuestion, isProgressionQuestion],
  modes: [modeOfMajorQuestion, changingNoteQuestion],
};

export function generateCheckpoint(lessonId: string, ctx: LessonContext): CheckpointQuestion[] {
  const generators = CHECKPOINT_GENERATORS[lessonId] ?? [];

  return generators.map((generate) => generate(ctx));
}
