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
  passageSignature,
  type Chord,
  type ChordQuality,
  type ScalePattern,
  type SingleNote,
  type SpelledNote,
} from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  harmonicFunctionLabel,
  intervalLabel,
  scaleLabel,
  semitonesLabel,
} from "@/modules/shared/application/music-terms";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";
import { findScalePattern } from "@/modules/shared/application/scale-patterns";

import {
  CHECKPOINT_TONICS,
  explain,
  toOption,
  type CheckpointQuestion,
  type QuestionGenerator,
} from "./checkpoint-kit";
import {
  INTERVALS_GENERATORS,
  NATURAL_MINOR_GENERATORS,
  NOTES_GENERATORS,
  SEVENTH_CHORDS_GENERATORS,
} from "./checkpoint-generators-foundations";
import type { LessonContext } from "./curriculum";
import { READING_ADVANCED_GENERATORS } from "./reading-advanced-checkpoints";
import { READING_PITCH_GENERATORS } from "./reading-pitch-checkpoints";
import { READING_RHYTHM_GENERATORS } from "./reading-rhythm-checkpoints";

export { CHECKPOINT_TONICS };
export type { CheckpointQuestion };

/** Perguntas por checkpoint. */
export const CHECKPOINT_QUESTION_COUNT = 5;

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

function buildScale(ctx: LessonContext) {
  return createScale(Note.from(ctx.root), findScalePattern(ctx.pattern));
}

/** Notas em grafia correta ("D – F – A") de `indexes` (0-based) dentro da escala. */
function spellNotesAt(scale: ReturnType<typeof buildScale>, indexes: number[]): string {
  const spelled: SpelledNote[] = scale.spelledNotes();

  return indexes.map((index) => spelled[index % spelled.length].toString()).join(" – ");
}

/** Índices (0-based, na escala) das notas de uma tríade/sétima empilhada em terças a partir do grau `index`. */
function stackedThirds(index: number, size: 3 | 4): number[] {
  return Array.from({ length: size }, (_, step) => index + step * 2);
}

const THIRD_INTERVAL_NAMES: Record<number, string> = { 3: "minor third", 4: "major third" };
const FIFTH_INTERVAL_NAMES: Record<number, string> = {
  6: "diminished fifth",
  7: "perfect fifth",
  8: "augmented fifth",
};

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
    explanation: explain("degreeName", {
      root: ctx.root,
      notes: degrees.map((item) => `${item.spelled}(${item.degree})`).join(" "),
      degree: degreeNumber,
      note: correct.spelled.toString(),
    }),
  };
}

function degreeOfNoteQuestion(ctx: LessonContext): CheckpointQuestion {
  const degrees = buildScale(ctx).degrees();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = degrees[degreeNumber - 1];

  const choices = NON_TONIC_DEGREES.map(String);
  const distractors = sampleDistinct(choices, 3, (value) => value === String(degreeNumber));

  const options = shuffle([String(degreeNumber), ...distractors].map((value) => toOption(value)));

  return {
    id: "degree-of-note",
    promptKey: "learn.checkpoints.majorScale.degreeOfNote",
    promptParams: { root: ctx.root, note: correct.spelled.toString() },
    options,
    correctId: String(degreeNumber),
    explanation: explain("degreeOfNote", {
      root: ctx.root,
      notes: degrees.map((item) => `${item.spelled}(${item.degree})`).join(" "),
      note: correct.spelled.toString(),
      degree: degreeNumber,
    }),
  };
}

function leadingToneQuestion(ctx: LessonContext): CheckpointQuestion {
  const seventh = buildScale(ctx).degrees()[6];
  const correct = "7";
  const distractors = sampleDistinct(["1", "2", "3", "4", "5", "6"], 3, () => false);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "leading-tone",
    promptKey: "learn.checkpoints.majorScale.leadingTone",
    promptParams: { root: ctx.root },
    options,
    correctId: correct,
    explanation: explain("leadingTone", { root: ctx.root, note: seventh.spelled.toString() }),
  };
}

// ── Tríades ──────────────────────────────────────────────────────────────────

function triadNotesQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const triads = scale.triads();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = triads[degreeNumber - 1];

  const distractors = sampleDistinct(triads, 3, (chord) => chord.degree.toString() === correct.degree.toString());

  const spellTriad = (chord: Chord) => spellNotesAt(scale, stackedThirds(Number(chord.degree.toString()) - 1, 3));

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.degree.toString(), spellTriad(chord))));

  return {
    id: "triad-notes",
    promptKey: "learn.checkpoints.triads.triadNotes",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correct.degree.toString(),
    explanation: explain("triadNotes", {
      degree: degreeNumber,
      root: ctx.root,
      note: correct.spelledRoot?.toString() ?? correct.root.toString(),
      notes: spellTriad(correct),
    }),
  };
}

function triadQualityQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const triads = scale.triads();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = triads[degreeNumber - 1];
  const correctName = triadQualityName(correct.quality);
  const [chordRoot, third, fifth] = correct.notes;
  const thirdSemitones = chordRoot.distanceTo(third);
  const fifthSemitones = chordRoot.distanceTo(fifth);

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
    explanation: explain("triadQuality", {
      degree: degreeNumber,
      root: ctx.root,
      notes: spellNotesAt(scale, stackedThirds(degreeNumber - 1, 3)),
      third: intervalLabel(THIRD_INTERVAL_NAMES[thirdSemitones]),
      thirdSemitones: semitonesLabel(thirdSemitones),
      fifth: intervalLabel(FIFTH_INTERVAL_NAMES[fifthSemitones]),
      fifthSemitones: semitonesLabel(fifthSemitones),
      quality: chordQualityLabel(correctName),
    }),
  };
}

function triadNameQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const triads = scale.triads();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = triads[degreeNumber - 1];

  const distractors = sampleDistinct(triads, 3, (chord) => chord.name === correct.name);

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.name)));

  return {
    id: "triad-name",
    promptKey: "learn.checkpoints.triads.triadName",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correct.name,
    explanation: explain("triadName", {
      degree: degreeNumber,
      root: ctx.root,
      note: correct.spelledRoot?.toString() ?? correct.root.toString(),
      notes: spellNotesAt(scale, stackedThirds(degreeNumber - 1, 3)),
      chord: correct.name,
    }),
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
    explanation: explain("harmonicFunction", {
      root: ctx.root,
      degree: degreeNumber,
      chord: correct.name,
      function: harmonicFunctionLabel(correctName),
      tonic: harmonicFunctionLabel(TONIC.name),
      subdominant: harmonicFunctionLabel(SUBDOMINANT.name),
      dominant: harmonicFunctionLabel(DOMINANT.name),
    }),
  };
}

function dominantDegreeQuestion(ctx: LessonContext): CheckpointQuestion {
  const sevenths = buildScale(ctx).seventhChords();
  const correct = "5";
  const distractors = sampleDistinct(NON_DOMINANT_DEGREES, 3, () => false);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "dominant-degree",
    promptKey: "learn.checkpoints.diatonicField.dominantDegree",
    promptParams: { root: ctx.root },
    options,
    correctId: correct,
    explanation: explain("dominantDegree", {
      root: ctx.root,
      note: sevenths[4].spelledRoot?.toString() ?? sevenths[4].root.toString(),
      chord: sevenths[4].name,
      tonicChord: sevenths[0].name,
    }),
  };
}

function diatonicChordQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const sevenths = scale.seventhChords();
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = sevenths[degreeNumber - 1];

  const distractors = sampleDistinct(sevenths, 3, (chord) => chord.name === correct.name);

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.name)));

  return {
    id: "diatonic-chord",
    promptKey: "learn.checkpoints.diatonicField.diatonicChord",
    promptParams: { degree: degreeNumber, root: ctx.root },
    options,
    correctId: correct.name,
    explanation: explain("diatonicChord", {
      degree: degreeNumber,
      root: ctx.root,
      note: correct.spelledRoot?.toString() ?? correct.root.toString(),
      notes: spellNotesAt(scale, stackedThirds(degreeNumber - 1, 4)),
      chord: correct.name,
    }),
  };
}

// ── ii-V-I ───────────────────────────────────────────────────────────────────

const ROMAN_TO_DEGREE_INDEX: Record<string, number> = { ii: 1, V: 4, I: 0 };

function chordNameQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const sevenths = scale.seventhChords();
  const roman = randomChoice(Object.keys(ROMAN_TO_DEGREE_INDEX));
  const degreeIndex = ROMAN_TO_DEGREE_INDEX[roman];
  const correct = sevenths[degreeIndex];

  const distractors = sampleDistinct(sevenths, 3, (chord) => chord.name === correct.name);

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.name, chord.name)));

  return {
    id: "chord-name",
    promptKey: "learn.checkpoints.twoFiveOne.chordName",
    promptParams: { roman, root: ctx.root },
    options,
    correctId: correct.name,
    explanation: explain("chordName", {
      root: ctx.root,
      roman,
      degree: degreeIndex + 1,
      note: correct.spelledRoot?.toString() ?? correct.root.toString(),
      notes: spellNotesAt(scale, stackedThirds(degreeIndex, 4)),
      chord: correct.name,
    }),
  };
}

