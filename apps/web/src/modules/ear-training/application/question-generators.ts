import {
  CHROMATIC_SCALE,
  Interval,
  MAJOR_7_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  AUGMENTED_CHORD_PATTERN,
  AEOLIAN_SCALE_PATTERN,
  DORIAN_SCALE_PATTERN,
  HARMONIC_MINOR_SCALE_PATTERN,
  IONIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MAJOR_SCALE_PATTERN,
  MELODIC_MINOR_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
  Note,
  Pitch,
  createChord,
  createScale,
  type ChordPattern,
  type ScalePattern,
} from "@music-workspace/music-theory";

import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";

const PLAYBACK_OCTAVE = 4;

const INTERVAL_SEMITONE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CHORD_QUALITY_OPTIONS: ChordPattern[] = [
  MAJOR_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  AUGMENTED_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
];

const SCALE_OPTIONS: ScalePattern[] = [
  MAJOR_SCALE_PATTERN,
  NATURAL_MINOR_SCALE_PATTERN,
  HARMONIC_MINOR_SCALE_PATTERN,
  MELODIC_MINOR_SCALE_PATTERN,
  DORIAN_SCALE_PATTERN,
  AEOLIAN_SCALE_PATTERN,
  IONIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
];

export type QuizKind = "interval" | "chordQuality" | "scale";

export interface QuizOption {
  id: string;
  label: string;
}

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

function intervalName(semitones: number): string {
  return semitones === 12 ? "octave" : new Interval(semitones).name();
}

function generateIntervalQuestion(): Question {
  const root = randomRootNote();
  const semitones = randomChoice(INTERVAL_SEMITONE_OPTIONS);
  const target = root.transpose(semitones);

  const distractors = sampleDistinct(INTERVAL_SEMITONE_OPTIONS, 3, (value) => value === semitones);

  const options = shuffle(
    [semitones, ...distractors].map((value) => ({ id: value.toString(), label: intervalName(value) })),
  );

  return {
    kind: "interval",
    correctId: semitones.toString(),
    options,
    pitches: [Pitch.from(root.value, PLAYBACK_OCTAVE), Pitch.from(target.value, PLAYBACK_OCTAVE)],
    playback: "sequence",
  };
}

function generateChordQualityQuestion(): Question {
  const root = randomRootNote();
  const pattern = randomChoice(CHORD_QUALITY_OPTIONS);
  const chord = createChord(root, pattern);

  const distractors = sampleDistinct(CHORD_QUALITY_OPTIONS, 3, (item) => item.name === pattern.name);

  const options = shuffle(
    [pattern, ...distractors].map((item) => ({ id: item.name, label: item.name })),
  );

  return {
    kind: "chordQuality",
    correctId: pattern.name,
    options,
    pitches: chord.notes.map((note) => Pitch.from(note.value, PLAYBACK_OCTAVE)),
    playback: "chord",
  };
}

function generateScaleQuestion(): Question {
  const root = randomRootNote();
  const pattern = randomChoice(SCALE_OPTIONS);
  const scale = createScale(root, pattern);

  const distractors = sampleDistinct(SCALE_OPTIONS, 3, (item) => item.name === pattern.name);

  const options = shuffle(
    [pattern, ...distractors].map((item) => ({ id: item.name, label: item.name })),
  );

  return {
    kind: "scale",
    correctId: pattern.name,
    options,
    pitches: scale.notes().map((note) => Pitch.from(note.value, PLAYBACK_OCTAVE)),
    playback: "sequence",
  };
}

export function generateQuestion(kind: QuizKind): Question {
  if (kind === "chordQuality") return generateChordQualityQuestion();
  if (kind === "scale") return generateScaleQuestion();

  return generateIntervalQuestion();
}
