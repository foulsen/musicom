import type { Note, SingleNote } from "@music-workspace/music-theory";

/** Caminho cromático de uma corda solta até uma casa: cada semitom é uma casa. */
export interface NotePath {
  openNote: SingleNote;
  fret: number;
  /** Da corda solta até a casa (inclusive): tem `fret + 1` notas. */
  path: SingleNote[];
}

/**
 * Explica de onde vem a nota de uma casa: partindo da nota da corda solta e subindo
 * um semitom por casa. A transposição é do domínio (`Note.transpose`) — a UI só formata.
 */
export function notePath(openNote: Note, fret: number): NotePath {
  const path = Array.from({ length: fret + 1 }, (_, step) => openNote.transpose(step).value);

  return { openNote: openNote.value, fret, path };
}
