import { Pitch } from "../notes/pitch";
import { Tuning } from "./tuning";

export interface FretPosition {
  /** Índice da corda em `tuning.strings` (0 = corda mais grave). */
  string: number;
  /** Casa; 0 = corda solta. */
  fret: number;
  pitch: Pitch;
}

export class Fretboard {
  constructor(
    public readonly tuning: Tuning,
    public readonly fretCount: number = 12,
  ) {}

  pitchAt(stringIndex: number, fret: number): Pitch {
    return this.tuning.strings[stringIndex].transpose(fret);
  }

  /** Matriz de posições: uma linha por corda, colunas de 0..fretCount. */
  positions(): FretPosition[][] {
    return this.tuning.strings.map((openPitch, string) =>
      Array.from({ length: this.fretCount + 1 }, (_, fret) => ({
        string,
        fret,
        pitch: openPitch.transpose(fret),
      })),
    );
  }
}
