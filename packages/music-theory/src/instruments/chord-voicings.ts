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
  new ChordVoicing([8, 7, 5, 5, 5, 8]), // forma de E, 8ª casa
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

// ── Suspensos: sus2 ──────────────────────────────────────────────────────────
// sus2 = {root, 2, 5}. C={0,2,7}, A={9,11,4}, D={2,4,9}, E={4,6,11}, G={7,9,2}.

export const A_SUS2_CHORD = new GuitarChord("Asus2", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 0, 0]), // aberta: A E A B E
]);

export const D_SUS2_CHORD = new GuitarChord("Dsus2", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 0]), // aberta: D A D E
]);

export const E_SUS2_CHORD = new GuitarChord("Esus2", Note.from("E"), [
  new ChordVoicing([0, 2, 4, 4, 0, 0]), // E B F# B E
]);

export const C_SUS2_CHORD = new GuitarChord("Csus2", Note.from("C"), [
  new ChordVoicing([null, 3, 0, 0, 1, 3]), // C D G C D
]);

export const G_SUS2_CHORD = new GuitarChord("Gsus2", Note.from("G"), [
  new ChordVoicing([3, 0, 0, 0, 3, 3]), // G A D G A D
]);

// ── Suspensos: sus4 ──────────────────────────────────────────────────────────
// sus4 = {root, 4, 5}. C={0,5,7}, A={9,2,4}, D={2,7,9}, E={4,9,11}, G={7,0,2}.

export const A_SUS4_CHORD = new GuitarChord("Asus4", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 3, 0]), // aberta: A E A D E
]);

export const D_SUS4_CHORD = new GuitarChord("Dsus4", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 3]), // aberta: D A D G
]);

export const E_SUS4_CHORD = new GuitarChord("Esus4", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 2, 0, 0]), // E B E A B E
]);

export const G_SUS4_CHORD = new GuitarChord("Gsus4", Note.from("G"), [
  new ChordVoicing([3, 3, 0, 0, 1, 3]), // G C D G C G
]);

export const C_SUS4_CHORD = new GuitarChord("Csus4", Note.from("C"), [
  new ChordVoicing([null, 3, 3, 0, 1, 1]), // C F G C F
]);

// ── Sextas: 6 ────────────────────────────────────────────────────────────────
// 6 = {root, 3rd, 5th, 6th}. C={0,4,7,9}, A={9,1,4,6}, D={2,6,9,11}, E={4,8,11,1}, G={7,11,2,4}.

export const C_SIX_CHORD = new GuitarChord("C6", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 2, 1, 0]), // C E A C E
]);

export const A_SIX_CHORD = new GuitarChord("A6", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 2, 2]), // A E A C# F#
]);

export const D_SIX_CHORD = new GuitarChord("D6", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 0, 2]), // D A B F#
]);

export const E_SIX_CHORD = new GuitarChord("E6", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 1, 2, 0]), // E B E G# C# E
]);

export const G_SIX_CHORD = new GuitarChord("G6", Note.from("G"), [
  new ChordVoicing([3, 2, 0, 0, 0, 0]), // G B D G B E
]);

// ── Sextas menores: m6 ───────────────────────────────────────────────────────
// m6 = {root, b3, 5th, 6th}. A={9,0,4,6}, D={2,5,9,11}, E={4,7,11,1}, C={0,3,7,9}.

export const A_MINOR_SIX_CHORD = new GuitarChord("Am6", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 2, 1, 2]), // A E A C F#
]);

export const D_MINOR_SIX_CHORD = new GuitarChord("Dm6", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 0, 1]), // D A B F
]);

export const E_MINOR_SIX_CHORD = new GuitarChord("Em6", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 0, 2, 0]), // E B E G C# E
]);

export const C_MINOR_SIX_CHORD = new GuitarChord("Cm6", Note.from("C"), [
  new ChordVoicing([null, 3, 1, 2, 1, 3]), // C D# A C G
]);

