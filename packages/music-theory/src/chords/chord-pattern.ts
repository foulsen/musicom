import { Interval } from "../intervals/interval";
import { ChordQuality } from "./chord-quality";

/**
 * Fórmula fechada de um acorde: a qualidade (símbolo exibido) e os intervalos
 * a partir da fundamental que definem suas notas — incluindo a própria
 * fundamental (`unison`). Análogo ao `ScalePattern`, porém os intervalos são
 * medidos a partir da tônica (0 = fundamental), não como passos consecutivos.
 */
export class ChordPattern {
  constructor(
    public readonly name: string,
    public readonly quality: ChordQuality,
    public readonly intervals: Interval[],
  ) {}
}
