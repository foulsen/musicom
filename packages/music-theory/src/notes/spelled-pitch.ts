import { CHROMATIC_SCALE } from "./chromatic-scale";
import { Note } from "./note";
import { Pitch } from "./pitch";
import { Letter, SpelledNote } from "./spelled-note";

const LETTERS: readonly Letter[] = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const PITCH_PATTERN = /^([A-G])(##|#|bb|b)?(-?\d)$/;

/**
 * Nota grafada (letra + acidente) com a oitava da LETRA: B#3 soa como C4,
 * mas continua escrita na oitava 3. Necessária para posicionar notas na pauta.
 */
export class SpelledPitch {
  constructor(
    public readonly spelled: SpelledNote,
    public readonly octave: number,
  ) {}

  static of(letter: Letter, accidental: number, octave: number): SpelledPitch {
    return new SpelledPitch(new SpelledNote(letter, accidental), octave);
  }

  /** Aceita "C4", "F#5", "Bb3", "Ebb2", "G##4". */
  static parse(text: string): SpelledPitch {
    const match = PITCH_PATTERN.exec(text);
    if (!match) {
      throw new Error(`Invalid spelled pitch: "${text}"`);
    }

    const [, letter, symbol = "", octave] = match;
    const accidental = symbol === "" ? 0 : symbol[0] === "#" ? symbol.length : -symbol.length;

    return SpelledPitch.of(letter as Letter, accidental, Number(octave));
  }

  /** Inverso de `diatonicIndex()` (C4 = 28). */
  static fromDiatonicIndex(index: number, accidental = 0): SpelledPitch {
    const octave = Math.floor(index / 7);
    const letterIndex = index - octave * 7;

    return SpelledPitch.of(LETTERS[letterIndex], accidental, octave);
  }

  diatonicIndex(): number {
    return this.octave * 7 + LETTERS.indexOf(this.spelled.letter);
  }

  midi(): number {
    const natural = LETTER_SEMITONES[LETTERS.indexOf(this.spelled.letter)];

    return (this.octave + 1) * 12 + natural + this.spelled.accidental;
  }

  /** Altura que soa (B#3 -> C4). */
  pitch(): Pitch {
    const midi = this.midi();
    const index = ((midi % 12) + 12) % 12;

    return new Pitch(new Note(CHROMATIC_SCALE[index]), Math.floor(midi / 12) - 1);
  }

  withAccidental(accidental: number): SpelledPitch {
    return SpelledPitch.of(this.spelled.letter, accidental, this.octave);
  }

  equals(other: SpelledPitch): boolean {
    return (
      this.spelled.letter === other.spelled.letter &&
      this.spelled.accidental === other.spelled.accidental &&
      this.octave === other.octave
    );
  }

  toString(): string {
    return `${this.spelled}${this.octave}`;
  }
}
