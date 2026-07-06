import { Degree } from "../scales/degree";

import { ChordPattern } from "./chord-pattern";
import {
  AUGMENTED,
  DIMINISHED,
  DIMINISHED_7,
  DOMINANT_7,
  HALF_DIMINISHED,
  MAJOR,
  MAJOR_7,
  MINOR,
  MINOR_7,
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
];
