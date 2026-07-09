import { defineStore } from "pinia";

/** Placar persistido (localStorage) do Ear Training Studio, por tipo de quiz. */
export const useEarTrainingStore = defineStore("ear-training", {
  state: () => ({
    correct: 0,
    total: 0,
  }),
  persist: true,
});
