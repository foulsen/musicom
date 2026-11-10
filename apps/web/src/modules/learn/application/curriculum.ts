import {
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MAJOR_SCALE_PATTERN,
  MINOR_7_CHORD_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  Note,
  Pitch,
  type ChordPattern,
  type Passage,
  type ScalePattern,
  type SingleNote,
} from "@music-workspace/music-theory";

import type { ExplorerLinkConfig } from "@/modules/shared/application/explorer-deeplink";
import { findScalePattern } from "@/modules/shared/application/scale-patterns";

import { generateCheckpoint, type CheckpointQuestion } from "./checkpoint-generators";
import type { PracticeTarget } from "./practice";

/** Contexto musical base de uma lição — tônica + escala/tom-pai sobre a qual ela é construída. */
export interface LessonContext {
  root: SingleNote;
  pattern: string;
}

/** Um trecho de áudio a tocar: notas em sequência (melódico) ou juntas (acorde). */
export interface ListenCue {
  pitches: Pitch[];
  mode: "sequence" | "chord";
}

/** Visualizações compartilhadas que um passo pode embutir inline (ver `modules/shared/components`). */
export type InlineVizKind =
  | "scale-notes"
  | "chromatic-wheel"
  | "harmonic-field"
  | "chord-card"
  | "step-pattern"
  | "interval"
  | "chord-formulas"
  | "staff";

/** Exemplo de pauta mostrado pela viz "staff"; com `playback`, ganha um botão de tocar. */
export interface StaffExample {
  passage: Passage;
  /** Legenda (chave i18n) exibida sob a pauta. */
  captionKey?: string;
  playback?: { bpm: number; click?: boolean };
}

/**
 * Passo de conceito — cada lição tem de 1 a 3, curtos, cada um com título, texto, "ouça" e
 * visualização próprios (um passo = uma ideia).
 */
export interface ConceptStep {
  kind: "concept";
  titleKey: string;
  bodyKey: string;
  listen?: (ctx: LessonContext) => ListenCue[];
  viz?: InlineVizKind[];
  /** Semitons dos intervalos (a partir da tônica do contexto) mostrados pela viz "interval". */
  intervals?: number[];
  /** Nomes (no domínio) das qualidades que a viz "chord-formulas" lista sobre a tônica do contexto. */
  chordPatterns?: string[];
  /** Rótulos do "step-pattern": graus (padrão) ou nomes das notas — para quando ainda não se fala em graus. */
  patternLabels?: "degrees" | "notes";
  /** Começa o campo harmônico em tríades (padrão) ou em acordes com sétima. */
  fieldMode?: "triads" | "sevenths";
  /** Pautas desenhadas pela viz "staff". */
  staves?: StaffExample[];
}

export interface ExploreStep {
  kind: "explore";
  viz: InlineVizKind[];
  intervals?: number[];
  fieldMode?: "triads" | "sevenths";
  explorerPath: string;
  deeplink: ExplorerLinkConfig;
}

export interface CheckpointStep {
  kind: "checkpoint";
  generate: (ctx: LessonContext) => CheckpointQuestion[];
}

export type LessonStep = ConceptStep | ExploreStep | CheckpointStep;

export interface Lesson {
  id: string;
  titleKey: string;
  summaryKey: string;
  context: LessonContext;
  steps: LessonStep[];
  /** Exercícios sugeridos no painel de conclusão ("Pratique agora") — até `MAX_PRACTICE_LINKS`. */
  practice?: PracticeTarget[];
  /** Id da lição que precisa estar concluída antes desta ficar disponível (gating linear). */
  prerequisiteId?: string;
}

export interface Track {
  id: string;
  titleKey: string;
  lessons: Lesson[];
}

/** Pitches ascendentes a partir de uma fundamental, via `Pitch.transpose` (nunca cai de registro). */
function ascendingPitches(root: Note, octave: number, semitoneOffsets: number[]): Pitch[] {
  const rootPitch = Pitch.from(root.value, octave);

  return semitoneOffsets.map((offset) => rootPitch.transpose(offset));
}

