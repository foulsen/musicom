import { defineStore } from "pinia";

export interface CheckpointScore {
  correct: number;
  total: number;
}

export interface LessonProgress {
  completedStepIndexes: number[];
  checkpoint?: CheckpointScore;
}

/** Progresso persistido (localStorage) das Trilhas de aprendizado, por lição. */
export const useLearnStore = defineStore("learn", {
  state: () => ({
    progress: {} as Record<string, LessonProgress>,
    lastVisitedLessonId: null as string | null,
    /** Dias locais (`YYYY-MM-DD`) em que o usuário respondeu algo, em ordem — base da sequência diária. */
    studyDays: [] as string[],
  }),
  persist: true,
});
