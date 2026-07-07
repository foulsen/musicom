import { ChordFamily } from "./chord-family";
import {
  AUGMENTED_CHORD_PATTERN,
  DIMINISHED_7_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  MAJOR_7_CHORD_PATTERN,
  MAJOR_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  MINOR_MAJOR_7_CHORD_PATTERN,
  SUS2_CHORD_PATTERN,
  SUS4_CHORD_PATTERN,
} from "./chord-patterns";

export const TRIADS_FAMILY = new ChordFamily("Triads", [
  MAJOR_CHORD_PATTERN,
  MINOR_CHORD_PATTERN,
  DIMINISHED_CHORD_PATTERN,
  AUGMENTED_CHORD_PATTERN,
  SUS2_CHORD_PATTERN,
  SUS4_CHORD_PATTERN,
]);

export const SEVENTH_FAMILY = new ChordFamily("Seventh", [
  MAJOR_7_CHORD_PATTERN,
  MINOR_7_CHORD_PATTERN,
  DOMINANT_7_CHORD_PATTERN,
  HALF_DIMINISHED_CHORD_PATTERN,
  DIMINISHED_7_CHORD_PATTERN,
  MINOR_MAJOR_7_CHORD_PATTERN,
]);

// Reservadas para expansão futura do banco de fórmulas (ver CHORD_STUDY_PAGE_PLAN).
export const EXTENDED_FAMILY = new ChordFamily("Extended", []);

export const ALTERED_FAMILY = new ChordFamily("Altered", []);

export const ADD_FAMILY = new ChordFamily("Add", []);

/** Famílias na ordem de exibição. Sextas ficam de fora por ora (irão para "Add"). */
export const CHORD_FAMILIES: ChordFamily[] = [
  TRIADS_FAMILY,
  SEVENTH_FAMILY,
  EXTENDED_FAMILY,
  ALTERED_FAMILY,
  ADD_FAMILY,
];