// ── Sétimas maiores: maj7 ────────────────────────────────────────────────────
// maj7 = {root, 3rd, 5th, 7th}. C={0,4,7,11}, A={9,1,4,8}, D={2,6,9,1}, E={4,8,11,3}, G={7,11,2,6}, F={5,9,0,4}.

export const C_MAJ7_CHORD = new GuitarChord("Cmaj7", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 0, 0, 0]), // C E G B E
]);

export const A_MAJ7_CHORD = new GuitarChord("Amaj7", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 1, 2, 0]), // A E G# C# E
]);

export const D_MAJ7_CHORD = new GuitarChord("Dmaj7", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 2, 2]), // D A C# F#
]);

export const E_MAJ7_CHORD = new GuitarChord("Emaj7", Note.from("E"), [
  new ChordVoicing([0, 2, 1, 1, 0, 0]), // E B D# G# B E
]);

export const G_MAJ7_CHORD = new GuitarChord("Gmaj7", Note.from("G"), [
  new ChordVoicing([3, 2, 0, 0, 0, 2]), // G B D G B F#
]);

export const F_MAJ7_CHORD = new GuitarChord("Fmaj7", Note.from("F"), [
  new ChordVoicing([null, null, 3, 2, 1, 0]), // F A C E
]);

// ── Sétimas menores: m7 ──────────────────────────────────────────────────────
// m7 = {root, b3, 5th, b7}. A={9,0,4,7}, D={2,5,9,0}, E={4,7,11,2}, C={0,3,7,10}, G={7,10,2,5}, B={11,2,6,9}.

export const A_M7_CHORD = new GuitarChord("Am7", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 0, 1, 0]), // A E G C E
]);

export const D_M7_CHORD = new GuitarChord("Dm7", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 1, 1]), // D A C F
]);

export const E_M7_CHORD = new GuitarChord("Em7", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 0, 0, 0]), // E B D G B E
]);

export const C_M7_CHORD = new GuitarChord("Cm7", Note.from("C"), [
  new ChordVoicing([null, 3, 5, 3, 4, 3]), // forma de A, 3ª casa
]);

export const G_M7_CHORD = new GuitarChord("Gm7", Note.from("G"), [
  new ChordVoicing([3, 5, 3, 3, 3, 3]), // forma de E, 3ª casa
]);

export const B_M7_CHORD = new GuitarChord("Bm7", Note.from("B"), [
  new ChordVoicing([null, 2, 4, 2, 3, 2]), // forma de A, 2ª casa
]);

// ── Sétimas dominantes: 7 ────────────────────────────────────────────────────
// 7 = {root, 3rd, 5th, b7}. C={0,4,7,10}, A={9,1,4,7}, D={2,6,9,0}, E={4,8,11,2}, G={7,11,2,5}, B={11,3,6,9}.

export const C_SEVEN_CHORD = new GuitarChord("C7", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 3, 1, 0]), // C E Bb C E
]);

export const A_SEVEN_CHORD = new GuitarChord("A7", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 0, 2, 0]), // A E G C# E
]);

export const D_SEVEN_CHORD = new GuitarChord("D7", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 1, 2]), // D A C F#
]);

export const E_SEVEN_CHORD = new GuitarChord("E7", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 1, 0, 0]), // E B D G# B E
]);

export const G_SEVEN_CHORD = new GuitarChord("G7", Note.from("G"), [
  new ChordVoicing([3, 2, 0, 0, 0, 1]), // G B D G B F
]);

export const B_SEVEN_CHORD = new GuitarChord("B7", Note.from("B"), [
  new ChordVoicing([null, 2, 1, 2, 0, 2]), // B D# A B F#
]);

// ── Meio-diminutos: m7b5 ─────────────────────────────────────────────────────
// m7b5 = {root, b3, b5, b7}. B={11,2,5,9}, C#={1,4,7,11}, D={2,5,8,0}, F#={6,9,0,4}, E={4,7,10,2}, A={9,0,3,7}.

