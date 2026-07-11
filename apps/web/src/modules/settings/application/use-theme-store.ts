import type { Pinia } from "pinia";
import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    mode: "dark" as ThemeMode,
  }),
  persist: true,
});

function applyThemeClass(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

/**
 * Applies the persisted theme to <html> and keeps it in sync with future
 * changes (local toggle or a `theme` field hydrated from server sync).
 * Mirrors `startSync(pinia)` — called once from main.ts after `app.use(pinia)`.
 */
export function watchTheme(pinia: Pinia): void {
  const store = useThemeStore(pinia);
  applyThemeClass(store.mode);
  store.$subscribe(() => applyThemeClass(store.mode), { detached: true });
}