function chordCue(root: Note, pattern: ChordPattern): ListenCue {
  return {
    pitches: ascendingPitches(root, 4, pattern.degrees.map((degree) => degree.semitones())),
    mode: "chord",
  };
}

function scaleCue(root: Note, pattern: ScalePattern): ListenCue {
  const offsets = [...pattern.degrees.map((degree) => degree.semitones()), 12];

  return { pitches: ascendingPitches(root, 4, offsets), mode: "sequence" };
}

/** A escala do contexto (tônica + padrão) subindo uma oitava, nota a nota. */
function scaleListen(ctx: LessonContext): ListenCue[] {
  return [scaleCue(Note.from(ctx.root), findScalePattern(ctx.pattern))];
}

/** Cada intervalo (em semitons) a partir da tônica do contexto: a nota de baixo e depois a de cima. */
function intervalsListen(...semitones: number[]): (ctx: LessonContext) => ListenCue[] {
  return (ctx) =>
    semitones.map((size) => ({ pitches: ascendingPitches(Note.from(ctx.root), 4, [0, size]), mode: "sequence" }));
}

/** Todas as 12 teclas, uma a uma, até a oitava. */
function chromaticListen(ctx: LessonContext): ListenCue[] {
  const offsets = Array.from({ length: 13 }, (_, step) => step);

  return [{ pitches: ascendingPitches(Note.from(ctx.root), 4, offsets), mode: "sequence" }];
}

/** Os acordes da lição, um a um, sobre a tônica do contexto. */
function chordsListen(...patterns: ChordPattern[]): (ctx: LessonContext) => ListenCue[] {
  return (ctx) => patterns.map((pattern) => chordCue(Note.from(ctx.root), pattern));
}

/** Maior e menor natural de mesma tônica, em sequência — dá para ouvir o 3º, 6º e 7º graus descerem. */
function majorVersusMinorListen(ctx: LessonContext): ListenCue[] {
  const root = Note.from(ctx.root);

  return [scaleCue(root, MAJOR_SCALE_PATTERN), scaleCue(root, NATURAL_MINOR_SCALE_PATTERN)];
}

/** A relativa maior (3 semitons acima da tônica menor) e a menor: escalas diferentes, mesmas notas. */
function relativePairListen(ctx: LessonContext): ListenCue[] {
  const minorRoot = Note.from(ctx.root);

  return [scaleCue(minorRoot.transpose(3), MAJOR_SCALE_PATTERN), scaleCue(minorRoot, NATURAL_MINOR_SCALE_PATTERN)];
}

function triadListen(ctx: LessonContext): ListenCue[] {
  return [chordCue(Note.from(ctx.root), MAJOR_CHORD_PATTERN)];
}

/** Só a resolução V -> I, o coração do ii-V-I. */
function fiveToOneListen(ctx: LessonContext): ListenCue[] {
  const tonic = Note.from(ctx.root);

  return [chordCue(tonic.transpose(7), DOMINANT_7_CHORD_PATTERN), chordCue(tonic, MAJOR_7_CHORD_PATTERN)];
}

function twoFiveOneListen(ctx: LessonContext): ListenCue[] {
  const tonic = Note.from(ctx.root);

  return [
    chordCue(tonic.transpose(2), MINOR_7_CHORD_PATTERN),
    chordCue(tonic.transpose(7), DOMINANT_7_CHORD_PATTERN),
    chordCue(tonic, MAJOR_7_CHORD_PATTERN),
  ];
}

const TONIC: SingleNote = "C";

