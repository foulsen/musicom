import { Letter, SpelledNote } from "../notes/spelled-note";

export type KeyMode = "major" | "minor";

const C_MAJOR = new SpelledNote("C", 0);
const SHARP_ORDER: readonly Letter[] = ["F", "C", "G", "D", "A", "E", "B"];
const FLAT_ORDER: readonly Letter[] = ["B", "E", "A", "D", "G", "C", "F"];

const mod = (value: number, divisor: number): number => ((value % divisor) + divisor) % divisor;

/** Armadura de clave, expressa em quintas a partir de C (positivo = sustenidos). */
export class KeySignature {
  constructor(public readonly fifths: number) {
    if (!Number.isInteger(fifths) || fifths < -7 || fifths > 7) {
      throw new RangeError(`Key signature must be between -7 and 7 fifths, got ${fifths}`);
    }
  }

  static forMajor(tonic: SpelledNote): KeySignature {
    for (let fifths = -7; fifths <= 7; fifths++) {
      const candidate = new KeySignature(fifths).majorTonic();
      if (candidate.letter === tonic.letter && candidate.accidental === tonic.accidental) {
        return new KeySignature(fifths);
      }
    }

    throw new RangeError(`${tonic} major has no key signature within 7 sharps or flats`);
  }

  static forMinor(tonic: SpelledNote): KeySignature {
    for (let fifths = -7; fifths <= 7; fifths++) {
      const candidate = new KeySignature(fifths).minorTonic();
      if (candidate.letter === tonic.letter && candidate.accidental === tonic.accidental) {
        return new KeySignature(fifths);
      }
    }

    throw new RangeError(`${tonic} minor has no key signature within 7 sharps or flats`);
  }

  /** C G D A E B F# C# | F Bb Eb Ab Db Gb Cb */
  majorTonic(): SpelledNote {
    // cada quinta acima = 4 letras acima e 7 semitons
    return SpelledNote.spell(C_MAJOR, mod(4 * this.fifths, 7), mod(7 * this.fifths, 12));
  }

  /** Relativa menor: 2 letras e 3 semitons abaixo da tônica maior. */
  minorTonic(): SpelledNote {
    const major = this.majorTonic();

    return SpelledNote.spell(major, 5, mod(major.pitchClass() - 3, 12));
  }

  tonic(mode: KeyMode): SpelledNote {
    return mode === "major" ? this.majorTonic() : this.minorTonic();
  }

  /** Sustenidos (F# C# G# D# A# E# B#) ou bemóis (Bb Eb Ab Db Gb Cb Fb), na ordem de escrita. */
  accidentals(): SpelledNote[] {
    const count = Math.abs(this.fifths);
    const accidental = this.fifths > 0 ? 1 : -1;
    const order = this.fifths > 0 ? SHARP_ORDER : FLAT_ORDER;

    return order.slice(0, count).map((letter) => new SpelledNote(letter, accidental));
  }

  accidentalFor(letter: Letter): number {
    const affected = this.accidentals().find((note) => note.letter === letter);

    return affected ? affected.accidental : 0;
  }
}

export const KEY_SIGNATURES: KeySignature[] = Array.from({ length: 15 }, (_, i) => new KeySignature(i - 7));
