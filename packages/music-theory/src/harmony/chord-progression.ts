import { Chord } from "../chords/chord";

export class ChordProgression {
  constructor(
    public readonly name: string,
    public readonly chords: Chord[],
  ) {}
}
