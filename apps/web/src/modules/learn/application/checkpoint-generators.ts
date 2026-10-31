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
  type SpelledNote,
} from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  harmonicFunctionLabel,
  intervalLabel,
  scaleLabel,
  semitonesLabel,
  type LabelRef,
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
  /** Raciocínio por trás da resposta, montado a partir dos dados do domínio — exibido após responder. */
  explanation: LabelRef;
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

function explain(name: string, params: Record<string, string | number | TermLabel> = {}): LabelRef {
  return { key: `learn.explanations.${name}`, params };
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
  const parentNotes = createScale(parentRoot, MAJOR_SCALE_PATTERN)
    .spelledNotes()
    .map((note) => note.toString())
    .join(" ");

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
  const listNotes = (notes: SpelledNote[]) => notes.map((note) => note.toString()).join(" ");
  const distractors = sampleDistinct(notesA.map((note) => note.toString()), 3, (value) => value === correct);

  const options = shuffle([correct, ...distractors].map((value) => toOption(value, value)));

  return {
    id: "changing-note",
    promptKey: "learn.checkpoints.modes.changingNote",
    promptParams: { root: ctx.root, pattern: scaleLabel(pattern.name) },
    options,
    correctId: correct,
    explanation: explain("changingNote", {
      root: ctx.root,
      pattern: scaleLabel(pattern.name),
      reference: scaleLabel(AEOLIAN_SCALE_PATTERN.name),
      notesA: listNotes(notesA),
      notesB: listNotes(notesB),
      degree: safeIndex + 1,
      noteA: correct,
      noteB: notesB[safeIndex].toString(),
    }),
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
