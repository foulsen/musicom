import { Pitch } from "../notes/pitch";
import { Tuning } from "./tuning";

export const STANDARD_GUITAR_TUNING = new Tuning("Standard", [
  Pitch.from("E", 2),
  Pitch.from("A", 2),
  Pitch.from("D", 3),
  Pitch.from("G", 3),
  Pitch.from("B", 3),
  Pitch.from("E", 4),
]);

export const DROP_D_TUNING = new Tuning("Drop D", [
  Pitch.from("D", 2),
  Pitch.from("A", 2),
  Pitch.from("D", 3),
  Pitch.from("G", 3),
  Pitch.from("B", 3),
  Pitch.from("E", 4),
]);

// Meio-tom abaixo (Eb). CHROMATIC_SCALE só tem sustenidos, então as notas
// aparecem como D#/G#/... — os nomes bemol são só enarmônicos.
export const HALF_STEP_DOWN_TUNING = new Tuning("Half Step Down", [
  Pitch.from("D#", 2),
  Pitch.from("G#", 2),
  Pitch.from("C#", 3),
  Pitch.from("F#", 3),
  Pitch.from("A#", 3),
  Pitch.from("D#", 4),
]);

export const TUNINGS = [
  STANDARD_GUITAR_TUNING,
  DROP_D_TUNING,
  HALF_STEP_DOWN_TUNING,
];
