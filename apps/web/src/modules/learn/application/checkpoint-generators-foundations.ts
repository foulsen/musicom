import {
  DOMINANT_7_CHORD_PATTERN,
  DORIAN_SCALE_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MAJOR_SCALE_PATTERN,
  MINOR_7_CHORD_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  Note,
  PHRYGIAN_SCALE_PATTERN,
  createChord,
  createScale,
  type ChordPattern,
  type ScalePattern,
  type SingleNote,
  type SpelledNote,
} from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  intervalDomainName,
  intervalLabel,
  semitonesLabel,
} from "@/modules/shared/application/music-terms";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";

import { CHECKPOINT_TONICS, explain, toOption, type CheckpointQuestion, type QuestionGenerator } from "./checkpoint-kit";
import type { LessonContext } from "./curriculum";
import { spellIntervalAbove } from "./interval-notes";

/**
 * Pools de perguntas das lições de base (notas, intervalos, acordes de sétima, menor natural).
 * Tudo é derivado do domínio — notas via `Note`, intervalos via `Interval`/`SpelledNote.spell`,
 * acordes e escalas via `createChord`/`createScale` — e as chaves de texto vivem em `learn.*`.
 */

// ── Notas, tons e semitons ───────────────────────────────────────────────────

const NATURAL_NOTES: SingleNote[] = ["C", "D", "E", "F", "G", "A", "B"];

/** O domínio nomeia as teclas pretas só com sustenido; o nome com bemol é a outra grafia da mesma tecla. */
const FLAT_NAME: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
const SHARP_NAMES = Object.keys(FLAT_NAME);
const FLAT_NAMES = Object.values(FLAT_NAME);

/** "F#/Gb" para teclas pretas (as duas grafias servem), a letra pura para as naturais. */
function noteLabel(note: Note): string {
  const flat = FLAT_NAME[note.value];

  return flat ? `${note.value}/${flat}` : note.value;
}

/** Caminho tecla a tecla, de `from` por `semitones` (negativo = para baixo): "E → F → F#/Gb". */
function chromaticPath(from: Note, semitones: number): string {
  const direction = Math.sign(semitones);

  return Array.from({ length: Math.abs(semitones) + 1 }, (_, step) => noteLabel(from.transpose(direction * step))).join(" → ");
}

function noteBySemitonesQuestion(): CheckpointQuestion {
  const base = Note.from(randomChoice(NATURAL_NOTES));
  const offset = randomChoice([1, -1]) * randomChoice([1, 2]);
  const answer = base.transpose(offset);

  // distratores: as outras teclas vizinhas (até 3 semitons para qualquer lado)
  const neighbours = [-3, -2, -1, 1, 2, 3].filter((step) => step !== offset).map((step) => base.transpose(step));
  const options = shuffle([answer, ...sampleDistinct(neighbours, 3, () => false)].map((note) => toOption(note.value, noteLabel(note))));
  const direction = offset > 0 ? "Above" : "Below";
  const distance = semitonesLabel(Math.abs(offset));

  return {
    id: "note-by-semitones",
    promptKey: `learn.checkpoints.notes.note${direction}`,
    promptParams: { distance, note: base.value },
    options,
    correctId: answer.value,
    explanation: explain(`note${direction}`, {
      distance,
      note: base.value,
      path: chromaticPath(base, offset),
      answer: noteLabel(answer),
    }),
  };
}

function semitonesBetweenQuestion(): CheckpointQuestion {
  const [from, to] = sampleDistinct(NATURAL_NOTES, 2, () => false).map((value) => Note.from(value));
  const distance = from.distanceTo(to);

  // distratores: os números mais próximos da resposta (erro de contagem de 1 ou 2 é o mais comum)
  const nearest = Array.from({ length: 11 }, (_, index) => index + 1)
    .filter((value) => value !== distance)
    .sort((a, b) => Math.abs(a - distance) - Math.abs(b - distance) || a - b)
    .slice(0, 4);
  const options = shuffle([distance, ...sampleDistinct(nearest, 3, () => false)].map((value) => toOption(String(value))));

  return {
    id: "semitones-between",
    promptKey: "learn.checkpoints.notes.semitonesBetween",
    promptParams: { from: from.value, to: to.value },
    options,
    correctId: String(distance),
    explanation: explain("semitonesBetween", {
      from: from.value,
      to: to.value,
      path: chromaticPath(from, distance),
      semitones: semitonesLabel(distance),
    }),
  };
}

