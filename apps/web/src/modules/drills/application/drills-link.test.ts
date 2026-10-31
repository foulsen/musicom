import { describe, expect, it } from "vitest";

import { buildDrillsTabLink, buildFlashcardsLink, parseDrillsQuery } from "./drills-link";

describe("parseDrillsQuery", () => {
  it("reads a valid tab and deck", () => {
    expect(parseDrillsQuery({ tab: "flashcards", deck: "chordFormulas" })).toEqual({
      tab: "flashcards",
      deck: "chordFormulas",
    });
  });

  it("ignores unknown tabs and decks", () => {
    expect(parseDrillsQuery({ tab: "karaoke", deck: "nope" })).toEqual({});
    expect(parseDrillsQuery({ tab: "flashcards", deck: "Intervals" })).toEqual({ tab: "flashcards" });
  });

  it("uses the first value of a repeated param and tolerates empty queries", () => {
    expect(parseDrillsQuery({ deck: ["intervalNames", "intervals"] })).toEqual({ deck: "intervalNames" });
    expect(parseDrillsQuery({ tab: null })).toEqual({});
    expect(parseDrillsQuery({})).toEqual({});
  });
});

describe("drills link builders", () => {
  it("builds a flashcards link that parses back", () => {
    const link = buildFlashcardsLink("chordSpelling") as { path: string; query: Record<string, string> };

    expect(link.path).toBe("/drills");
    expect(parseDrillsQuery(link.query)).toEqual({ tab: "flashcards", deck: "chordSpelling" });
  });

  it("builds a tab link", () => {
    const link = buildDrillsTabLink("noteId") as { query: Record<string, string> };

    expect(parseDrillsQuery(link.query)).toEqual({ tab: "noteId" });
  });
});
