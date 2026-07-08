import { Degree } from "../scales/degree";

import { ChordPattern } from "./chord-pattern";
import {
  ADD_9,
  ADD_11,
  AUGMENTED,
  DIMINISHED,
  DIMINISHED_7,
  DOMINANT_7,
  DOMINANT_7_FLAT_5,
  DOMINANT_7_FLAT_9,
  DOMINANT_7_SHARP_5,
  DOMINANT_7_SHARP_9,
  DOMINANT_9,
  DOMINANT_11,
  DOMINANT_13,
  HALF_DIMINISHED,
  MAJOR,
  MAJOR_7,
  MAJOR_9,
  MINOR,
  MINOR_7,
  MINOR_9,
  MINOR_MAJOR_7,
  MINOR_SIXTH,
  SIXTH,
  SUS2,
  SUS4,
} from "./chord-qualities";

const degrees = (...values: string[]): Degree[] => values.map((value) => new Degree(value));

// ── Tríades ──────────────────────────────────────────────────────────────────

export const MAJOR_CHORD_PATTERN = new ChordPattern("Major", MAJOR, degrees("1", "3", "5"));

export const MINOR_CHORD_PATTERN = new ChordPattern("Minor", MINOR, degrees("1", "b3", "5"));

export const DIMINISHED_CHORD_PATTERN = new ChordPattern(
  "Diminished",
  DIMINISHED,
  degrees("1", "b3", "b5"),
);

export const AUGMENTED_CHORD_PATTERN = new ChordPattern(
  "Augmented",
  AUGMENTED,
  degrees("1", "3", "#5"),
);

export const SUS2_CHORD_PATTERN = new ChordPattern("Suspended 2nd", SUS2, degrees("1", "2", "5"));

export const SUS4_CHORD_PATTERN = new ChordPattern("Suspended 4th", SUS4, degrees("1", "4", "5"));

// ── Sextas ───────────────────────────────────────────────────────────────────

export const SIXTH_CHORD_PATTERN = new ChordPattern("Sixth", SIXTH, degrees("1", "3", "5", "6"));

export const MINOR_SIXTH_CHORD_PATTERN = new ChordPattern(
  "Minor Sixth",
  MINOR_SIXTH,
  degrees("1", "b3", "5", "6"),
);

// ── Sétimas ──────────────────────────────────────────────────────────────────

export const MAJOR_7_CHORD_PATTERN = new ChordPattern(
  "Major 7th",
  MAJOR_7,
  degrees("1", "3", "5", "7"),
);

export const MINOR_7_CHORD_PATTERN = new ChordPattern(
  "Minor 7th",
  MINOR_7,
  degrees("1", "b3", "5", "b7"),
);

export const DOMINANT_7_CHORD_PATTERN = new ChordPattern(
  "Dominant 7th",
  DOMINANT_7,
  degrees("1", "3", "5", "b7"),
);

export const HALF_DIMINISHED_CHORD_PATTERN = new ChordPattern(
  "Half-diminished 7th",
  HALF_DIMINISHED,
  degrees("1", "b3", "b5", "b7"),
);

export const DIMINISHED_7_CHORD_PATTERN = new ChordPattern(
  "Diminished 7th",
  DIMINISHED_7,
  degrees("1", "b3", "b5", "bb7"),
);

export const MINOR_MAJOR_7_CHORD_PATTERN = new ChordPattern(
  "Minor-major 7th",
  MINOR_MAJOR_7,
  degrees("1", "b3", "5", "7"),
);

// ── Estendidas ───────────────────────────────────────────────────────────────

export const DOMINANT_9_CHORD_PATTERN = new ChordPattern(
  "Dominant 9th",
  DOMINANT_9,
  degrees("1", "3", "5", "b7", "9"),
);

export const MAJOR_9_CHORD_PATTERN = new ChordPattern(
  "Major 9th",
  MAJOR_9,
  degrees("1", "3", "5", "7", "9"),
);

export const MINOR_9_CHORD_PATTERN = new ChordPattern(
  "Minor 9th",
  MINOR_9,
  degrees("1", "b3", "5", "b7", "9"),
);

export const DOMINANT_11_CHORD_PATTERN = new ChordPattern(
  "Dominant 11th",
  DOMINANT_11,
  degrees("1", "3", "5", "b7", "9", "11"),
);

export const DOMINANT_13_CHORD_PATTERN = new ChordPattern(
  "Dominant 13th",
  DOMINANT_13,
  degrees("1", "3", "5", "b7", "9", "11", "13"),
);

// ── Alteradas (dominantes com 5ª/9ª alterada) ────────────────────────────────

export const DOMINANT_7_FLAT_9_CHORD_PATTERN = new ChordPattern(
  "Dominant 7♭9",
  DOMINANT_7_FLAT_9,
  degrees("1", "3", "5", "b7", "b9"),
);

export const DOMINANT_7_SHARP_9_CHORD_PATTERN = new ChordPattern(
  "Dominant 7♯9",
  DOMINANT_7_SHARP_9,
  degrees("1", "3", "5", "b7", "#9"),
);

export const DOMINANT_7_FLAT_5_CHORD_PATTERN = new ChordPattern(
  "Dominant 7♭5",
  DOMINANT_7_FLAT_5,
  degrees("1", "3", "b5", "b7"),
);

export const DOMINANT_7_SHARP_5_CHORD_PATTERN = new ChordPattern(
  "Dominant 7♯5",
  DOMINANT_7_SHARP_5,
  degrees("1", "3", "#5", "b7"),
);

// ── Acréscimos ───────────────────────────────────────────────────────────────

export const ADD_9_CHORD_PATTERN = new ChordPattern("Add 9", ADD_9, degrees("1", "3", "5", "9"));

export const ADD_11_CHORD_PATTERN = new ChordPattern(
  "Add 11",
  ADD_11,
  degrees("1", "3", "5", "11"),
);

/** Todos os padrões do banco, na ordem de exibição (tríades → sextas → sétimas). */
export const CHORD_PATTERNS: ChordPattern[] = [
  MAJOR_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  AUGMENTED_CHORD_PATTERN,
  SUS2_CHORD_PATTERN,
  SUS4_CHORD_PATTERN,

  SIXTH_CHORD_PATTERN,
  MINOR_SIXTH_CHORD_PATTERN,

  MAJOR_7_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  DIMINISHED_7_CHORD_PATTERN,
  MINOR_MAJOR_7_CHORD_PATTERN,

  DOMINANT_9_CHORD_PATTERN,
  MAJOR_9_CHORD_PATTERN,
  MINOR_9_CHORD_PATTERN,
  DOMINANT_11_CHORD_PATTERN,
  DOMINANT_13_CHORD_PATTERN,

  DOMINANT_7_FLAT_9_CHORD_PATTERN,
  DOMINANT_7_SHARP_9_CHORD_PATTERN,
  DOMINANT_7_FLAT_5_CHORD_PATTERN,
  DOMINANT_7_SHARP_5_CHORD_PATTERN,

  ADD_9_CHORD_PATTERN,
  ADD_11_CHORD_PATTERN,
];
