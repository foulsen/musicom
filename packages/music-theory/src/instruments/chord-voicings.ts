import { Note } from "../notes/note";

import { ChordVoicing, GuitarChord } from "./chord-voicing";

/**
 * Banco de acordes predefinidos (hardcoded), em afinação padrão (EADGBE).
 * Cada digitação lista a casa por corda, da 6ª (grave) à 1ª (aguda):
 * `null` = abafada, `0` = solta.
 */

export const C_MAJOR_CHORD = new GuitarChord("C", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 0, 1, 0]), // posição aberta
  new ChordVoicing([null, 3, 5, 5, 5, 3]), // forma de A, 3ª casa
  new ChordVoicing([8, 10, 10, 9, 8, 8]), // forma de E, 8ª casa
]);

export const G_MAJOR_CHORD = new GuitarChord("G", Note.from("G"), [
  new ChordVoicing([3, 2, 0, 0, 0, 3]),
]);

export const D_MAJOR_CHORD = new GuitarChord("D", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 2]),
]);

export const A_MAJOR_CHORD = new GuitarChord("A", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 2, 0]),
]);

export const E_MAJOR_CHORD = new GuitarChord("E", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 1, 0, 0]),
]);

export const A_MINOR_CHORD = new GuitarChord("Am", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 1, 0]),
]);

export const E_MINOR_CHORD = new GuitarChord("Em", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 0, 0, 0]),
]);

export const D_MINOR_CHORD = new GuitarChord("Dm", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 1]),
]);

/** Todos os acordes do banco, na ordem de exibição. */
export const PREDEFINED_CHORDS: GuitarChord[] = [
  C_MAJOR_CHORD,
  G_MAJOR_CHORD,
  D_MAJOR_CHORD,
  A_MAJOR_CHORD,
  E_MAJOR_CHORD,
  A_MINOR_CHORD,
  E_MINOR_CHORD,
  D_MINOR_CHORD,
];