const notesLesson: Lesson = {
  id: "notes",
  titleKey: "learn.lessons.notes.title",
  summaryKey: "learn.lessons.notes.summary",
  practice: [{ kind: "note-id" }, { kind: "fretboard" }],
  context: { root: TONIC, pattern: "Major" },
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.notes.steps.twelveNotes.title",
      bodyKey: "learn.lessons.notes.steps.twelveNotes.body",
      listen: chromaticListen,
      viz: ["chromatic-wheel"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.notes.steps.sharpsAndFlats.title",
      bodyKey: "learn.lessons.notes.steps.sharpsAndFlats.body",
      listen: intervalsListen(1),
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.notes.steps.toneAndSemitone.title",
      bodyKey: "learn.lessons.notes.steps.toneAndSemitone.body",
      listen: intervalsListen(1, 2),
      viz: ["step-pattern"],
      patternLabels: "notes",
    },
    {
      kind: "explore",
      viz: ["chromatic-wheel", "scale-notes"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("notes", ctx) },
  ],
};

const intervalsLesson: Lesson = {
  id: "intervals",
  titleKey: "learn.lessons.intervals.title",
  summaryKey: "learn.lessons.intervals.summary",
  practice: [
    { kind: "ear-training", quiz: "interval", difficulty: "easy" },
    { kind: "flashcards", deck: "intervals" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: notesLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.intervals.steps.twoWays.title",
      bodyKey: "learn.lessons.intervals.steps.twoWays.body",
      listen: intervalsListen(2, 4),
      viz: ["interval"],
      intervals: [2, 4],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.intervals.steps.secondsAndThirds.title",
      bodyKey: "learn.lessons.intervals.steps.secondsAndThirds.body",
      listen: intervalsListen(1, 2, 3, 4),
      viz: ["interval"],
      intervals: [1, 2, 3, 4],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.intervals.steps.fourthsAndFifths.title",
      bodyKey: "learn.lessons.intervals.steps.fourthsAndFifths.body",
      listen: intervalsListen(5, 7, 12),
      viz: ["interval"],
      intervals: [5, 7, 12],
    },
    {
      kind: "explore",
      viz: ["interval", "chromatic-wheel"],
      intervals: [3, 4, 7],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("intervals", ctx) },
  ],
};