/** Qualidade (nome no domínio) do acorde com sétima de cada grau do ii-V-I. */
const ROMAN_QUALITY_NAMES: Record<string, string> = { ii: "Minor 7th", V: "Dominant 7th", I: "Major 7th" };

const SEVENTH_QUALITY_NAMES = [...Object.values(ROMAN_QUALITY_NAMES), "Half-diminished 7th"];

function romanQualityQuestion(ctx: LessonContext): CheckpointQuestion {
  const scale = buildScale(ctx);
  const sevenths = scale.seventhChords();
  const roman = randomChoice(Object.keys(ROMAN_TO_DEGREE_INDEX));
  const degreeIndex = ROMAN_TO_DEGREE_INDEX[roman];
  const correctName = ROMAN_QUALITY_NAMES[roman];

  const distractorNames = sampleDistinct(SEVENTH_QUALITY_NAMES, 3, (name) => name === correctName);

  const options = shuffle(
    [correctName, ...distractorNames].map((name) => toOption(name, chordQualityLabel(name))),
  );

  return {
    id: "roman-quality",
    promptKey: "learn.checkpoints.twoFiveOne.romanQuality",
    promptParams: { roman, root: ctx.root },
    options,
    correctId: correctName,
    explanation: explain("romanQuality", {
      roman,
      root: ctx.root,
      chord: sevenths[degreeIndex].name,
      notes: spellNotesAt(scale, stackedThirds(degreeIndex, 4)),
      quality: chordQualityLabel(correctName),
    }),
  };
}

function completeProgressionQuestion(ctx: LessonContext): CheckpointQuestion {
  const sevenths = buildScale(ctx).seventhChords();
  const correct = sevenths[0];
  const sequence = [1, 4].map((index) => sevenths[index].name).join(" – ");

  const distractors = sampleDistinct(sevenths, 3, (chord) => chord.name === correct.name);

  const options = shuffle([correct, ...distractors].map((chord) => toOption(chord.name)));

  return {
    id: "complete-progression",
    promptKey: "learn.checkpoints.twoFiveOne.completeProgression",
    promptParams: { sequence, root: ctx.root },
    options,
    correctId: correct.name,
    explanation: explain("completeProgression", { sequence, root: ctx.root, chord: correct.name }),
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
  const expected = [1, 4, 0].map((index) => sevenths[index].name).join(" – ");

  const options = shuffle([toOption("yes", { key: "common.yes" }), toOption("no", { key: "common.no" })]);

  return {
    id: "is-progression",
    promptKey: "learn.checkpoints.twoFiveOne.isProgression",
    promptParams: { sequence, root: ctx.root },
    options,
    correctId: isProgression ? "yes" : "no",
    explanation: isProgression
      ? explain("isProgressionYes", { root: ctx.root, sequence })
      : explain("isProgressionNo", {
          root: ctx.root,
          sequence,
          expected,
          degrees: chords.map((chord) => chord.degree.toString()).join(", "),
        }),
  };
}

// ── Modos ────────────────────────────────────────────────────────────────────

function modeDegreeIndex(pattern: ScalePattern): number {
  const index = MAJOR_SCALE_MODE_PATTERNS.findIndex((item) => item.name === pattern.name);
  return index >= 0 ? index : 0;
}

/** Semitons entre a tônica do tom-pai maior e a tônica do modo (0 para o próprio maior/Jônio). */
function modeOffset(pattern: ScalePattern): number {
  return MAJOR_SCALE_PATTERN.degrees[modeDegreeIndex(pattern)].semitones();
}

/** Tom-pai maior do contexto (o contexto de modos guarda a tônica do modo, não a do tom-pai). */
function parentRootOf(ctx: LessonContext): Note {
  return Note.from(ctx.root).transpose(-modeOffset(findScalePattern(ctx.pattern)));
}

/** Evita tônicas que o domínio só sabe grafar com dobrados sustenidos (ex.: A# Lídio, de F maior). */
function isCleanlySpelled(root: SingleNote, patternName: string): boolean {
  return createScale(Note.from(root), findScalePattern(patternName))
    .spelledNotes()
    .every((note) => Math.abs(note.accidental) <= 1);
}

function listNotes(notes: SpelledNote[]): string {
  return notes.map((note) => note.toString()).join(" ");
}

function modeOfMajorQuestion(ctx: LessonContext): CheckpointQuestion {
  const pattern = findScalePattern(ctx.pattern);
  const index = modeDegreeIndex(pattern);
  const parentRoot = parentRootOf(ctx);

  const distractors = sampleDistinct(
    ["C", "D", "E", "F", "G", "A", "B"] as const,
    3,
    (value) => Note.from(value).equals(parentRoot),
  );

  const options = shuffle(
    [parentRoot.value, ...distractors].map((value) => toOption(value, value)),
  );
  const parentNotes = listNotes(createScale(parentRoot, MAJOR_SCALE_PATTERN).spelledNotes());

  return {
    id: "mode-of-major",
    promptKey: "learn.checkpoints.modes.modeOfMajor",
    promptParams: { tonic: ctx.root, pattern: scaleLabel(pattern.name), degree: index + 1 },
    options,
    correctId: parentRoot.value,
    explanation: explain("modeOfMajor", {
      tonic: ctx.root,
      degree: index + 1,
      parent: parentRoot.value,
      parentNotes,
      pattern: scaleLabel(pattern.name),
    }),
  };
}

/** Pares (modo, escala de referência) que diferem em UMA única nota — a pergunta tem resposta inequívoca. */
export const SINGLE_DIFFERENCE_MODE_PAIRS: readonly (readonly [string, string])[] = [
  ["Dorian", "Aeolian"],
  ["Phrygian", "Aeolian"],
  ["Lydian", "Major"],
  ["Mixolydian", "Major"],
  ["Locrian", "Phrygian"],
];

function changingNoteQuestion(
  ctx: LessonContext,
  referenceName: string = AEOLIAN_SCALE_PATTERN.name,
): CheckpointQuestion {
  const pattern = findScalePattern(ctx.pattern);
  const reference = findScalePattern(referenceName);
  const tonic = Note.from(ctx.root);

  const notesA = createScale(tonic, pattern).spelledNotes();
  const notesB = createScale(tonic, reference).spelledNotes();

  const differingIndex = notesA.findIndex((note, index) => note.toString() !== notesB[index]?.toString());
  const safeIndex = differingIndex >= 0 ? differingIndex : 0;

  const correct = notesA[safeIndex].toString();
  const distractors = sampleDistinct(notesA.map((note) => note.toString()), 3, (value) => value === correct);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "changing-note",
    promptKey: "learn.checkpoints.modes.changingNote",
    promptParams: { root: ctx.root, pattern: scaleLabel(pattern.name), reference: scaleLabel(reference.name) },
    options,
    correctId: correct,
    explanation: explain("changingNote", {
      root: ctx.root,
      pattern: scaleLabel(pattern.name),
      reference: scaleLabel(reference.name),
      notesA: listNotes(notesA),
      notesB: listNotes(notesB),
      degree: safeIndex + 1,
      noteA: correct,
      noteB: notesB[safeIndex].toString(),
    }),
  };
}

