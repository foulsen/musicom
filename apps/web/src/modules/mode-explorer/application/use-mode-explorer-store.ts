import { defineStore } from "pinia";

import type { SingleNote } from "@music-workspace/music-theory";

/** Seleção persistida do Mode Explorer (localStorage), independente das demais páginas. */
export const useModeExplorerStore = defineStore("mode-explorer", {
  state: () => ({
    parentRootValue: "C" as SingleNote,
    modeIndex: 0,
    fretCount: 12,
    selectedTriadIndex: 0,
  }),
  persist: true,
});
