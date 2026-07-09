import { defineStore } from "pinia";

import type { LeitnerCardState } from "./leitner";

/** Progresso persistido (localStorage) da suíte de drills. */
export const useDrillsStore = defineStore("drills", {
  state: () => ({
    cardStates: {} as Record<string, LeitnerCardState>,
    fretboardBestMs: 0,
  }),
  persist: true,
});
