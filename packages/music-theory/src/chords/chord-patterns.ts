import { Interval } from "../intervals/interval";

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

// ── Tríades ────────────────────────────────────────────────────────────────

export const MAJOR_CHORD_PATTERN = new ChordPattern("Major", MAJOR, [
  Interval.unison(),
  Interval.majorThird(),
  Interval.perfectFifth(),
]);

export const MINOR_CHORD_PATTERN = new ChordPattern("Minor", MINOR, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.perfectFifth(),
]);

export const DIMINISHED_CHORD_PATTERN = new ChordPattern("Diminished", DIMINISHED, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.tritone(),
]);

export const AUGMENTED_CHORD_PATTERN = new ChordPattern("Augmented", AUGMENTED, [
  Interval.unison(),
  Interval.majorThird(),
  Interval.minorSixth(),
]);

export const SUS2_CHORD_PATTERN = new ChordPattern("Suspended 2nd", SUS2, [
  Interval.unison(),
  Interval.majorSecond(),
  Interval.perfectFifth(),
]);

export const SUS4_CHORD_PATTERN = new ChordPattern("Suspended 4th", SUS4, [
  Interval.unison(),
  Interval.perfectFourth(),
  Interval.perfectFifth(),
]);

// ── Sextas ───────────────────────────────────────────────────────────────────

export const SIXTH_CHORD_PATTERN = new ChordPattern("Sixth", SIXTH, [
  Interval.unison(),
  Interval.majorThird(),
  Interval.perfectFifth(),
  Interval.majorSixth(),
]);

export const MINOR_SIXTH_CHORD_PATTERN = new ChordPattern("Minor Sixth", MINOR_SIXTH, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.perfectFifth(),
  Interval.majorSixth(),
]);

// ── Sétimas ──────────────────────────────────────────────────────────────────

export const MAJOR_7_CHORD_PATTERN = new ChordPattern("Major 7th", MAJOR_7, [
  Interval.unison(),
  Interval.majorThird(),
  Interval.perfectFifth(),
  Interval.majorSeventh(),
]);

export const MINOR_7_CHORD_PATTERN = new ChordPattern("Minor 7th", MINOR_7, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.perfectFifth(),
  Interval.minorSeventh(),
]);

export const DOMINANT_7_CHORD_PATTERN = new ChordPattern("Dominant 7th", DOMINANT_7, [
  Interval.unison(),
  Interval.majorThird(),
  Interval.perfectFifth(),
  Interval.minorSeventh(),
]);

export const HALF_DIMINISHED_CHORD_PATTERN = new ChordPattern(
  "Half-diminished 7th",
  HALF_DIMINISHED,
  [
    Interval.unison(),
    Interval.minorThird(),
    Interval.tritone(),
    Interval.minorSeventh(),
  ],
);

export const DIMINISHED_7_CHORD_PATTERN = new ChordPattern("Diminished 7th", DIMINISHED_7, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.tritone(),
  Interval.majorSixth(),
]);

export const MINOR_MAJOR_7_CHORD_PATTERN = new ChordPattern("Minor-major 7th", MINOR_MAJOR_7, [
  Interval.unison(),
  Interval.minorThird(),
  Interval.perfectFifth(),
  Interval.majorSeventh(),
]);

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