function toneOrSemitoneQuestion(): CheckpointQuestion {
  const index = NATURAL_NOTES.indexOf(randomChoice(NATURAL_NOTES));
  const from = Note.from(NATURAL_NOTES[index]);
  const to = Note.from(NATURAL_NOTES[(index + 1) % NATURAL_NOTES.length]);
  const isSemitone = from.distanceTo(to) === 1;

  const options = shuffle([
    toOption("semitone", { key: "learn.options.semitone" }),
    toOption("tone", { key: "learn.options.tone" }),
  ]);

  return {
    id: "tone-or-semitone",
    promptKey: "learn.checkpoints.notes.toneOrSemitone",
    promptParams: { from: from.value, to: to.value },
    options,
    correctId: isSemitone ? "semitone" : "tone",
    explanation: isSemitone
      ? explain("halfStep", { from: from.value, to: to.value })
      : explain("wholeStep", { from: from.value, to: to.value, between: noteLabel(from.transpose(1)) }),
  };
}

function enharmonicQuestion(): CheckpointQuestion {
  const sharp = randomChoice(SHARP_NAMES);
  const flat = FLAT_NAME[sharp];
  const showSharp = Math.random() < 0.5;
  const correct = showSharp ? flat : sharp;

  const options = shuffle(
    [correct, ...sampleDistinct(showSharp ? FLAT_NAMES : SHARP_NAMES, 3, (name) => name === correct)].map((name) => toOption(name)),
  );
  const lower = sharp[0] as SingleNote;

  return {
    id: "enharmonic",
    promptKey: "learn.checkpoints.notes.enharmonic",
    promptParams: { note: showSharp ? sharp : flat },
    options,
    correctId: correct,
    explanation: explain("enharmonic", {
      sharp,
      flat,
      lower,
      upper: NATURAL_NOTES[(NATURAL_NOTES.indexOf(lower) + 1) % NATURAL_NOTES.length],
    }),
  };
}

function noteCountQuestion(): CheckpointQuestion {
  const correct = 12;
  const options = shuffle([correct, ...sampleDistinct([5, 7, 8, 10, 14, 24], 3, () => false)].map((value) => toOption(String(value))));

  return {
    id: "note-count",
    promptKey: "learn.checkpoints.notes.noteCount",
    options,
    correctId: String(correct),
    explanation: explain("noteCount"),
  };
}

export const NOTES_GENERATORS: QuestionGenerator[] = [
  noteBySemitonesQuestion,
  semitonesBetweenQuestion,
  toneOrSemitoneQuestion,
  enharmonicQuestion,
  noteCountQuestion,
];

// ── Intervalos ───────────────────────────────────────────────────────────────

/** Intervalos da lição (2ª, 3ª, 4ª, 5ª); a oitava só entra nas perguntas sem par de notas. */
const LEARNED_INTERVALS = [1, 2, 3, 4, 5, 7];
const LEARNED_INTERVALS_WITH_OCTAVE = [...LEARNED_INTERVALS, 12];

function intervalBetweenQuestion(): CheckpointQuestion {
  const root = randomChoice(CHECKPOINT_TONICS);
  const semitones = randomChoice(LEARNED_INTERVALS);
  const upper = spellIntervalAbove(root, semitones).toString();

  const options = shuffle(
    [semitones, ...sampleDistinct(LEARNED_INTERVALS, 3, (value) => value === semitones)].map((value) =>
      toOption(intervalDomainName(value), intervalLabel(value)),
    ),
  );

  return {
    id: "interval-between",
    promptKey: "learn.checkpoints.intervals.intervalBetween",
    promptParams: { from: root, to: upper },
    options,
    correctId: intervalDomainName(semitones),
    explanation: explain("intervalBetween", {
      from: root,
      to: upper,
      semitones: semitonesLabel(semitones),
      interval: intervalLabel(semitones),
    }),
  };
}

