import { CHROMATIC_SCALE, SingleNote } from "./chromatic-scale";

export class Note {
  constructor(public readonly value: SingleNote) {}

  static from(value: SingleNote): Note {
    return new Note(value);
  }

  index(): number {
    return CHROMATIC_SCALE.indexOf(this.value);
  }

  transpose(semitones: number): Note {
    const index = (this.index() + semitones + CHROMATIC_SCALE.length) % CHROMATIC_SCALE.length;

    return new Note(CHROMATIC_SCALE[index]);
  }

  distanceTo(note: Note): number {
    return (note.index() - this.index() + 12) % 12;
  }

  toString(): string {
    return this.value;
  }
}
