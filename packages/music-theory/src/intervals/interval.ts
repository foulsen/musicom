export class Interval {
  constructor(public readonly semitones: number) {}

  static wholeStep() {
    return new Interval(2);
  }

  static halfStep() {
    return new Interval(1);
  }
}
