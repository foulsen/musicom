import type { Pitch } from "@music-workspace/music-theory";

/** Uma nota posicionada de uma digitação, pronta para desenhar. */
export interface ChordShapeNote {
  /** Índice da corda no domínio (0 = mais grave); o componente inverte para exibir. */
  string: number;
  /** Casa absoluta (0 = solta). */
  fret: number;
  label: string;
  isRoot: boolean;
  /** Altura absoluta, para sonorização. */
  pitch: Pitch;
}

/** Uma digitação já resolvida em notas + janela de casas a exibir. */
export interface ChordShape {
  notes: ChordShapeNote[];
  /** Primeira casa exibida na janela (1 quando é posição aberta). */
  baseFret: number;
  /** Quantidade de casas exibidas. */
  fretCount: number;
  /** Quando true, desenha a pestana e as cordas soltas à esquerda dela. */
  openPosition: boolean;
}

/** Um acorde predefinido pronto para o cartão: nome + suas digitações. */
export interface ChordCardData {
  name: string;
  shapes: ChordShape[];
}
