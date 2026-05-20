import { Degree } from "../scales/degree";
import { Note } from "../notes/note";

import { ChordQuality } from "./chord-quality";

export class Chord {
  constructor(
    public readonly root: Note,
    public readonly quality: ChordQuality,
    public readonly degree: Degree,
    public readonly notes: Note[],
  ) {}

  name() {
    return `${this.root}${this.quality}`;
  }
}
