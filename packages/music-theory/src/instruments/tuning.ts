import { Note } from "../notes/note";

/**
 * Afinação de um instrumento de cordas.
 *
 * `strings` está em ordem física da corda mais grave para a mais aguda
 * (ex.: guitarra 6ª→1ª = E, A, D, G, B, E). Trabalha com classes de altura
 * (Note), sem oitava — o fretboard exibe nomes de nota, não alturas absolutas.
 */
export class Tuning {
  constructor(
    public readonly name: string,
    public readonly strings: Note[],
  ) {}

  get stringCount(): number {
    return this.strings.length;
  }
}
