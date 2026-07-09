import { defineStore } from "pinia";

import type { Difficulty, QuizKind } from "./question-generators";

export type IntervalPlaybackMode = "harmonic" | "melodic";

export interface QuizScore {
  correct: number;
  total: number;
}

function emptyScore(): QuizScore {
  return { correct: 0, total: 0 };
}

/** Placar persistido (localStorage) do Ear Training Studio, por tipo de quiz. */
export const useEarTrainingStore = defineStore("ear-training", {
  state: () => ({
    scores: {
      interval: emptyScore(),
      chordQuality: emptyScore(),
      scale: emptyScore(),
    } as Record<QuizKind, QuizScore>,
    streak: 0,
    bestStreak: 0,
    difficulty: "medium" as Difficulty,
    /** Só se aplica ao quiz de intervalo: tocar as duas notas juntas ou em sequência. */
    intervalPlaybackMode: "melodic" as IntervalPlaybackMode,
  }),
  persist: true,
});
