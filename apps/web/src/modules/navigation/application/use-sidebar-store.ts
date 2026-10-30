import { defineStore } from "pinia";

/**
 * Preferência local do dispositivo (não entra no sync): um celular na
 * horizontal quer a sidebar recolhida, o desktop provavelmente não.
 */
export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    collapsed: false,
  }),
  actions: {
    toggle() {
      this.collapsed = !this.collapsed;
    },
  },
  persist: true,
});
