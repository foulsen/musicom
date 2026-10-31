import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";

import { GLOSSARY_TERM_IDS, isGlossaryTermId } from "./glossary";
import { parseGlossaryMarkup } from "./glossary-markup";

describe("glossary registry", () => {
  it.each([
    ["pt", pt.glossary],
    ["en", en.glossary],
  ])("has a term and a definition for every id (%s)", (_locale, entries) => {
    for (const id of GLOSSARY_TERM_IDS) {
      const entry = (entries as Record<string, { term: string; definition: string }>)[id];

      expect(entry?.term.trim(), id).toBeTruthy();
      expect(entry?.definition.trim(), id).toBeTruthy();
    }
  });

  it.each([
    ["pt", pt.glossary],
    ["en", en.glossary],
  ])("has no entries outside the registry (%s)", (_locale, entries) => {
    for (const id of Object.keys(entries)) expect(isGlossaryTermId(id), id).toBe(true);
  });

  it("every term used in lesson texts is a registered id, in both locales", () => {
    for (const messages of [pt, en]) {
      const texts = JSON.stringify(messages.learn.lessons).match(/\[\[[^\]]*\]\]/g) ?? [];

      expect(texts.length).toBeGreaterThan(0);

      for (const raw of texts) {
        const id = raw.slice(2).split(":")[0].replace(/\]\]$/, "");

        expect(isGlossaryTermId(id), raw).toBe(true);
      }
    }
  });
});

describe("parseGlossaryMarkup", () => {
  it("returns a single text segment when there is no markup", () => {
    expect(parseGlossaryMarkup("Sem termos aqui.")).toEqual([{ type: "text", text: "Sem termos aqui." }]);
  });

  it("returns no segments for an empty string", () => {
    expect(parseGlossaryMarkup("")).toEqual([]);
  });

  it("splits text around a term using the default label", () => {
    expect(parseGlossaryMarkup("Cada nota tem um [[degree]] na escala.")).toEqual([
      { type: "text", text: "Cada nota tem um " },
      { type: "term", id: "degree", label: undefined },
      { type: "text", text: " na escala." },
    ]);
  });

  it("supports a display variant after a colon", () => {
    expect(parseGlossaryMarkup("o 5º [[degree:grau]] e os [[degree:graus]]")).toEqual([
      { type: "text", text: "o 5º " },
      { type: "term", id: "degree", label: "grau" },
      { type: "text", text: " e os " },
      { type: "term", id: "degree", label: "graus" },
    ]);
  });

  it("keeps labels with spaces and symbols", () => {
    expect(parseGlossaryMarkup("([[degreeNotation:1 3 5 b7]])")).toEqual([
      { type: "text", text: "(" },
      { type: "term", id: "degreeNotation", label: "1 3 5 b7" },
      { type: "text", text: ")" },
    ]);
  });

  it("handles a term at the very start and end", () => {
    expect(parseGlossaryMarkup("[[tone:Tom]] e [[semitone:semitom]]")).toEqual([
      { type: "term", id: "tone", label: "Tom" },
      { type: "text", text: " e " },
      { type: "term", id: "semitone", label: "semitom" },
    ]);
  });

  it("turns unknown ids into plain text, merged with neighbours", () => {
    expect(parseGlossaryMarkup("um [[nope:termo]] qualquer")).toEqual([
      { type: "text", text: "um termo qualquer" },
    ]);
    expect(parseGlossaryMarkup("[[nope]]")).toEqual([{ type: "text", text: "nope" }]);
  });

  it("ignores unbalanced brackets", () => {
    expect(parseGlossaryMarkup("lista [[ aberta")).toEqual([{ type: "text", text: "lista [[ aberta" }]);
  });
});
