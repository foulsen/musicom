import type { ClefName } from "@music-workspace/music-theory";

import type { NoteReadingLevelId } from "./reading-types";

/** Como o acidente da nota sorteada é definido: nenhum, aleatório por nota ou ditado pela armadura. */
export type NoteReadingAccidentals = "none" | "random" | "key-signature";

export interface NoteReadingLevel {
  clefs: ClefName[];
  /** Faixa de posições na pauta (0 = linha inferior, 8 = linha superior; negativas/maiores = linhas suplementares). */
  minPosition: number;
  maxPosition: number;
  accidentals: NoteReadingAccidentals;
}

export const NOTE_READING_LEVELS: Record<NoteReadingLevelId, NoteReadingLevel> = {
  "treble-staff": { clefs: ["treble"], minPosition: -1, maxPosition: 9, accidentals: "none" },
  "treble-ledger": { clefs: ["treble"], minPosition: -6, maxPosition: 14, accidentals: "none" },
  "bass-staff": { clefs: ["bass"], minPosition: -1, maxPosition: 9, accidentals: "none" },
  "bass-ledger": { clefs: ["bass"], minPosition: -6, maxPosition: 14, accidentals: "none" },
  "grand-staff": { clefs: ["treble", "bass"], minPosition: -4, maxPosition: 12, accidentals: "none" },
  accidentals: { clefs: ["treble", "bass"], minPosition: -1, maxPosition: 9, accidentals: "random" },
  "key-signatures": { clefs: ["treble", "bass"], minPosition: -1, maxPosition: 9, accidentals: "key-signature" },
  "c-clefs": { clefs: ["alto", "tenor"], minPosition: -1, maxPosition: 9, accidentals: "none" },
};

/** Armaduras sorteadas no nível de armaduras: de 4 bemóis a 4 sustenidos, exceto Dó maior. */
export const KEY_SIGNATURE_LEVEL_FIFTHS = [-4, -3, -2, -1, 1, 2, 3, 4] as const;
