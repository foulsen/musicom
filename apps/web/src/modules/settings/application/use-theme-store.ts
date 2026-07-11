import type { Pinia } from "pinia";
import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    mode: "dark" as ThemeMode,
  }),
  persist: true,
});

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** "system" resolves to the OS preference at apply-time; light/dark are explicit. */
function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
  }

  return mode;
}

function applyThemeClass(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", resolveMode(mode) === "dark");
}

/**
 * Applies the persisted theme to <html> and keeps it in sync with future
 * changes (local toggle, a `theme` field hydrated from server sync, or — for
 * "system" — the OS preference changing while the app is open).
 * Mirrors `startSync(pinia)` — called once from main.ts after `app.use(pinia)`.
 */
export function watchTheme(pinia: Pinia): void {
  const store = useThemeStore(pinia);
  applyThemeClass(store.mode);
  store.$subscribe(() => applyThemeClass(store.mode), { detached: true });

  window.matchMedia(DARK_MEDIA_QUERY).addEventListener("change", () => {
    if (store.mode === "system") applyThemeClass(store.mode);
  });
}