export const B_M7B5_CHORD = new GuitarChord("Bm7b5", Note.from("B"), [
  new ChordVoicing([null, 2, 3, 2, 3, null]), // B F A D
]);

export const C_SHARP_M7B5_CHORD = new GuitarChord("C#m7b5", Note.from("C#"), [
  new ChordVoicing([null, 4, 5, 4, 5, null]), // C# G B E
]);

export const D_M7B5_CHORD = new GuitarChord("Dm7b5", Note.from("D"), [
  new ChordVoicing([null, null, 0, 1, 1, 1]), // D Ab C F
]);

export const E_M7B5_CHORD = new GuitarChord("Em7b5", Note.from("E"), [
  new ChordVoicing([0, 1, 0, 0, 3, null]), // E Bb D G D
]);

// ── Diminutos com sétima: dim7 ───────────────────────────────────────────────
// dim7 = {root, b3, b5, bb7}. C={0,3,6,9}, C#={1,4,7,10}, D={2,5,8,11}, D#={3,6,9,0}.

export const C_DIM7_CHORD = new GuitarChord("Cdim7", Note.from("C"), [
  new ChordVoicing([null, 3, 4, 2, 4, null]), // C F# A D#
]);

export const C_SHARP_DIM7_CHORD = new GuitarChord("C#dim7", Note.from("C#"), [
  new ChordVoicing([null, 4, 5, 3, 5, null]),
]);

export const D_DIM7_CHORD = new GuitarChord("Ddim7", Note.from("D"), [
  new ChordVoicing([null, null, 0, 1, 0, 1]), // D Ab B F
]);

// ── Menores com sétima maior: mMaj7 ──────────────────────────────────────────
// mMaj7 = {root, b3, 5th, 7th}. A={9,0,4,8}, D={2,5,9,1}, E={4,7,11,3}, C={0,3,7,11}.

export const A_MMAJ7_CHORD = new GuitarChord("AmMaj7", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 1, 1, 0]), // A E G# C E
]);

export const D_MMAJ7_CHORD = new GuitarChord("DmMaj7", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 2, 1]), // D A C# F
]);

export const E_MMAJ7_CHORD = new GuitarChord("EmMaj7", Note.from("E"), [
  new ChordVoicing([0, 2, 1, 0, 0, 0]), // E B D# G B E
]);

// ── Novenas dominantes: 9 ────────────────────────────────────────────────────
// 9 = {root, 3rd, 5th, b7, 9}. C={0,4,7,10,2}, A={9,1,4,7,11}, E={4,8,11,2,6}, D={2,6,9,0,4}, G={7,11,2,5,9}.

export const C_NINE_CHORD = new GuitarChord("C9", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 3, 3, 3]), // C E Bb D G
]);

export const A_NINE_CHORD = new GuitarChord("A9", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 0, 2, 0]), // A E G C# E
]);

export const E_NINE_CHORD = new GuitarChord("E9", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 1, 0, 2]), // E B D G# B F#
]);

export const G_NINE_CHORD = new GuitarChord("G9", Note.from("G"), [
  new ChordVoicing([3, 0, 0, 0, 0, 1]), // G A D G B F
]);

// ── Novenas maiores: maj9 ────────────────────────────────────────────────────
// maj9 = {root, 3rd, 5th, 7th, 9}. C={0,4,7,11,2}, A={9,1,4,8,11}, G={7,11,2,6,9}.

export const C_MAJ9_CHORD = new GuitarChord("Cmaj9", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 4, 3, 0]), // C E B D E
]);

export const A_MAJ9_CHORD = new GuitarChord("Amaj9", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 1, 0, 0]), // A E G# B E
]);

export const G_MAJ9_CHORD = new GuitarChord("Gmaj9", Note.from("G"), [
  new ChordVoicing([3, 0, 0, 0, 0, 2]), // G A D G B F#
]);

// ── Novenas menores: m9 ──────────────────────────────────────────────────────
// m9 = {root, b3, 5th, b7, 9}. A={9,0,4,7,11}, E={4,7,11,2,6}, D={2,5,9,0,4}.

