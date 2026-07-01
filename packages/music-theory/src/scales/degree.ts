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
};

const FUNCTION_NAMES: Record<number, string> = {
  1: "tonic",
  2: "supertonic",
  3: "mediant",
  4: "subdominant",
  5: "dominant",
  6: "submediant",
};

export class Degree {
  constructor(public readonly value: string) {}

  position(): number {
    return Number.parseInt(this.value.replace(/[^0-9]/g, ""), 10);
  }

  intervalName(): string {
    return INTERVAL_NAMES[this.value] ?? this.value;
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
