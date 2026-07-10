import { defineStore } from "pinia";

/**
 * Perfil de usuário local (localStorage) — sem backend/autenticação por ora.
 * Quando um backend existir, isto vira a fonte de hidratação inicial da sessão.
 */
export const useUserStore = defineStore("user", {
  state: () => ({
    name: "",
  }),
  persist: true,
});
