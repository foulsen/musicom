import { defineStore } from "pinia";

import type { InstrumentId } from "./instrument-presets";

/**
 * Volume/timbre persistidos (localStorage), compartilhados por todas as
 * páginas que tocam áudio — companheiro do `AudioContext` singleton.
 */
export const useAudioSettingsStore = defineStore("audio-settings", {
  state: () => ({
    masterVolume: 0.2,
    instrument: "piano" as InstrumentId,
  }),
  persist: true,
});