export const A_M9_CHORD = new GuitarChord("Am9", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 0, 1, 0]), // A E G C E
]);

export const E_M9_CHORD = new GuitarChord("Em9", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 0, 0, 2]), // E B D G B F#
]);

// ── Décimas primeiras (dominante): 11 ────────────────────────────────────────
// 11 = {root, (3rd), 5th, b7, 9, 11}. C11 uses {0,7,10,2,5}. G11={7,2,5,9,0}. A11={9,4,7,11,2}.

export const G_ELEVEN_CHORD = new GuitarChord("G11", Note.from("G"), [
  new ChordVoicing([3, 3, 0, 0, 1, 1]), // G C D G C F
]);

export const A_ELEVEN_CHORD = new GuitarChord("A11", Note.from("A"), [
  new ChordVoicing([null, 0, 0, 0, 0, 0]), // A D G B E
]);

// ── Décimas terceiras (dominante): 13 ────────────────────────────────────────
// 13 = {root, 3rd, (5th), b7, 9, 13}. C13={0,4,10,2,9}. G13={7,11,5,9,4}. E13={4,8,2,6,1}.

export const C_THIRTEEN_CHORD = new GuitarChord("C13", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 3, 3, 5]), // C E Bb D A
]);

export const G_THIRTEEN_CHORD = new GuitarChord("G13", Note.from("G"), [
  new ChordVoicing([3, null, 3, 4, 5, null]), // G F B E
]);

export const E_THIRTEEN_CHORD = new GuitarChord("E13", Note.from("E"), [
  new ChordVoicing([0, null, 0, 1, 2, 2]), // E D G# C# F#
]);

// ── Dominantes alterados: 7b9 ────────────────────────────────────────────────
// 7b9 = {root, 3rd, 5th, b7, b9}. C={0,4,7,10,1}, A={9,1,4,7,10}, E={4,8,11,2,5}, G={7,11,2,5,8}, B={11,3,6,9,0}.

export const C_SEVEN_FLAT_NINE_CHORD = new GuitarChord("C7b9", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 3, 2, 3]), // C E Bb C# G
]);

export const A_SEVEN_FLAT_NINE_CHORD = new GuitarChord("A7b9", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 3, 2, 3]), // A E A# C# G
]);

export const E_SEVEN_FLAT_NINE_CHORD = new GuitarChord("E7b9", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 1, 0, 1]), // E B D G# B F
]);

export const B_SEVEN_FLAT_NINE_CHORD = new GuitarChord("B7b9", Note.from("B"), [
  new ChordVoicing([null, 2, 1, 2, 1, 2]), // B D# A C F#
]);

// ── Dominantes alterados: 7#9 ────────────────────────────────────────────────
// 7#9 = {root, 3rd, 5th, b7, #9}. E={4,8,11,2,7}, A={9,1,4,7,0}, C={0,4,7,10,3}, G={7,11,2,5,10}.

export const E_SEVEN_SHARP_NINE_CHORD = new GuitarChord("E7#9", Note.from("E"), [
  new ChordVoicing([0, 2, 0, 1, 3, 3]), // E B D G# D G
]);

export const A_SEVEN_SHARP_NINE_CHORD = new GuitarChord("A7#9", Note.from("A"), [
  new ChordVoicing([5, 7, 5, 6, 8, 8]), // forma móvel na 5ª casa
]);

export const C_SEVEN_SHARP_NINE_CHORD = new GuitarChord("C7#9", Note.from("C"), [
  new ChordVoicing([8, 10, 8, 9, 11, 11]), // forma móvel na 8ª casa
]);

// ── Dominantes alterados: 7b5 ────────────────────────────────────────────────
// 7b5 = {root, 3rd, b5, b7}. C={0,4,6,10}, D={2,6,8,0}, E={4,8,10,2}, G={7,11,1,5}, A={9,1,3,7}.

