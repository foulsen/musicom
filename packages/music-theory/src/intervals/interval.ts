const INTERVAL_NAMES = [
  "tonic",
  "minor second",
  "major second",
  "minor third",
  "major third",
  "perfect fourth",
  "tritone",
  "perfect fifth",
  "minor sixth",
  "major sixth",
  "minor seventh",
  "major seventh",
];

export class Interval {
  constructor(public readonly semitones: number) {}

  static wholeStep() {
    return new Interval(2);
  }

  static halfStep() {
    return new Interval(1);
  }

  static wholeStepAndHalf() {
    return new Interval(3);
  }

  name(): string {
    return INTERVAL_NAMES[((this.semitones % 12) + 12) % 12];
  }
}
