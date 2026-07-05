import type { Pitch } from "@music-workspace/music-theory";

/** Posição do braço já categorizada em relação ao acorde selecionado. */
export interface ChordNote {
  string: number;
  fret: number;
  /** Altura absoluta (com oitava), para sonorização. */
  pitch: Pitch;
  /** Nome exibido (grafado conforme a escala quando a nota pertence a ela). */
  label: string;
  isRoot: boolean;
  inChord: boolean;
  /** Nome do intervalo em relação à fundamental do acorde (ex.: "major third"). */
  intervalName: string;
}
