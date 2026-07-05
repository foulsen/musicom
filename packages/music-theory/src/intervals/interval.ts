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

  // Intervalos a partir da fundamental — usados para montar acordes (ver chord-patterns).
  static unison() {
    return new Interval(0);
  }

  static majorSecond() {
    return new Interval(2);
  }

  static minorThird() {
    return new Interval(3);
  }

  static majorThird() {
    return new Interval(4);
  }

  static perfectFourth() {
    return new Interval(5);
  }

  static tritone() {
    return new Interval(6);
  }

  static perfectFifth() {
    return new Interval(7);
  }

  static minorSixth() {
    return new Interval(8);
  }

  static majorSixth() {
    return new Interval(9);
  }

  static minorSeventh() {
    return new Interval(10);
  }

  static majorSeventh() {
    return new Interval(11);
  }

  name(): string {
    return INTERVAL_NAMES[((this.semitones % 12) + 12) % 12];
  }
}
