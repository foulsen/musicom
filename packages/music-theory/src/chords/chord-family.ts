import { ChordPattern } from "./chord-pattern";

/**
 * Agrupamento de qualidades de acorde (ex.: "Triads", "Seventh"). Famílias sem
 * padrões (`patterns` vazio) são reservadas para expansão futura do banco.
 */
export class ChordFamily {
  constructor(
    public readonly name: string,
    public readonly patterns: ChordPattern[],
  ) {}

  isEmpty(): boolean {
    return this.patterns.length === 0;
  }
}
