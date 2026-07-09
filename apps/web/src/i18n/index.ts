import { createI18n } from "vue-i18n";

import { en } from "./locales/en";
import { pt } from "./locales/pt";

/** Idioma ativo do produto. Sem seletor de UI por ora — troque aqui manualmente. */
const ACTIVE_LOCALE: "en" | "pt" = "en";

export const i18n = createI18n({
  legacy: false,
  locale: ACTIVE_LOCALE,
  fallbackLocale: "en",
  messages: { en, pt },
});
