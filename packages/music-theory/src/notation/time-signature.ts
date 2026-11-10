import { TICKS_PER_QUARTER } from "./duration";

const WHOLE_TICKS = TICKS_PER_QUARTER * 4;
const PATTERN = /^(\d+)\/(1|2|4|8|16)$/;

type BeatValue = 1 | 2 | 4 | 8 | 16;

export class TimeSignature {
  constructor(
    public readonly beats: number,
    public readonly beatValue: BeatValue,
  ) {}

  static parse(text: string): TimeSignature {
    const match = PATTERN.exec(text);
    if (!match) {
      throw new Error(`Invalid time signature: "${text}"`);
    }

    return new TimeSignature(Number(match[1]), Number(match[2]) as BeatValue);
  }

  measureTicks(): number {
    return (this.beats * WHOLE_TICKS) / this.beatValue;
  }

  isCompound(): boolean {
    return this.beatValue >= 8 && this.beats % 3 === 0 && this.beats > 3;
  }

  /** Pulso percebido: a semínima pontuada nos compostos, a unidade de tempo nos simples. */
  pulseTicks(): number {
    return this.isCompound() ? (3 * WHOLE_TICKS) / this.beatValue : WHOLE_TICKS / this.beatValue;
  }

  pulsesPerMeasure(): number {
    return this.measureTicks() / this.pulseTicks();
  }

  toString(): string {
    return `${this.beats}/${this.beatValue}`;
  }
}
