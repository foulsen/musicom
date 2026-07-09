import { defineStore } from "pinia";

import type { SingleNote } from "@music-workspace/music-theory";

/** Seleção persistida do Chord Explorer (localStorage), independente do Scale Explorer. */
export const useChordExplorerStore = defineStore("chord-explorer", {
  state: () => ({
    rootValue: "C" as SingleNote,
    familyName: "Triads",
    qualityName: "Major",
    fretCount: 12,
  }),
  persist: true,
});
