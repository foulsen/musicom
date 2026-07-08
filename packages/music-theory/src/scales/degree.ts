const INTERVAL_NAMES: Record<string, string> = {
  "1": "tonic",
  "b2": "minor second",
  "2": "major second",
  "#2": "augmented second",
  "b3": "minor third",
  "3": "major third",
  "4": "perfect fourth",
  "#4": "augmented fourth",
  "b5": "diminished fifth",
  "5": "perfect fifth",
  "#5": "augmented fifth",
  "b6": "minor sixth",
  "6": "major sixth",
  "bb7": "diminished seventh",
  "b7": "minor seventh",
  "7": "major seventh",
  "b9": "minor ninth",
  "9": "major ninth",
  "#9": "augmented ninth",
  "11": "perfect eleventh",
  "13": "major thirteenth",
};

const FUNCTION_NAMES: Record<number, string> = {
  1: "tonic",
  2: "supertonic",
  3: "mediant",
  4: "subdominant",
  5: "dominant",
  6: "submediant",
};

const DEGREE_SEMITONES: Record<string, number> = {
  "1": 0,
  "b2": 1,
  "2": 2,
  "#2": 3,
  "b3": 3,
  "3": 4,
  "4": 5,
  "#4": 6,
  "b5": 6,
  "5": 7,
  "#5": 8,
  "b6": 8,
  "6": 9,
  "bb7": 9,
  "b7": 10,
  "7": 11,
  "b9": 1,
  "9": 2,
  "#9": 3,
  "11": 5,
  "13": 9,
};

export class Degree {
  constructor(public readonly value: string) {}

  position(): number {
    return Number.parseInt(this.value.replace(/[^0-9]/g, ""), 10);
  }

  intervalName(): string {
    return INTERVAL_NAMES[this.value] ?? this.value;
  }

  /** Distância em semitons a partir da tônica (ex.: "b3" -> 3, "bb7" -> 9). */
  semitones(): number {
    return DEGREE_SEMITONES[this.value] ?? 0;
  }

  functionName(): string {
    const position = this.position();

    if (position === 7) {
      // 7º grau: meio-tom abaixo da tônica = leading tone; tom abaixo (b7) = subtonic.
      return this.value.startsWith("b") ? "subtonic" : "leading tone";
    }

    return FUNCTION_NAMES[position] ?? this.value;
  }

  toString() {
    return this.value;
  }
}
