import { Note } from "../notes/note";
import { ScalePattern } from "./scale-pattern";
import { DEGREE_MAPPING } from "../intervals/degree-mapping";
import { Chord } from "../chords/chord";
import { DOMINANT_7, HALF_DIMINISHED, MAJOR_7, MINOR_7 } from "../chords/chord-qualities";
import { ChordQuality } from "../chords/chord-quality";

export class Scale {
  constructor(
    public readonly root: Note,
    public readonly pattern: ScalePattern,
  ) {}

  notes(): Note[] {
    const notes: Note[] = [this.root];

    let current = this.root;

    for (let i = 0; i < this.pattern.intervals.length - 1; i++) {
      current = current.transpose(this.pattern.intervals[i].semitones);

      notes.push(current);
    }

    return notes;
  }

  degrees() {
    return this.notes().map((note) => {
      const distance = this.root.distanceTo(note);

      return {
        note,
        degree: DEGREE_MAPPING[distance],
      };
    });
  }

  triads(): Chord[] {
    const scaleDegrees = this.degrees();

    return scaleDegrees.map((item, index) => {
      const root = item.note;

      const third = scaleDegrees[(index + 2) % scaleDegrees.length].note;

      const fifth = scaleDegrees[(index + 4) % scaleDegrees.length].note;

      const rootToThird = root.distanceTo(third);

      const rootToFifth = root.distanceTo(fifth);

      let quality = new ChordQuality("M");

      if (rootToThird === 3 && rootToFifth === 7) {
        quality = new ChordQuality("m");
      }

      if (rootToThird === 3 && rootToFifth === 6) {
        quality = new ChordQuality("dim");
      }

      return new Chord(root, quality, item.degree, [root, third, fifth]);
    });
  }

  seventhChords(): Chord[] {
    const scaleDegrees = this.degrees();

    return scaleDegrees.map((item, index) => {
      const root = item.note;

      const third = scaleDegrees[(index + 2) % scaleDegrees.length].note;

      const fifth = scaleDegrees[(index + 4) % scaleDegrees.length].note;

      const seventh = scaleDegrees[(index + 6) % scaleDegrees.length].note;

      const rootToThird = root.distanceTo(third);

      const rootToFifth = root.distanceTo(fifth);

      const rootToSeventh = root.distanceTo(seventh);

      let quality = MAJOR_7;

      if (rootToThird === 4 && rootToFifth === 7 && rootToSeventh === 11) {
        quality = MAJOR_7;
      }

      if (rootToThird === 3 && rootToFifth === 7 && rootToSeventh === 10) {
        quality = MINOR_7;
      }

      if (rootToThird === 4 && rootToFifth === 7 && rootToSeventh === 10) {
        quality = DOMINANT_7;
      }

      if (rootToThird === 3 && rootToFifth === 6 && rootToSeventh === 10) {
        quality = HALF_DIMINISHED;
      }

      return new Chord(root, quality, item.degree, [root, third, fifth, seventh]);
    });
  }
}
