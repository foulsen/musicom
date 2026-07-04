import { CHROMATIC_SCALE } from "./chromatic-scale";
import { Note } from "./note";

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_PITCH_CLASSES = [0, 2, 4, 5, 7, 9, 11];

export type Letter = (typeof LETTERS)[number];

/**
 * Nota com grafia explícita (letra + acidente), separada da classe de altura.
 * A altura é derivada da grafia — o inverso não: D# e Eb têm a mesma altura,
 * mas grafias diferentes conforme o contexto tonal.
 */
export class SpelledNote {
  constructor(
    public readonly letter: Letter,
    public readonly accidental: number,
  ) {}

  /** Deriva a grafia de uma classe de altura com nome em sustenido (ex.: C#). */
  static fromNote(note: Note): SpelledNote {
    const letter = note.value[0] as Letter;
    const accidental = note.value.length - 1; // nº de "#"

    return new SpelledNote(letter, accidental);
  }

  /**
   * Grafa a nota `diatonicStep` letras acima de `root`, ajustando o acidente
   * para atingir `targetPitchClass` (regra "uma letra por grau").
   */
  static spell(
    root: SpelledNote,
    diatonicStep: number,
    targetPitchClass: number,
  ): SpelledNote {
    const letterIndex = (LETTERS.indexOf(root.letter) + diatonicStep) % LETTERS.length;
    const natural = LETTER_PITCH_CLASSES[letterIndex];

    let accidental = (targetPitchClass - natural) % 12;
    if (accidental > 6) accidental -= 12;
    if (accidental < -6) accidental += 12;

    return new SpelledNote(LETTERS[letterIndex], accidental);
  }

  pitchClass(): number {
    const natural = LETTER_PITCH_CLASSES[LETTERS.indexOf(this.letter)];
    return (((natural + this.accidental) % 12) + 12) % 12;
  }

  note(): Note {
    return new Note(CHROMATIC_SCALE[this.pitchClass()]);
  }

  toString(): string {
    if (this.accidental === 0) {
      return this.letter;
    }

    const symbol = this.accidental > 0 ? "#" : "b";
    return this.letter + symbol.repeat(Math.abs(this.accidental));
  }
}
