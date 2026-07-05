import { Note } from "../notes/note";

/**
 * Uma digitação concreta de um acorde no violão/guitarra (afinação padrão):
 * a casa tocada em cada corda, da mais grave (6ª/E) à mais aguda (1ª/e).
 * `null` = corda abafada; `0` = corda solta.
 */
export class ChordVoicing {
  constructor(public readonly frets: ReadonlyArray<number | null>) {}

  private frettedFrets(): number[] {
    return this.frets.filter((fret): fret is number => fret !== null && fret > 0);
  }

  hasOpenString(): boolean {
    return this.frets.some((fret) => fret === 0);
  }

  /** Menor casa pressionada (ignora soltas/abafadas); 1 quando não há nenhuma. */
  lowestFret(): number {
    const fretted = this.frettedFrets();
    return fretted.length ? Math.min(...fretted) : 1;
  }

  /** Maior casa pressionada; 0 quando não há nenhuma. */
  highestFret(): number {
    const fretted = this.frettedFrets();
    return fretted.length ? Math.max(...fretted) : 0;
  }

  /** Verdadeiro quando o acorde é tocado junto à pestana (mostra nut + cordas soltas). */
  isOpenPosition(): boolean {
    return this.hasOpenString() || this.lowestFret() <= 1;
  }
}

/** Um acorde predefinido do "banco": nome, fundamental e suas digitações. */
export class GuitarChord {
  constructor(
    public readonly name: string,
    public readonly root: Note,
    public readonly voicings: ChordVoicing[],
  ) {}
}
