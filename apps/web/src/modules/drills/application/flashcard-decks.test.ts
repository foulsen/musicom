import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import { buildDeck, DECK_IDS, type Flashcard } from "./flashcard-decks";

function translator(locale: "en" | "pt") {
  const i18n = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } });
  const { t } = i18n.global;
  const label = (value: TermLabel) =>
    resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), value);

  return (card: Flashcard) => ({ prompt: label(card.prompt), answer: label(card.answer) });
}

describe("buildDeck", () => {
  it.each(DECK_IDS)("keeps card ids unique and independent of the language (%s)", (deckId) => {
    const ids = buildDeck(deckId).map((card) => card.id);

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).not.toMatch(/[ãáâéêíóôõúç]/i));
  });

  it("translates interval cards (prompt and answer) in pt and en", () => {
    const card = buildDeck("intervals").find((item) => item.id === "interval-b3");
    const intervalNameCard = buildDeck("intervalNames").find((item) => item.id === "interval-name-b3");
    if (!card || !intervalNameCard) throw new Error("b3 cards missing from the interval decks");

    expect(translator("pt")(card)).toEqual({ prompt: "b3", answer: "terça menor — 3 semitons" });
    expect(translator("en")(card)).toEqual({ prompt: "b3", answer: "minor third — 3 semitones" });
    expect(translator("pt")(intervalNameCard)).toEqual({ prompt: "terça menor", answer: "b3 — 3 semitons" });
  });

  it("translates the chord quality in formula cards but leaves chord symbols as written", () => {
    const formula = buildDeck("chordFormulas").find((item) => item.id === "chord-Minor 7th");
    const spelling = buildDeck("chordSpelling")[0];
    if (!formula) throw new Error("Minor 7th card missing from the chord formula deck");

    expect(translator("pt")(formula)).toEqual({ prompt: "Menor com sétima", answer: "1 - b3 - 5 - b7" });
    expect(translator("en")(formula).prompt).toBe("Minor 7th");
    expect(translator("pt")(spelling).prompt).toBe(translator("en")(spelling).prompt);
  });
});