/** Outro modo (≠ Jônio) do MESMO tom-pai do contexto — mantém o conjunto coerente em um só tom. */
function randomModeQuestion(ctx: LessonContext): CheckpointQuestion {
  const parent = parentRootOf(ctx);
  const candidates = MAJOR_SCALE_MODE_PATTERNS.slice(1).filter((pattern) =>
    isCleanlySpelled(parent.transpose(modeOffset(pattern)).value, pattern.name),
  );
  const pattern = randomChoice(candidates);

  return modeOfMajorQuestion({ root: parent.transpose(modeOffset(pattern)).value, pattern: pattern.name });
}

function randomChangingNoteQuestion(ctx: LessonContext): CheckpointQuestion {
  const parent = parentRootOf(ctx);
  const candidates = SINGLE_DIFFERENCE_MODE_PAIRS.filter(([mode, reference]) => {
    const tonic = parent.transpose(modeOffset(findScalePattern(mode))).value;

    return isCleanlySpelled(tonic, mode) && isCleanlySpelled(tonic, reference);
  });
  const [mode, reference] = randomChoice(candidates);

  return changingNoteQuestion({ root: parent.transpose(modeOffset(findScalePattern(mode))).value, pattern: mode }, reference);
}

function modeAtDegreeQuestion(ctx: LessonContext): CheckpointQuestion {
  const parent = parentRootOf(ctx);
  const parentScale = createScale(parent, MAJOR_SCALE_PATTERN);
  const degreeNumber = randomChoice(NON_TONIC_DEGREES);
  const correct = MAJOR_SCALE_MODE_PATTERNS[degreeNumber - 1];

  const distractors = sampleDistinct(MAJOR_SCALE_MODE_PATTERNS, 3, (pattern) => pattern.name === correct.name);

  const options = shuffle(
    [correct, ...distractors].map((pattern) => toOption(pattern.name, scaleLabel(pattern.name))),
  );

  return {
    id: "mode-at-degree",
    promptKey: "learn.checkpoints.modes.modeAtDegree",
    promptParams: { degree: degreeNumber, parent: parent.value },
    options,
    correctId: correct.name,
    explanation: explain("modeAtDegree", {
      parent: parent.value,
      parentNotes: listNotes(parentScale.spelledNotes()),
      degree: degreeNumber,
      tonic: parentScale.spelledNotes()[degreeNumber - 1].toString(),
      pattern: scaleLabel(correct.name),
    }),
  };
}

