import { Degree } from "../scales/degree";
import { ChordQuality } from "./chord-quality";

/**
 * Fórmula fechada de um acorde: a qualidade (símbolo exibido) e os graus que o
 * compõem, a partir da fundamental (incluindo o "1"). Análogo ao `ScalePattern`,
 * mas os graus descrevem as notas do acorde (`1`, `b3`, `b5`, `bb7`…) — o que dá,
 * de uma vez, a altura (`Degree.semitones`), a grafia (`Degree.position`) e o nome
 * de cada intervalo (`Degree.intervalName`).
 */
export class ChordPattern {
  constructor(
    public readonly name: string,
    public readonly quality: ChordQuality,
    public readonly degrees: Degree[],
  ) {}
}
