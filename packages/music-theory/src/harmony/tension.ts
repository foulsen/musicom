import { Note } from "../notes/note";

export class Tension {
  constructor(
    public readonly symbol: string,
    public readonly note: Note,
  ) {}

  toString() {
    return `${this.symbol} (${this.note})`;
  }
}
