import { CHROMATIC_SCALE, SingleNote } from "./chromatic-scale";
import { Note } from "./note";

/**
 * Altura absoluta = classe de altura (Note) + oitava (notação científica,
 * onde C4 = MIDI 60). Diferente de `Note`, que é apenas a classe de altura.
 */
export class Pitch {
  constructor(
    public readonly note: Note,
    public readonly octave: number,
  ) {}

  static from(value: SingleNote, octave: number): Pitch {
    return new Pitch(Note.from(value), octave);
  }

  midi(): number {
    return (this.octave + 1) * 12 + this.note.index();
  }

  frequency(): number {
    return 440 * 2 ** ((this.midi() - 69) / 12);
  }

  transpose(semitones: number): Pitch {
    const midi = this.midi() + semitones;
    const index = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;

    return new Pitch(new Note(CHROMATIC_SCALE[index]), octave);
  }

  toString(): string {
    return `${this.note}${this.octave}`;
  }
}
