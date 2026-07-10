import {
  DOMINANT_7_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MAJOR_SCALE_PATTERN,
  MINOR_7_CHORD_PATTERN,
  Note,
  Pitch,
  type ChordPattern,
  type SingleNote,
} from "@music-workspace/music-theory";

import type { ExplorerLinkConfig } from "@/modules/shared/application/explorer-deeplink";

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
export type InlineVizKind = "scale-notes" | "chromatic-wheel" | "harmonic-field" | "chord-card";

export interface ConceptStep {
  kind: "concept";
  bodyKey: string;
  listen?: (ctx: LessonContext) => ListenCue[];
  viz?: InlineVizKind[];
}

export interface ExploreStep {
  kind: "explore";
  viz: InlineVizKind[];
  explorerPath: string;
  deeplink: ExplorerLinkConfig;
}

export type LessonStep = ConceptStep | ExploreStep;

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

function majorScaleListen(ctx: LessonContext): ListenCue[] {
  const root = Note.from(ctx.root);
  const offsets = [...MAJOR_SCALE_PATTERN.degrees.map((degree) => degree.semitones()), 12];

  return [{ pitches: ascendingPitches(root, 4, offsets), mode: "sequence" }];
}

function triadListen(ctx: LessonContext): ListenCue[] {
  return [chordCue(Note.from(ctx.root), MAJOR_CHORD_PATTERN)];
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
    { kind: "concept", bodyKey: "learn.lessons.majorScale.concept", listen: majorScaleListen, viz: ["scale-notes"] },
    {
      kind: "explore",
      viz: ["scale-notes", "chromatic-wheel"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
  ],
};

const triadsLesson: Lesson = {
  id: "triads",
  titleKey: "learn.lessons.triads.title",
  summaryKey: "learn.lessons.triads.summary",
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: majorScaleLesson.id,
  steps: [
    { kind: "concept", bodyKey: "learn.lessons.triads.concept", listen: triadListen, viz: ["chord-card"] },
    {
      kind: "explore",
      viz: ["harmonic-field", "chord-card"],
      explorerPath: "/chords",
      deeplink: { root: TONIC, family: "Triads", quality: "Major" },
    },
  ],
};

const diatonicFieldLesson: Lesson = {
  id: "diatonic-field",
  titleKey: "learn.lessons.diatonicField.title",
  summaryKey: "learn.lessons.diatonicField.summary",
  context: { root: TONIC, pattern: "Major" },
  prerequisiteId: triadsLesson.id,
  steps: [
    { kind: "concept", bodyKey: "learn.lessons.diatonicField.concept", viz: ["harmonic-field"] },
    {
      kind: "explore",
      viz: ["harmonic-field"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major" },
    },
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
      bodyKey: "learn.lessons.twoFiveOne.concept",
      listen: twoFiveOneListen,
      viz: ["harmonic-field"],
    },
    // TODO(progression-builder): trocar por deep-link ao Progression Builder (flagship) quando existir.
    {
      kind: "explore",
      viz: ["harmonic-field"],
      explorerPath: "/",
      deeplink: { root: TONIC, pattern: "Major", degree: 2 },
    },
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
    { kind: "concept", bodyKey: "learn.lessons.modes.concept", viz: ["chromatic-wheel"] },
    {
      kind: "explore",
      viz: ["chromatic-wheel", "scale-notes"],
      explorerPath: "/modes",
      deeplink: { root: TONIC, pattern: "Dorian" },
    },
  ],
};

export const FUNDAMENTALS_TRACK: Track = {
  id: "fundamentals",
  titleKey: "learn.tracks.fundamentals.title",
  lessons: [majorScaleLesson, triadsLesson, diatonicFieldLesson, twoFiveOneLesson, modesLesson],
};

export const TRACKS: Track[] = [FUNDAMENTALS_TRACK];
