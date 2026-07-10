import { createI18n } from "vue-i18n";

import { en } from "./locales/en";
import { pt } from "./locales/pt";

export const SUPPORTED_LOCALES = ["en", "pt"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

/** Chave usada para persistir o idioma escolhido (ver settings-dialog). */
export const LOCALE_STORAGE_KEY = "musicom-locale";

function isSupportedLocale(value: string | null): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function readStoredLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

  return isSupportedLocale(stored) ? stored : "en";
}

export const i18n = createI18n({
  legacy: false,
  locale: readStoredLocale(),
  fallbackLocale: "en",
  messages: { en, pt },
});
