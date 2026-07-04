import type { Pitch } from "@music-workspace/music-theory";

/** Posição do braço já categorizada em relação à escala selecionada. */
export interface FretboardNote {
  string: number;
  fret: number;
  /** Altura absoluta (com oitava), para sonorização. */
  pitch: Pitch;
  /** Nome exibido (grafado conforme a escala quando a nota pertence a ela). */
  label: string;
  isTonic: boolean;
  inScale: boolean;
  /** Nome do intervalo em relação à tônica (ex.: "major third"). */
  intervalName: string;
}