const majorScaleLesson: Lesson = {
  id: "major-scale",
  titleKey: "learn.lessons.majorScale.title",
  summaryKey: "learn.lessons.majorScale.summary",
  practice: [
    { kind: "ear-training", quiz: "scale", difficulty: "easy" },
    { kind: "flashcards", deck: "intervalNames" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: intervalsLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.majorScale.steps.whatIsScale.title",
      bodyKey: "learn.lessons.majorScale.steps.whatIsScale.body",
      listen: scaleListen,
      viz: ["scale-notes"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.majorScale.steps.formula.title",
      bodyKey: "learn.lessons.majorScale.steps.formula.body",
      listen: scaleListen,
      viz: ["step-pattern"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.majorScale.steps.degrees.title",
      bodyKey: "learn.lessons.majorScale.steps.degrees.body",
      viz: ["scale-notes"],
    },
    {
      kind: "explore",
      viz: ["scale-notes", "chromatic-wheel"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("major-scale", ctx) },
  ],
};

const triadsLesson: Lesson = {
  id: "triads",
  titleKey: "learn.lessons.triads.title",
  summaryKey: "learn.lessons.triads.summary",
  practice: [
    { kind: "ear-training", quiz: "chordQuality", difficulty: "easy" },
    { kind: "flashcards", deck: "chordFormulas" },
    { kind: "flashcards", deck: "chordSpelling" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: majorScaleLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.triads.steps.stacking.title",
      bodyKey: "learn.lessons.triads.steps.stacking.body",
      viz: ["scale-notes"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.triads.steps.thirdAndFifth.title",
      bodyKey: "learn.lessons.triads.steps.thirdAndFifth.body",
      listen: triadListen,
      viz: ["interval", "chord-card"],
      intervals: [4, 7],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.triads.steps.everyDegree.title",
      bodyKey: "learn.lessons.triads.steps.everyDegree.body",
      viz: ["harmonic-field"],
    },
    {
      kind: "explore",
      viz: ["harmonic-field", "chord-card"],
      explorerPath: "/chords",
      deeplink: { root: TONIC, family: "Triads", quality: "Major" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("triads", ctx) },
  ],
};

const seventhChordsLesson: Lesson = {
  id: "seventh-chords",
  titleKey: "learn.lessons.seventhChords.title",
  summaryKey: "learn.lessons.seventhChords.summary",
  practice: [
    { kind: "ear-training", quiz: "chordQuality", difficulty: "medium" },
    { kind: "flashcards", deck: "chordFormulas" },
    { kind: "flashcards", deck: "chordSpelling" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: triadsLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.seventhChords.steps.fourthNote.title",
      bodyKey: "learn.lessons.seventhChords.steps.fourthNote.body",
      listen: chordsListen(MAJOR_CHORD_PATTERN, MAJOR_7_CHORD_PATTERN),
      viz: ["chord-formulas"],
      chordPatterns: ["Major 7th"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.seventhChords.steps.fourTypes.title",
      bodyKey: "learn.lessons.seventhChords.steps.fourTypes.body",
      listen: chordsListen(
        MAJOR_7_CHORD_PATTERN,
        DOMINANT_7_CHORD_PATTERN,
        MINOR_7_CHORD_PATTERN,
        HALF_DIMINISHED_CHORD_PATTERN,
      ),
      viz: ["chord-formulas"],
      chordPatterns: ["Major 7th", "Dominant 7th", "Minor 7th", "Half-diminished 7th"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.seventhChords.steps.inTheKey.title",
      bodyKey: "learn.lessons.seventhChords.steps.inTheKey.body",
      viz: ["harmonic-field"],
      fieldMode: "sevenths",
    },
    {
      kind: "explore",
      viz: ["harmonic-field", "chord-card"],
      explorerPath: "/chords",
      deeplink: { root: TONIC, family: "Seventh", quality: "Major 7th" },
      fieldMode: "sevenths",
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("seventh-chords", ctx) },
  ],
};

const diatonicFieldLesson: Lesson = {
  id: "diatonic-field",
  titleKey: "learn.lessons.diatonicField.title",
  summaryKey: "learn.lessons.diatonicField.summary",
  practice: [
    { kind: "ear-training", quiz: "chordQuality", difficulty: "medium" },
    { kind: "flashcards", deck: "chordSpelling" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: seventhChordsLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.diatonicField.steps.oneChordPerDegree.title",
      bodyKey: "learn.lessons.diatonicField.steps.oneChordPerDegree.body",
      viz: ["harmonic-field"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.diatonicField.steps.functions.title",
      bodyKey: "learn.lessons.diatonicField.steps.functions.body",
      viz: ["harmonic-field"],
    },
    {
      kind: "explore",
      viz: ["harmonic-field"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("diatonic-field", ctx) },
  ],
};

const twoFiveOneLesson: Lesson = {
  id: "two-five-one",
  titleKey: "learn.lessons.twoFiveOne.title",
  summaryKey: "learn.lessons.twoFiveOne.summary",
  practice: [
    { kind: "ear-training", quiz: "chordQuality", difficulty: "medium" },
    { kind: "flashcards", deck: "chordSpelling" },
  ],
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: diatonicFieldLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.twoFiveOne.steps.threeChords.title",
      bodyKey: "learn.lessons.twoFiveOne.steps.threeChords.body",
      listen: twoFiveOneListen,
      viz: ["harmonic-field"],
      fieldMode: "sevenths",
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.twoFiveOne.steps.arriving.title",
      bodyKey: "learn.lessons.twoFiveOne.steps.arriving.body",
      listen: fiveToOneListen,
      viz: ["harmonic-field"],
      fieldMode: "sevenths",
    },
    // TODO(progression-builder): trocar por deep-link ao Progression Builder (flagship) quando existir.
    {
      kind: "explore",
      viz: ["harmonic-field"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major", degree: 2 },
      fieldMode: "sevenths",
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("two-five-one", ctx) },
  ],
};

/** Tônica do menor natural usado nesta lição: a relativa menor (6º grau) do tom-pai `TONIC`. */
const MINOR_TONIC = Note.from(TONIC).transpose(9).value;

const naturalMinorLesson: Lesson = {
  id: "natural-minor",
  titleKey: "learn.lessons.naturalMinor.title",
  summaryKey: "learn.lessons.naturalMinor.summary",
  practice: [
    { kind: "ear-training", quiz: "scale", difficulty: "easy" },
    { kind: "flashcards", deck: "intervalNames" },
  ],
  // O contexto inline mostra A menor natural; o deep-link usa a mesma tônica e padrão (Scale Explorer).
  context: { root: MINOR_TONIC, pattern: NATURAL_MINOR_SCALE_PATTERN.name },
  prerequisiteId: twoFiveOneLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.naturalMinor.steps.formula.title",
      bodyKey: "learn.lessons.naturalMinor.steps.formula.body",
      listen: scaleListen,
      viz: ["step-pattern"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.naturalMinor.steps.versusMajor.title",
      bodyKey: "learn.lessons.naturalMinor.steps.versusMajor.body",
      listen: majorVersusMinorListen,
      viz: ["scale-notes"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.naturalMinor.steps.relative.title",
      bodyKey: "learn.lessons.naturalMinor.steps.relative.body",
      listen: relativePairListen,
      viz: ["chromatic-wheel"],
    },
    {
      kind: "explore",
      viz: ["scale-notes", "chromatic-wheel"],
      explorerPath: "/",
      deeplink: { root: MINOR_TONIC, pattern: NATURAL_MINOR_SCALE_PATTERN.name },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("natural-minor", ctx) },
  ],
};

/** Tônica do Dorian usado nesta lição — 2º grau do tom-pai `TONIC` maior, não o tom-pai em si. */
const DORIAN_TONIC = Note.from(TONIC).transpose(2).value;

const modesLesson: Lesson = {
  id: "modes",
  titleKey: "learn.lessons.modes.title",
  summaryKey: "learn.lessons.modes.summary",
  practice: [{ kind: "ear-training", quiz: "scale", difficulty: "medium" }],
  // O contexto inline mostra a escala resultante (D Dorian); o deep-link abaixo usa o
  // tom-pai (C) porque é assim que o Mode Explorer interpreta `root` + `pattern`.
  context: { root: DORIAN_TONIC, pattern: "Dorian" },
  prerequisiteId: naturalMinorLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.modes.steps.otherStart.title",
      bodyKey: "learn.lessons.modes.steps.otherStart.body",
      listen: scaleListen,
      viz: ["chromatic-wheel"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.modes.steps.sevenModes.title",
      bodyKey: "learn.lessons.modes.steps.sevenModes.body",
      viz: ["scale-notes"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.modes.steps.formulaChanges.title",
      bodyKey: "learn.lessons.modes.steps.formulaChanges.body",
      viz: ["step-pattern"],
    },
    {
      kind: "explore",
      viz: ["chromatic-wheel", "scale-notes"],
      explorerPath: "/modes",
      deeplink: { root: TONIC, pattern: "Dorian" },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("modes", ctx) },
  ],
};

export const FUNDAMENTALS_TRACK: Track = {
  id: "fundamentals",
  titleKey: "learn.tracks.fundamentals.title",
  lessons: [
    notesLesson,
    intervalsLesson,
    majorScaleLesson,
    triadsLesson,
    seventhChordsLesson,
    diatonicFieldLesson,
    twoFiveOneLesson,
    naturalMinorLesson,
    modesLesson,
  ],
};

export const TRACKS: Track[] = [FUNDAMENTALS_TRACK];
