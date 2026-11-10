export const TICKS_PER_QUARTER = 960;

export type NoteValue = "whole" | "half" | "quarter" | "eighth" | "sixteenth" | "thirty-second";

export const NOTE_VALUES: readonly NoteValue[] = ["whole", "half", "quarter", "eighth", "sixteenth", "thirty-second"];

export interface Tuplet {
  actual: number;
  normal: number;
}

/** Quiáltera de 3 no tempo de 2. */
export const TRIPLET: Tuplet = { actual: 3, normal: 2 };

const BASE_TICKS: Record<NoteValue, number> = {
  whole: TICKS_PER_QUARTER * 4,
  half: TICKS_PER_QUARTER * 2,
  quarter: TICKS_PER_QUARTER,
  eighth: TICKS_PER_QUARTER / 2,
  sixteenth: TICKS_PER_QUARTER / 4,
  "thirty-second": TICKS_PER_QUARTER / 8,
};

export class Duration {
  constructor(
    public readonly value: NoteValue,
    public readonly dots: 0 | 1 | 2 = 0,
    public readonly tuplet: Tuplet | null = null,
  ) {}

  static of(value: NoteValue, dots: 0 | 1 | 2 = 0, tuplet: Tuplet | null = null): Duration {
    return new Duration(value, dots, tuplet);
  }

  /** base * (2 - 1/2^dots) * normal/actual, em aritmética inteira. */
  ticks(): number {
    const { normal, actual } = this.tuplet ?? { normal: 1, actual: 1 };
    const numerator = BASE_TICKS[this.value] * (2 ** (this.dots + 1) - 1) * normal;
    const denominator = 2 ** this.dots * actual;

    if (numerator % denominator !== 0) {
      throw new Error(`Duration ${this.value} (dots ${this.dots}) does not fit a whole number of ticks`);
    }

    return numerator / denominator;
  }
}
