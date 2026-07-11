import { Pitch, type Chord } from "@music-workspace/music-theory";

/**
 * Alturas absolutas de um `Chord` teórico, empilhadas a partir da fundamental numa
 * oitava fixa — para tocar o acorde inteiro (não só clicar nota a nota). Mesma
 * técnica do fix de correção do Ear Training: transpõe a partir de `Pitch.from`
 * (nunca por `Note` + oitava fixa), então a ordem nunca "cai" de oitava ao cruzar B->C.
 */
export function chordPitches(chord: Chord, octave = 4): Pitch[] {
  const rootPitch = Pitch.from(chord.root.value, octave);

  return chord.notes.map((note) => rootPitch.transpose(chord.root.distanceTo(note)));
}
