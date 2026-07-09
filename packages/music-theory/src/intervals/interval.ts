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

const SHORT_INTERVAL_NAMES = ["R", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7"];

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

  /** Abreviação usada em diagramas (roda cromática, painel de funções): "R", "m3", "P5"… */
  shortName(): string {
    return SHORT_INTERVAL_NAMES[((this.semitones % 12) + 12) % 12];
  }
}
