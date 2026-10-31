import type { LocationQuery, RouteLocationRaw } from "vue-router";

import { DECK_IDS, type DeckId } from "./flashcard-decks";

export type DrillsSection = "fretboard" | "noteId" | "flashcards";

export const DRILLS_SECTIONS: DrillsSection[] = ["fretboard", "noteId", "flashcards"];

/** Configuração pedida pela query `?tab=<aba>&deck=<baralho>` — campos ausentes ou inválidos ficam de fora. */
export interface DrillsLinkConfig {
  tab?: DrillsSection;
  deck?: DeckId;
}

function firstString(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;

  return typeof first === "string" ? first : null;
}

/** Lê o deep-link dos Drills, descartando valores que não sejam uma aba/baralho conhecido. */
export function parseDrillsQuery(query: LocationQuery): DrillsLinkConfig {
  const tab = firstString(query.tab);
  const deck = firstString(query.deck);
  const config: DrillsLinkConfig = {};

  const section = DRILLS_SECTIONS.find((item) => item === tab);
  if (section) config.tab = section;

  const deckId = DECK_IDS.find((item) => item === deck);
  if (deckId) config.deck = deckId;

  return config;
}

/** Rota dos Drills na aba de flashcards com o baralho pedido já selecionado. */
export function buildFlashcardsLink(deck: DeckId): RouteLocationRaw {
  return { path: "/drills", query: { tab: "flashcards", deck } };
}

/** Rota dos Drills numa aba (identificar notas, encontrar notas no braço). */
export function buildDrillsTabLink(tab: DrillsSection): RouteLocationRaw {
  return { path: "/drills", query: { tab } };
}
