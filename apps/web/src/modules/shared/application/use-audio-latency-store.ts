import { defineStore } from "pinia";

/**
 * Latência extra da saída de áudio, medida pela calibração (ms). Soma-se à que o navegador
 * informa (`outputLatency`), que costuma vir baixa ou ausente com fones Bluetooth e no Safari.
 *
 * Fica só neste aparelho (localStorage, fora da sincronização): depende do fone/caixa em uso.
 */
export const useAudioLatencyStore = defineStore("audio-latency", {
  state: () => ({
    extraLatencyMs: 0,
  }),
  persist: true,
});