function intervalSemitonesQuestion(): CheckpointQuestion {
  const root = randomChoice(CHECKPOINT_TONICS);
  const semitones = randomChoice(LEARNED_INTERVALS_WITH_OCTAVE);
  const upper = spellIntervalAbove(root, semitones).toString();

  const options = shuffle(
    [semitones, ...sampleDistinct(LEARNED_INTERVALS_WITH_OCTAVE, 3, (value) => value === semitones)].map((value) =>
      toOption(String(value)),
    ),
  );

  return {
    id: "interval-semitones",
    promptKey: "learn.checkpoints.intervals.intervalSemitones",
    promptParams: { interval: intervalLabel(semitones) },
    options,
    correctId: String(semitones),
    explanation: explain(semitones === 12 ? "intervalSemitonesOctave" : "intervalSemitones", {
      interval: intervalLabel(semitones),
      semitones: semitonesLabel(semitones),
      from: root,
      to: upper,
    }),
  };
}

function noteAboveIntervalQuestion(): CheckpointQuestion {
  const root = randomChoice(CHECKPOINT_TONICS);
  const semitones = randomChoice(LEARNED_INTERVALS);
  const answer = spellIntervalAbove(root, semitones).toString();

  const distractors = sampleDistinct(LEARNED_INTERVALS, 3, (value) => value === semitones);
  const options = shuffle(
    [semitones, ...distractors].map((value) => {
      const note = spellIntervalAbove(root, value).toString();

      return toOption(note, note);
    }),
  );

  return {
    id: "note-above-interval",
    promptKey: "learn.checkpoints.intervals.noteAboveInterval",
    promptParams: { root, interval: intervalLabel(semitones) },
    options,
    correctId: answer,
    explanation: explain("noteAboveInterval", {
      root,
      interval: intervalLabel(semitones),
      semitones: semitonesLabel(semitones),
      note: answer,
    }),
  };
}

function intervalNameQuestion(): CheckpointQuestion {
  const root = randomChoice(CHECKPOINT_TONICS);
  const semitones = randomChoice(LEARNED_INTERVALS_WITH_OCTAVE);
  const upper = spellIntervalAbove(root, semitones).toString();

  const options = shuffle(
    [semitones, ...sampleDistinct(LEARNED_INTERVALS_WITH_OCTAVE, 3, (value) => value === semitones)].map((value) =>
      toOption(intervalDomainName(value), intervalLabel(value)),
    ),
  );

  return {
    id: "interval-name",
    promptKey: "learn.checkpoints.intervals.intervalName",
    promptParams: { semitones: semitonesLabel(semitones) },
    options,
    correctId: intervalDomainName(semitones),
    explanation: explain(semitones === 12 ? "intervalNameOctave" : "intervalName", {
      semitones: semitonesLabel(semitones),
      interval: intervalLabel(semitones),
      from: root,
      to: upper,
    }),
  };
}

export const INTERVALS_GENERATORS: QuestionGenerator[] = [
  intervalBetweenQuestion,
  intervalSemitonesQuestion,
  noteAboveIntervalQuestion,
  intervalNameQuestion,
];

// ── Acordes de sétima ────────────────────────────────────────────────────────

const SEVENTH_PATTERNS: ChordPattern[] = [
  MAJOR_7_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
];

/** Grafia que um iniciante reconhece: no máximo um acidente e sem Cb, Fb, E# ou B#. */
function isEasyToRead(note: SpelledNote): boolean {
  if (Math.abs(note.accidental) > 1) return false;

  const wrapsAroundNatural = (note.accidental < 0 && "CF".includes(note.letter)) || (note.accidental > 0 && "EB".includes(note.letter));

  return !wrapsAroundNatural;
}

/** Tônicas em que os quatro acordes de sétima são lidos sem acidentes exóticos (tira F: Fm7b5 tem Cb). */
const SEVENTH_ROOTS = CHECKPOINT_TONICS.filter((root) =>
  SEVENTH_PATTERNS.every((pattern) => createChord(Note.from(root), pattern).spelledNotes.every(isEasyToRead)),
);

function formulaOf(pattern: ChordPattern): string {
  return pattern.degrees.map((degree) => degree.toString()).join(" – ");
}

function seventhChordOf(pattern: ChordPattern, root: SingleNote) {
  const chord = createChord(Note.from(root), pattern);

  return { name: chord.name, notes: chord.spelledNotes.map((note) => note.toString()).join(" – ") };
}

