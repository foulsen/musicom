import {
  DOMINANT_7_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  Note,
  Pitch,
  type ChordPattern,
  type SingleNote,
} from "@music-workspace/music-theory";

import type { ExplorerLinkConfig } from "@/modules/shared/application/explorer-deeplink";
import { findScalePattern } from "@/modules/shared/application/scale-patterns";

import { generateCheckpoint, type CheckpointQuestion } from "./checkpoint-generators";

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
  | "interval";

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
}

export interface ExploreStep {
  kind: "explore";
  viz: InlineVizKind[];
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

/** A escala do contexto (tônica + padrão) subindo uma oitava, nota a nota. */
function scaleListen(ctx: LessonContext): ListenCue[] {
  const root = Note.from(ctx.root);
  const offsets = [...findScalePattern(ctx.pattern).degrees.map((degree) => degree.semitones()), 12];

  return [{ pitches: ascendingPitches(root, 4, offsets), mode: "sequence" }];
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

const majorScaleLesson: Lesson = {
  id: "major-scale",
  titleKey: "learn.lessons.majorScale.title",
  summaryKey: "learn.lessons.majorScale.summary",
  context: { root: TONIC, pattern: "Major" },
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

const diatonicFieldLesson: Lesson = {
  id: "diatonic-field",
  titleKey: "learn.lessons.diatonicField.title",
  summaryKey: "learn.lessons.diatonicField.summary",
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: triadsLesson.id,
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
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: diatonicFieldLesson.id,
  steps: [
    {
      kind: "concept",
      titleKey: "learn.lessons.twoFiveOne.steps.threeChords.title",
      bodyKey: "learn.lessons.twoFiveOne.steps.threeChords.body",
      listen: twoFiveOneListen,
      viz: ["harmonic-field"],
    },
    {
      kind: "concept",
      titleKey: "learn.lessons.twoFiveOne.steps.arriving.title",
      bodyKey: "learn.lessons.twoFiveOne.steps.arriving.body",
      listen: fiveToOneListen,
      viz: ["harmonic-field"],
    },
    // TODO(progression-builder): trocar por deep-link ao Progression Builder (flagship) quando existir.
    {
      kind: "explore",
      viz: ["harmonic-field"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major", degree: 2 },
    },
    { kind: "checkpoint", generate: (ctx) => generateCheckpoint("two-five-one", ctx) },
  ],
};

/** Tônica do Dorian usado nesta lição — 2º grau do tom-pai `TONIC` maior, não o tom-pai em si. */
const DORIAN_TONIC = Note.from(TONIC).transpose(2).value;

const modesLesson: Lesson = {
  id: "modes",
  titleKey: "learn.lessons.modes.title",
  summaryKey: "learn.lessons.modes.summary",
  // O contexto inline mostra a escala resultante (D Dorian); o deep-link abaixo usa o
  // tom-pai (C) porque é assim que o Mode Explorer interpreta `root` + `pattern`.
  context: { root: DORIAN_TONIC, pattern: "Dorian" },
  prerequisiteId: twoFiveOneLesson.id,
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
  lessons: [majorScaleLesson, triadsLesson, diatonicFieldLesson, twoFiveOneLesson, modesLesson],
};

export const TRACKS: Track[] = [FUNDAMENTALS_TRACK];