export const C_SEVEN_FLAT_FIVE_CHORD = new GuitarChord("C7b5", Note.from("C"), [
  new ChordVoicing([null, 3, 4, 3, 5, null]), // C F# A# E
]);

export const D_SEVEN_FLAT_FIVE_CHORD = new GuitarChord("D7b5", Note.from("D"), [
  new ChordVoicing([null, null, 0, 1, 1, 2]), // D Ab C F#
]);

export const E_SEVEN_FLAT_FIVE_CHORD = new GuitarChord("E7b5", Note.from("E"), [
  new ChordVoicing([null, 7, 8, 7, 9, null]), // E A# D G# (forma móvel na 7ª casa)
]);

// ── Dominantes alterados: 7#5 ────────────────────────────────────────────────
// 7#5 = {root, 3rd, #5, b7}. C={0,4,8,10}, A={9,1,5,7}, E={4,8,0,2}, G={7,11,3,5}, D={2,6,10,0}.

export const C_SEVEN_SHARP_FIVE_CHORD = new GuitarChord("C7#5", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 3, 1, 4]), // C E Bb C G#
]);

export const A_SEVEN_SHARP_FIVE_CHORD = new GuitarChord("A7#5", Note.from("A"), [
  new ChordVoicing([null, 0, 3, 0, 2, 1]), // A F G C# F
]);

export const E_SEVEN_SHARP_FIVE_CHORD = new GuitarChord("E7#5", Note.from("E"), [
  new ChordVoicing([0, null, 0, 1, 1, 0]), // E D G# C E
]);

export const G_SEVEN_SHARP_FIVE_CHORD = new GuitarChord("G7#5", Note.from("G"), [
  new ChordVoicing([3, null, 3, 4, 4, null]), // G F B D#
]);

// ── Add9 ─────────────────────────────────────────────────────────────────────
// add9 = {root, 3rd, 5th, 9}. C={0,4,7,2}, A={9,1,4,11}, D={2,6,9,4}, E={4,8,11,6}, G={7,11,2,9}, F={5,9,0,7}.

export const C_ADD9_CHORD = new GuitarChord("Cadd9", Note.from("C"), [
  new ChordVoicing([null, 3, 2, 0, 3, 0]), // C E G D E
]);

export const A_ADD9_CHORD = new GuitarChord("Aadd9", Note.from("A"), [
  new ChordVoicing([null, 0, 2, 4, 2, 0]), // A E B C# E
]);

export const D_ADD9_CHORD = new GuitarChord("Dadd9", Note.from("D"), [
  new ChordVoicing([null, null, 0, 2, 3, 0]), // D A D E
]);

export const E_ADD9_CHORD = new GuitarChord("Eadd9", Note.from("E"), [
  new ChordVoicing([0, 2, 2, 1, 0, 2]), // E B E G# B F#
]);

export const G_ADD9_CHORD = new GuitarChord("Gadd9", Note.from("G"), [
  new ChordVoicing([3, 0, 0, 2, 0, 3]), // G A D A B G
]);

export const F_ADD9_CHORD = new GuitarChord("Fadd9", Note.from("F"), [
  new ChordVoicing([null, null, 3, 2, 1, 3]), // F A C G
]);

// ── Add11 ────────────────────────────────────────────────────────────────────
// add11 = {root, 3rd, 5th, 11}. C={0,4,7,5}, G={7,11,2,0}, A={9,1,4,2}, E={4,8,11,9}.

export const C_ADD11_CHORD = new GuitarChord("Cadd11", Note.from("C"), [
  new ChordVoicing([null, 3, 3, 0, 1, 0]), // C F G C E
]);

