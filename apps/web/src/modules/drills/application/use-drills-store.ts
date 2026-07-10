import { defineStore } from "pinia";

import type { SingleNote } from "@music-workspace/music-theory";

import type { DeckId } from "./flashcard-decks";
import type { LeitnerCardState } from "./leitner";

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
  }),
  persist: true,
});