function seventhNotesQuestion(): CheckpointQuestion {
  const root = randomChoice(SEVENTH_ROOTS);
  const correct = randomChoice(SEVENTH_PATTERNS);
  const chord = seventhChordOf(correct, root);

  const options = shuffle(SEVENTH_PATTERNS.map((pattern) => toOption(pattern.name, seventhChordOf(pattern, root).notes)));

  return {
    id: "seventh-notes",
    promptKey: "learn.checkpoints.seventhChords.seventhNotes",
    promptParams: { chord: chord.name },
    options,
    correctId: correct.name,
    explanation: explain("seventhNotes", { chord: chord.name, root, formula: formulaOf(correct), notes: chord.notes }),
  };
}

function seventhQualityQuestion(): CheckpointQuestion {
  const root = randomChoice(SEVENTH_ROOTS);
  const correct = randomChoice(SEVENTH_PATTERNS);
  const chord = seventhChordOf(correct, root);

  const options = shuffle(SEVENTH_PATTERNS.map((pattern) => toOption(pattern.name, chordQualityLabel(pattern.name))));

  return {
    id: "seventh-quality",
    promptKey: "learn.checkpoints.seventhChords.seventhQuality",
    promptParams: { chord: chord.name },
    options,
    correctId: correct.name,
    explanation: explain("seventhQuality", {
      chord: chord.name,
      notes: chord.notes,
      formula: formulaOf(correct),
      quality: chordQualityLabel(correct.name),
    }),
  };
}

function seventhSymbolQuestion(): CheckpointQuestion {
  const root = randomChoice(SEVENTH_ROOTS);
  const correct = randomChoice(SEVENTH_PATTERNS);
  const chord = seventhChordOf(correct, root);

  const options = shuffle(SEVENTH_PATTERNS.map((pattern) => toOption(seventhChordOf(pattern, root).name)));

  return {
    id: "seventh-symbol",
    promptKey: "learn.checkpoints.seventhChords.seventhSymbol",
    promptParams: { quality: chordQualityLabel(correct.name), root },
    options,
    correctId: chord.name,
    explanation: explain("seventhSymbol", {
      quality: chordQualityLabel(correct.name),
      formula: formulaOf(correct),
      notes: chord.notes,
      chord: chord.name,
    }),
  };
}

function seventhFormulaQuestion(): CheckpointQuestion {
  const root = randomChoice(SEVENTH_ROOTS);
  const correct = randomChoice(SEVENTH_PATTERNS);
  const chord = seventhChordOf(correct, root);

  const options = shuffle(SEVENTH_PATTERNS.map((pattern) => toOption(pattern.name, formulaOf(pattern))));

  return {
    id: "seventh-formula",
    promptKey: "learn.checkpoints.seventhChords.seventhFormula",
    promptParams: { quality: chordQualityLabel(correct.name) },
    options,
    correctId: correct.name,
    explanation: explain("seventhFormula", {
      quality: chordQualityLabel(correct.name),
      formula: formulaOf(correct),
      chord: chord.name,
      notes: chord.notes,
    }),
  };
}

export const SEVENTH_CHORDS_GENERATORS: QuestionGenerator[] = [
  seventhNotesQuestion,
  seventhQualityQuestion,
  seventhSymbolQuestion,
  seventhFormulaQuestion,
];

// ── Menor natural e relativa ─────────────────────────────────────────────────

function spelledScale(root: SingleNote, pattern: ScalePattern): SpelledNote[] {
  return createScale(Note.from(root), pattern).spelledNotes();
}

function listNotes(notes: SpelledNote[]): string {
  return notes.map((note) => note.toString()).join(" – ");
}

/** Opções = notas da escala nos índices (0-based) `distractorIndexes`, mais a nota correta. */
function scaleNoteOptions(notes: SpelledNote[], correctIndex: number, distractorIndexes: number[]) {
  const distractors = sampleDistinct(distractorIndexes, 3, () => false);

  return shuffle([correctIndex, ...distractors].map((index) => toOption(notes[index].toString())));
}

function relativeMinorQuestion(ctx: LessonContext): CheckpointQuestion {
  const major = spelledScale(ctx.root, MAJOR_SCALE_PATTERN);
  const answer = major[5].toString();

  return {
    id: "relative-minor",
    promptKey: "learn.checkpoints.naturalMinor.relativeMinor",
    promptParams: { root: ctx.root },
    options: scaleNoteOptions(major, 5, [1, 2, 3, 4, 6]),
    correctId: answer,
    explanation: explain("relativeMinor", { root: ctx.root, notes: listNotes(major), note: answer }),
  };
}

