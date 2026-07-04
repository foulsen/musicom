import type { Note, Pitch } from "@music-workspace/music-theory";

/** Posição do braço já categorizada em relação à escala selecionada. */
export interface FretboardNote {
  string: number;
  fret: number;
  /** Classe de altura, para exibição (nome da nota). */
  note: Note;
  /** Altura absoluta (com oitava), para sonorização. */
  pitch: Pitch;
  isTonic: boolean;
  inScale: boolean;
  /** Nome do intervalo em relação à tônica (ex.: "major third"). */
  intervalName: string;
}
