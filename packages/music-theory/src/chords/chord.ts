import { Degree } from "../scales/degree";
import { Note } from "../notes/note";
import { SpelledNote } from "../notes/spelled-note";

import { ChordQuality } from "./chord-quality";
import { HarmonicFunction } from "../harmony/harmonic-function";
import { Tension } from "../harmony/tension";

export class Chord {
  constructor(
    public readonly root: Note,
    public readonly quality: ChordQuality,
    public readonly degree: Degree,
    public readonly notes: Note[],
    public readonly spelledRoot?: SpelledNote,
    public readonly harmonicFunction?: HarmonicFunction,
    public readonly tensions: Tension[] = [],
  ) {}

  get name() {
    return `${this.spelledRoot ?? this.root}${this.quality}`;
  }
}