export const G_ADD11_CHORD = new GuitarChord("Gadd11", Note.from("G"), [
  new ChordVoicing([3, 3, 0, 0, 0, 3]), // G C D G B G
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

  // Suspensos (sus2)
  C_SUS2_CHORD,
  D_SUS2_CHORD,
  E_SUS2_CHORD,
  G_SUS2_CHORD,
  A_SUS2_CHORD,

  // Suspensos (sus4)
  C_SUS4_CHORD,
  D_SUS4_CHORD,
  E_SUS4_CHORD,
  G_SUS4_CHORD,
  A_SUS4_CHORD,

  // Sextas (6)
  C_SIX_CHORD,
  D_SIX_CHORD,
  E_SIX_CHORD,
  G_SIX_CHORD,
  A_SIX_CHORD,

  // Sextas menores (m6)
  C_MINOR_SIX_CHORD,
  D_MINOR_SIX_CHORD,
  E_MINOR_SIX_CHORD,
  A_MINOR_SIX_CHORD,

  // Sétimas maiores (maj7)
  C_MAJ7_CHORD,
  D_MAJ7_CHORD,
  E_MAJ7_CHORD,
  F_MAJ7_CHORD,
  G_MAJ7_CHORD,
  A_MAJ7_CHORD,

  // Sétimas menores (m7)
  C_M7_CHORD,
  D_M7_CHORD,
  E_M7_CHORD,
  G_M7_CHORD,
  A_M7_CHORD,
  B_M7_CHORD,

  // Sétimas dominantes (7)
  C_SEVEN_CHORD,
  D_SEVEN_CHORD,
  E_SEVEN_CHORD,
  G_SEVEN_CHORD,
  A_SEVEN_CHORD,
  B_SEVEN_CHORD,

  // Meio-diminutos (m7b5)
  B_M7B5_CHORD,
  C_SHARP_M7B5_CHORD,
  D_M7B5_CHORD,
  E_M7B5_CHORD,

  // Diminutos com sétima (dim7)
  C_DIM7_CHORD,
  C_SHARP_DIM7_CHORD,
  D_DIM7_CHORD,

  // Menores com sétima maior (mMaj7)
  A_MMAJ7_CHORD,
  D_MMAJ7_CHORD,
  E_MMAJ7_CHORD,

  // Novenas dominantes (9)
  C_NINE_CHORD,
  E_NINE_CHORD,
  G_NINE_CHORD,
  A_NINE_CHORD,

  // Novenas maiores (maj9)
  C_MAJ9_CHORD,
  G_MAJ9_CHORD,
  A_MAJ9_CHORD,

  // Novenas menores (m9)
  A_M9_CHORD,
  E_M9_CHORD,

  // Décimas primeiras (11)
  G_ELEVEN_CHORD,
  A_ELEVEN_CHORD,

  // Décimas terceiras (13)
  C_THIRTEEN_CHORD,
  E_THIRTEEN_CHORD,
  G_THIRTEEN_CHORD,

  // Dominantes 7b9
  C_SEVEN_FLAT_NINE_CHORD,
  E_SEVEN_FLAT_NINE_CHORD,
  A_SEVEN_FLAT_NINE_CHORD,
  B_SEVEN_FLAT_NINE_CHORD,

  // Dominantes 7#9
  C_SEVEN_SHARP_NINE_CHORD,
  E_SEVEN_SHARP_NINE_CHORD,
  A_SEVEN_SHARP_NINE_CHORD,

  // Dominantes 7b5
  C_SEVEN_FLAT_FIVE_CHORD,
  D_SEVEN_FLAT_FIVE_CHORD,
  E_SEVEN_FLAT_FIVE_CHORD,

  // Dominantes 7#5
  C_SEVEN_SHARP_FIVE_CHORD,
  E_SEVEN_SHARP_FIVE_CHORD,
  G_SEVEN_SHARP_FIVE_CHORD,
  A_SEVEN_SHARP_FIVE_CHORD,

  // Add9
  C_ADD9_CHORD,
  D_ADD9_CHORD,
  E_ADD9_CHORD,
  F_ADD9_CHORD,
  G_ADD9_CHORD,
  A_ADD9_CHORD,

  // Add11
  C_ADD11_CHORD,
  G_ADD11_CHORD,
];
