import { Pitch } from "../notes/pitch";

/**
 * Afinação de um instrumento de cordas.
 *
 * `strings` está em ordem física da corda mais grave para a mais aguda
 * (ex.: guitarra 6ª→1ª = E2, A2, D3, G3, B3, E4). Guarda alturas absolutas
 * (Pitch), com oitava, para permitir sonorização fiel de cada corda/casa.
 */
export class Tuning {
  constructor(
    public readonly name: string,
    public readonly strings: Pitch[],
  ) {}

  get stringCount(): number {
    return this.strings.length;
  }
}