// ── Montagem do checkpoint ───────────────────────────────────────────────────

const CHECKPOINT_GENERATORS: Record<string, QuestionGenerator[]> = {
  notes: NOTES_GENERATORS,
  intervals: INTERVALS_GENERATORS,
  "major-scale": [degreeNameQuestion, leadingToneQuestion, degreeOfNoteQuestion],
  triads: [triadNotesQuestion, triadQualityQuestion, triadNameQuestion],
  "seventh-chords": SEVENTH_CHORDS_GENERATORS,
  "diatonic-field": [harmonicFunctionQuestion, dominantDegreeQuestion, diatonicChordQuestion],
  "two-five-one": [chordNameQuestion, isProgressionQuestion, romanQualityQuestion, completeProgressionQuestion],
  "natural-minor": NATURAL_MINOR_GENERATORS,
  modes: [
    (ctx) => modeOfMajorQuestion(ctx),
    (ctx) => changingNoteQuestion(ctx),
    randomModeQuestion,
    randomChangingNoteQuestion,
    modeAtDegreeQuestion,
  ],
  ...READING_PITCH_GENERATORS,
  ...READING_RHYTHM_GENERATORS,
  ...READING_ADVANCED_GENERATORS,
};

/** Identidade do enunciado: dois perguntas com a mesma assinatura seriam "a mesma pergunta". */
export function promptSignature(question: CheckpointQuestion): string {
  const base = `${question.promptKey}|${JSON.stringify(question.promptParams ?? {})}`;

  return question.staff ? `${base}|${passageSignature(question.staff)}` : base;
}

/**
 * Sorteia o tom do checkpoint entre `CHECKPOINT_TONICS`. Para lições de modo, sorteia o tom-pai e
 * mantém a relação (ex.: Dórico no 2º grau do tom sorteado), então o conjunto fica coerente.
 */
function withRandomTonic(ctx: LessonContext): LessonContext {
  const parent = Note.from(randomChoice(CHECKPOINT_TONICS));
  const offset = modeOffset(findScalePattern(ctx.pattern));

  return { ...ctx, root: parent.transpose(offset).value };
}

const MAX_ATTEMPTS_PER_QUESTION = 12;

/** Tenta gerar uma pergunta cujo enunciado ainda não foi usado; `null` quando o gerador esgotou as variantes. */
function generateUnique(generate: QuestionGenerator, ctx: LessonContext, seen: Set<string>): CheckpointQuestion | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_QUESTION; attempt++) {
    const question = generate(ctx);
    if (!seen.has(promptSignature(question))) return question;
  }

  return null;
}

/**
 * Monta um checkpoint de `CHECKPOINT_QUESTION_COUNT` perguntas sem enunciados repetidos, em rodízio
 * entre os geradores da lição (cada tipo de pergunta aparece antes de qualquer um se repetir) e
 * todas no mesmo tom — sorteado a cada chamada, então "Refazer" traz um conjunto novo.
 */
export function generateCheckpoint(
  lessonId: string,
  ctx: LessonContext,
  count: number = CHECKPOINT_QUESTION_COUNT,
): CheckpointQuestion[] {
  const generators = CHECKPOINT_GENERATORS[lessonId] ?? [];
  if (generators.length === 0) return [];

  const attemptCtx = withRandomTonic(ctx);
  const seen = new Set<string>();
  const questions: CheckpointQuestion[] = [];

  let rotation = shuffle(generators);
  while (questions.length < count && rotation.length > 0) {
    const stillAvailable: QuestionGenerator[] = [];

    for (const generate of rotation) {
      if (questions.length >= count) break;

      const question = generateUnique(generate, attemptCtx, seen);
      if (!question) continue;

      seen.add(promptSignature(question));
      questions.push(question);
      stillAvailable.push(generate);
    }

    rotation = stillAvailable;
  }

  return shuffle(questions);
}
