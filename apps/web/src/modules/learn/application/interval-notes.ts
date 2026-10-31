import { Note, SpelledNote, type SingleNote } from "@music-workspace/music-theory";

/**
 * Quantas letras acima da fundamental cai cada intervalo (0–11 semitons): a regra "uma letra por
 * grau" — uma terça maior de E é G#, nunca Ab. O trítono (6) é grafado como quarta aumentada.
 */
const LETTER_STEPS = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];

const OCTAVE_LETTER_STEPS = 7;

/** Nota `semitones` acima de `root`, com a grafia correta para o intervalo (12 = a própria fundamental, uma oitava acima). */
export function spellIntervalAbove(root: SingleNote, semitones: number): SpelledNote {
  const rootNote = Note.from(root);
  const letterSteps = semitones === 12 ? OCTAVE_LETTER_STEPS : LETTER_STEPS[((semitones % 12) + 12) % 12];

  return SpelledNote.spell(SpelledNote.fromNote(rootNote), letterSteps, rootNote.transpose(semitones).index());
}
