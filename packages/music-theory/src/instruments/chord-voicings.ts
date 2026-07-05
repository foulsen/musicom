import { Note } from "../notes/note";

import { ChordVoicing, GuitarChord } from "./chord-voicing";

/**
 * Banco de acordes predefinidos (hardcoded), em afinação padrão (EADGBE).
 * Cada digitação lista a casa por corda, da 6ª (grave) à 1ª (aguda):
 * `null` = abafada, `0` = solta.
 *
 * As posições móveis seguem as formas clássicas de barra:
 * - forma de E (fundamental na 6ª corda): maior `[f, f+2, f+2, f+1, f, f]`,
 *   menor `[f, f+2, f+2, f, f, f]`;
 * - forma de A (fundamental na 5ª corda): maior `[·, f, f+2, f+2, f+2, f]`,
 *   menor `[·, f, f+2, f+2, f+1, f]`, diminuta `[·, f, f+1, f+2, f+1, ·]`.
 */

// ── Tríades maiores ──────────────────────────────────────────────────────────

export const C_MAJOR_CHORD = new GuitarChord("C", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 0, 1, 0]), // posição aberta
  new ChordVoicing([null, 3, 5, 5, 5, 3]), // forma de A, 3ª casa
  new ChordVoicing([8, 10, 10, 9, 8, 8]), // forma de E, 8ª casa
]);

export const D_MAJOR_CHORD = new GuitarChord("D", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 2]), // posição aberta
  new ChordVoicing([null, 5, 7, 7, 7, 5]), // forma de A, 5ª casa
]);

export const E_MAJOR_CHORD = new GuitarChord("E", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 1, 0, 0]), // posição aberta
  new ChordVoicing([null, 7, 9, 9, 9, 7]), // forma de A, 7ª casa
]);

export const F_MAJOR_CHORD = new GuitarChord("F", Note.from("F"), [
  new ChordVoicing([1, 3, 3, 2, 1, 1]), // forma de E, 1ª casa
]);

export const F_SHARP_MAJOR_CHORD = new GuitarChord("F#", Note.from("F#"), [
  new ChordVoicing([2, 4, 4, 3, 2, 2]), // forma de E, 2ª casa
]);

export const G_MAJOR_CHORD = new GuitarChord("G", Note.from("G"), [
  new ChordVoicing([3, 2, 0, 0, 0, 3]), // posição aberta
  new ChordVoicing([3, 5, 5, 4, 3, 3]), // forma de E, 3ª casa
]);

export const A_MAJOR_CHORD = new GuitarChord("A", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 2, 0]), // posição aberta
  new ChordVoicing([5, 7, 7, 6, 5, 5]), // forma de E, 5ª casa
]);

export const B_FLAT_MAJOR_CHORD = new GuitarChord("Bb", Note.from("A#"), [
  new ChordVoicing([null, 1, 3, 3, 3, 1]), // forma de A, 1ª casa
]);

export const B_MAJOR_CHORD = new GuitarChord("B", Note.from("B"), [
  new ChordVoicing([null, 2, 4, 4, 4, 2]), // forma de A, 2ª casa
]);

// ── Tríades menores ──────────────────────────────────────────────────────────

export const C_MINOR_CHORD = new GuitarChord("Cm", Note.from("C"), [
  new ChordVoicing([null, 3, 5, 5, 4, 3]), // forma de A, 3ª casa
]);

export const C_SHARP_MINOR_CHORD = new GuitarChord("C#m", Note.from("C#"), [
  new ChordVoicing([null, 4, 6, 6, 5, 4]), // forma de A, 4ª casa
]);

export const D_MINOR_CHORD = new GuitarChord("Dm", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 1]), // posição aberta
]);

export const E_MINOR_CHORD = new GuitarChord("Em", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 0, 0, 0]), // posição aberta
  new ChordVoicing([null, 7, 9, 9, 8, 7]), // forma de A, 7ª casa
]);

export const F_SHARP_MINOR_CHORD = new GuitarChord("F#m", Note.from("F#"), [
  new ChordVoicing([2, 4, 4, 2, 2, 2]), // forma de E, 2ª casa
]);

export const G_MINOR_CHORD = new GuitarChord("Gm", Note.from("G"), [
  new ChordVoicing([3, 5, 5, 3, 3, 3]), // forma de E, 3ª casa
]);

export const G_SHARP_MINOR_CHORD = new GuitarChord("G#m", Note.from("G#"), [
  new ChordVoicing([4, 6, 6, 4, 4, 4]), // forma de E, 4ª casa
]);

export const A_MINOR_CHORD = new GuitarChord("Am", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 1, 0]), // posição aberta
  new ChordVoicing([5, 7, 7, 5, 5, 5]), // forma de E, 5ª casa
]);

export const B_MINOR_CHORD = new GuitarChord("Bm", Note.from("B"), [
  new ChordVoicing([null, 2, 4, 4, 3, 2]), // forma de A, 2ª casa
]);

// ── Tríades diminutas (sensível dos tons maiores comuns) ─────────────────────

export const B_DIM_CHORD = new GuitarChord("Bdim", Note.from("B"), [
  new ChordVoicing([null, 2, 3, 4, 3, null]),
]);

export const C_SHARP_DIM_CHORD = new GuitarChord("C#dim", Note.from("C#"), [
  new ChordVoicing([null, 4, 5, 6, 5, null]),
]);

export const D_SHARP_DIM_CHORD = new GuitarChord("D#dim", Note.from("D#"), [
  new ChordVoicing([null, 6, 7, 8, 7, null]),
]);

export const F_SHARP_DIM_CHORD = new GuitarChord("F#dim", Note.from("F#"), [
  new ChordVoicing([null, 9, 10, 11, 10, null]),
]);

export const G_SHARP_DIM_CHORD = new GuitarChord("G#dim", Note.from("G#"), [
  new ChordVoicing([null, 11, 12, 13, 12, null]),
]);

export const A_SHARP_DIM_CHORD = new GuitarChord("A#dim", Note.from("A#"), [
  new ChordVoicing([null, 1, 2, 3, 2, null]),
]);

/** Todos os acordes do banco, na ordem de exibição. */
export const PREDEFINED_CHORDS: GuitarChord[] = [
  // Maiores
  C_MAJOR_CHORD,
  D_MAJOR_CHORD,
  E_MAJOR_CHORD,
  F_MAJOR_CHORD,
  F_SHARP_MAJOR_CHORD,
  G_MAJOR_CHORD,
  A_MAJOR_CHORD,
  B_FLAT_MAJOR_CHORD,
  B_MAJOR_CHORD,

  // Menores
  C_MINOR_CHORD,
  C_SHARP_MINOR_CHORD,
  D_MINOR_CHORD,
  E_MINOR_CHORD,
  F_SHARP_MINOR_CHORD,
  G_MINOR_CHORD,
  G_SHARP_MINOR_CHORD,
  A_MINOR_CHORD,
  B_MINOR_CHORD,

  // Diminutas
  B_DIM_CHORD,
  C_SHARP_DIM_CHORD,
  D_SHARP_DIM_CHORD,
  F_SHARP_DIM_CHORD,
  G_SHARP_DIM_CHORD,
  A_SHARP_DIM_CHORD,
];
