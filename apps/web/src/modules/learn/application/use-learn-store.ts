import { defineStore } from "pinia";

export interface LessonProgress {
  completedStepIndexes: number[];
}

/** Progresso persistido (localStorage) das Trilhas de aprendizado, por lição. */
export const useLearnStore = defineStore("learn", {
  state: () => ({
    progress: {} as Record<string, LessonProgress>,
    lastVisitedLessonId: null as string | null,
  }),
  persist: true,
});
