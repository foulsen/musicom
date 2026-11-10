import { SpelledPitch } from "../notes/spelled-pitch";

export type ClefName = "treble" | "bass" | "alto" | "tenor";

const BOTTOM_LINES: Record<ClefName, string> = {
  treble: "E4",
  bass: "G2",
  alto: "F3",
  tenor: "D3",
};

/** Clave: define qual nota ocupa a linha inferior da pauta. */
export class Clef {
  static readonly TREBLE = new Clef("treble");
  static readonly BASS = new Clef("bass");
  static readonly ALTO = new Clef("alto");
  static readonly TENOR = new Clef("tenor");

  private constructor(public readonly name: ClefName) {}

  static from(name: ClefName): Clef {
    switch (name) {
      case "treble":
        return Clef.TREBLE;
      case "bass":
        return Clef.BASS;
      case "alto":
        return Clef.ALTO;
      case "tenor":
        return Clef.TENOR;
    }
  }

  bottomLine(): SpelledPitch {
    return SpelledPitch.parse(BOTTOM_LINES[this.name]);
  }

  /** 0 = linha inferior, 1 = primeiro espaço … 8 = linha superior; negativo abaixo da pauta. */
  staffPosition(pitch: SpelledPitch): number {
    return pitch.diatonicIndex() - this.bottomLine().diatonicIndex();
  }

  pitchAt(position: number, accidental = 0): SpelledPitch {
    return SpelledPitch.fromDiatonicIndex(this.bottomLine().diatonicIndex() + position, accidental);
  }

  isLine(position: number): boolean {
    return position % 2 === 0;
  }

  ledgerLineCount(position: number): number {
    if (position < 0) return Math.floor(-position / 2);
    if (position > 8) return Math.floor((position - 8) / 2);
    return 0;
  }
}
