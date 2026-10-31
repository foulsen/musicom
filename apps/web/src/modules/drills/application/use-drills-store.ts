import { defineStore } from "pinia";

import type { SingleNote } from "@music-workspace/music-theory";

import type { DeckId } from "./flashcard-decks";
import type { LeitnerCardState } from "./leitner";
import { DEFAULT_NOTE_ID_LEVEL, type NoteIdLevelId } from "./note-id-levels";
import type { NoteIdStats } from "./note-id-sampling";

export interface DrillScore {
  correct: number;
  total: number;
}

/** Progresso persistido (localStorage) da suíte de drills. */
export const useDrillsStore = defineStore("drills", {
  state: () => ({
    cardStates: {} as Record<string, LeitnerCardState>,
    /** Recorde por nota-alvo (não um único global): a dificuldade varia por nota no braço. */
    fretboardBestMsByNote: {} as Partial<Record<SingleNote, number>>,
    fretboardNaturalsOnly: false,
    activeDeckId: "intervals" as DeckId,
    noteIdScore: { correct: 0, total: 0 } as DrillScore,
    noteIdStreak: 0,
    noteIdBestStreak: 0,
    /** Acertos/tentativas por posição do braço (`"corda-casa"`) — alimenta a amostragem adaptativa e o resumo por corda. */
    noteIdStats: {} as NoteIdStats,
    /** Preferências do Note ID (vão para o agregado de preferências, como `fretboardNaturalsOnly`). */
    noteIdLevel: DEFAULT_NOTE_ID_LEVEL as NoteIdLevelId,
    noteIdNaturalsOnly: false,
  }),
  persist: true,
});
