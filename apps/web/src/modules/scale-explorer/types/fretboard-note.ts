import type { Note } from "@music-workspace/music-theory";

/** Posição do braço já categorizada em relação à escala selecionada. */
export interface FretboardNote {
  string: number;
  fret: number;
  note: Note;
  isTonic: boolean;
  inScale: boolean;
  /** Nome do intervalo em relação à tônica (ex.: "major third"). */
  intervalName: string;
}