function relativeMajorQuestion(ctx: LessonContext): CheckpointQuestion {
  const minor = spelledScale(ctx.root, NATURAL_MINOR_SCALE_PATTERN);
  const answer = minor[2].toString();

  return {
    id: "relative-major",
    promptKey: "learn.checkpoints.naturalMinor.relativeMajor",
    promptParams: { root: ctx.root },
    options: scaleNoteOptions(minor, 2, [1, 3, 4, 5, 6]),
    correctId: answer,
    explanation: explain("relativeMajor", { root: ctx.root, notes: listNotes(minor), note: answer }),
  };
}

/** Escalas de mesma tônica que parecem a menor natural — os distratores de `minorScaleNotesQuestion`. */
const MINOR_LOOKALIKES: ScalePattern[] = [MAJOR_SCALE_PATTERN, DORIAN_SCALE_PATTERN, PHRYGIAN_SCALE_PATTERN, MIXOLYDIAN_SCALE_PATTERN];

function minorScaleNotesQuestion(ctx: LessonContext): CheckpointQuestion {
  const minor = spelledScale(ctx.root, NATURAL_MINOR_SCALE_PATTERN);

  const lookalikes = MINOR_LOOKALIKES.filter((pattern) => spelledScale(ctx.root, pattern).every(isEasyToRead));
  const options = shuffle([
    toOption(NATURAL_MINOR_SCALE_PATTERN.name, listNotes(minor)),
    ...sampleDistinct(lookalikes, 3, () => false).map((pattern) =>
      toOption(pattern.name, listNotes(spelledScale(ctx.root, pattern))),
    ),
  ]);

  return {
    id: "minor-scale-notes",
    promptKey: "learn.checkpoints.naturalMinor.minorScaleNotes",
    promptParams: { root: ctx.root },
    options,
    correctId: NATURAL_MINOR_SCALE_PATTERN.name,
    explanation: explain("minorScaleNotes", { root: ctx.root, notes: listNotes(minor) }),
  };
}

function relativeDegreeQuestion(ctx: LessonContext): CheckpointQuestion {
  const major = spelledScale(ctx.root, MAJOR_SCALE_PATTERN);
  const options = shuffle(["6", ...sampleDistinct(["2", "3", "4", "5", "7"], 3, () => false)].map((value) => toOption(value)));

  return {
    id: "relative-degree",
    promptKey: "learn.checkpoints.naturalMinor.relativeDegree",
    promptParams: { root: ctx.root },
    options,
    correctId: "6",
    explanation: explain("relativeDegree", { root: ctx.root, notes: listNotes(major), note: major[5].toString() }),
  };
}

/** Combinações erradas de graus, para os distratores de `loweredDegreesQuestion`. */
const WRONG_DEGREE_SETS = ["2-3-6", "3-4-7", "2-6-7", "4-5-7", "3-5-7", "2-3-7"];

function degreesLabel(id: string): string {
  return id.split("-").join(" – ");
}

function loweredDegreesQuestion(ctx: LessonContext): CheckpointQuestion {
  const major = spelledScale(ctx.root, MAJOR_SCALE_PATTERN);
  const minor = spelledScale(ctx.root, NATURAL_MINOR_SCALE_PATTERN);

  // graus (1-based) cujas notas mudam da maior para a menor natural — vem do domínio, não de uma lista fixa
  const lowered = minor.flatMap((note, index) => (note.toString() === major[index].toString() ? [] : [index + 1]));
  const correct = lowered.join("-");

  const options = shuffle(
    [correct, ...sampleDistinct(WRONG_DEGREE_SETS, 3, (value) => value === correct)].map((id) => toOption(id, degreesLabel(id))),
  );

  return {
    id: "lowered-degrees",
    promptKey: "learn.checkpoints.naturalMinor.loweredDegrees",
    promptParams: { root: ctx.root },
    options,
    correctId: correct,
    explanation: explain("loweredDegrees", {
      root: ctx.root,
      major: listNotes(major),
      minor: listNotes(minor),
      degrees: degreesLabel(correct),
    }),
  };
}

export const NATURAL_MINOR_GENERATORS: QuestionGenerator[] = [
  relativeMinorQuestion,
  relativeMajorQuestion,
  minorScaleNotesQuestion,
  relativeDegreeQuestion,
  loweredDegreesQuestion,
];
