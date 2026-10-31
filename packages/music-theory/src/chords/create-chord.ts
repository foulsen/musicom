import { Note } from "../notes/note";
import { SpelledNote } from "../notes/spelled-note";
import { Degree } from "../scales/degree";

import { Chord } from "./chord";
import { ChordPattern } from "./chord-pattern";

/** Um acorde isolado é construído sobre a própria fundamental (grau 1). */
const ROOT_DEGREE = new Degree("1");

/**
 * Monta um acorde a partir de uma fundamental e uma fórmula (`ChordPattern`).
 * Espelho do `createScale`: deriva as notas (via `Degree.semitones`) e a grafia
 * enarmônica (regra uma-letra-por-grau, via `Degree.position`) a partir dos graus
 * do acorde. A UI não reimplementa essa regra.
 *
 * `spelledRoot` permite fundamentais com bemol (Db, Eb…): `Note` só conhece nomes em
 * sustenido, então a grafia da raiz vem de fora — e deve ter a mesma altura de `root`.
 */
export function createChord(root: Note, pattern: ChordPattern, spelledRoot?: SpelledNote): Chord {
  const rootSpelling = spelledRoot ?? SpelledNote.fromNote(root);

  const notes: Note[] = [];
  const spelledNotes: SpelledNote[] = [];

  pattern.degrees.forEach((degree) => {
    const note = root.transpose(degree.semitones());

    notes.push(note);
    spelledNotes.push(SpelledNote.spell(rootSpelling, degree.position() - 1, note.index()));
  });

  return new Chord(root, pattern.quality, ROOT_DEGREE, notes, rootSpelling, undefined, [], spelledNotes);
}
