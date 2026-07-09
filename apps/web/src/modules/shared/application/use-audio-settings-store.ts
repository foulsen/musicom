import { defineStore } from "pinia";

/**
 * Volume/timbre persistidos (localStorage), compartilhados por todas as
 * páginas que tocam áudio — companheiro do `AudioContext` singleton.
 */
export const useAudioSettingsStore = defineStore("audio-settings", {
  state: () => ({
    masterVolume: 0.2,
    waveform: "triangle" as OscillatorType,
  }),
  persist: true,
});
