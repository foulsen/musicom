import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import { CHORD_PATTERNS } from "@music-workspace/music-theory";

import { allCardIds, buildDeck, DECK_IDS, drawChordSpellingCard, isLegacyCardId, type Flashcard } from "./flashcard-decks";

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

describe("chord spelling deck (root drawn per presentation)", () => {
  it("has one card per chord pattern, with ids that do not embed the root", () => {
    const deck = buildDeck("chordSpelling");

    expect(deck).toHaveLength(CHORD_PATTERNS.length);
    deck.forEach((card, index) => expect(card.id).toBe(`spelling-${CHORD_PATTERNS[index].name}`));
    deck.forEach((card) => expect(isLegacyCardId(card.id)).toBe(false));
  });

  it("flags the old root-pinned ids as legacy", () => {
    expect(isLegacyCardId("chord-spelling-C7")).toBe(true);
    expect(isLegacyCardId("chord-Dominant 7th")).toBe(false);
  });

  it("computes the answer from the drawn root, with flats spelled by the domain", () => {
    const dominant7 = CHORD_PATTERNS.find((pattern) => pattern.name === "Dominant 7th")!;
    // random() = 1/12 escolhe o 2º candidato (Db) quando todas as raízes são válidas para o padrão.
    const card = drawChordSpellingCard(dominant7, () => 1 / 12 + 0.001);

    expect(card.prompt).toBe("Db7");
    expect(card.answer).toBe("Db - F - Ab - Cb");
  });

  it("covers sharps and flats across draws, always with an answer matching the prompt's root", () => {
    const major = CHORD_PATTERNS.find((pattern) => pattern.name === "Major")!;
    const prompts = new Set<string>();

    for (let i = 0; i < 12; i++) {
      const card = drawChordSpellingCard(major, () => i / 12 + 0.001);
      prompts.add(String(card.prompt));
      expect(String(card.answer).startsWith(String(card.prompt))).toBe(true);
    }

    expect(prompts.size).toBe(12);
    expect([...prompts].some((prompt) => prompt.includes("b"))).toBe(true);
    expect([...prompts].some((prompt) => prompt.includes("#"))).toBe(true);
  });

  it("avoids double accidentals in the answer when a clean root exists", () => {
    const augmented = CHORD_PATTERNS.find((pattern) => pattern.name === "Augmented")!;

    for (let i = 0; i < 24; i++) {
      const card = drawChordSpellingCard(augmented, () => i / 24 + 0.001);

      expect(String(card.answer)).not.toMatch(/bb|##/);
    }
  });

  it("restricts roots per pattern but never runs out of them (diminished 7th has the fewest clean roots)", () => {
    const diminished7 = CHORD_PATTERNS.find((pattern) => pattern.name === "Diminished 7th")!;
    const prompts = new Set<string>();

    for (let i = 0; i < 12; i++) {
      const card = drawChordSpellingCard(diminished7, () => i / 12 + 0.001);
      prompts.add(String(card.prompt));
      expect(String(card.answer)).not.toMatch(/bb|##/);
    }

    expect(prompts.size).toBeGreaterThan(1);
  });

  it("redraws the same card with a different root", () => {
    const minor = CHORD_PATTERNS.find((pattern) => pattern.name === "Minor")!;
    const card = drawChordSpellingCard(minor, () => 0.5);
    const again = card.redraw!();

    expect(again.id).toBe(card.id);
    expect(again.prompt).not.toBe(card.prompt);
  });

  it("lists every card id across decks, stable between calls", () => {
    expect(allCardIds()).toHaveLength(DECK_IDS.reduce((sum, id) => sum + buildDeck(id).length, 0));
    expect(allCardIds()).toEqual(allCardIds());
  });
});
