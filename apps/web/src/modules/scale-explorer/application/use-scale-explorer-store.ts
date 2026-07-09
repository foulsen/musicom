import { defineStore } from "pinia";

import type { SingleNote } from "@music-workspace/music-theory";

/** Seleção persistida do Scale Explorer (localStorage), independente do Chord Explorer. */
export const useScaleExplorerStore = defineStore("scale-explorer", {
  state: () => ({
    rootValue: "C" as SingleNote,
    patternName: "Major",
    fretCount: 12,
    selectedTriadIndex: 0,
  }),
  persist: true,
});
