import { describe, expect, it } from "vitest";

import { parseDrillsQuery } from "@/modules/drills/application/drills-link";
import { parseEarTrainingQuery } from "@/modules/ear-training/application/ear-training-link";

import { FUNDAMENTALS_TRACK } from "./curriculum";
import { MAX_PRACTICE_LINKS, practiceLabel, practiceLink, type PracticeTarget } from "./practice";

type Link = { path: string; query: Record<string, string> };

describe("practiceLink", () => {
  it("links ear training with quiz and difficulty", () => {
    const link = practiceLink({ kind: "ear-training", quiz: "chordQuality", difficulty: "easy" }) as Link;

    expect(link.path).toBe("/ear-training");
    expect(parseEarTrainingQuery(link.query)).toEqual({ kind: "chordQuality", difficulty: "easy" });
  });

  it("links a flashcard deck", () => {
    const link = practiceLink({ kind: "flashcards", deck: "chordFormulas" }) as Link;

    expect(link.path).toBe("/drills");
    expect(parseDrillsQuery(link.query)).toEqual({ tab: "flashcards", deck: "chordFormulas" });
  });

  it("links the note-id and fretboard tabs", () => {
    expect(parseDrillsQuery((practiceLink({ kind: "note-id" }) as Link).query)).toEqual({ tab: "noteId" });
    expect(parseDrillsQuery((practiceLink({ kind: "fretboard" }) as Link).query)).toEqual({ tab: "fretboard" });
  });
});

describe("practiceLabel", () => {
  it("gives the deck name key to flashcard labels only", () => {
    expect(practiceLabel({ kind: "flashcards", deck: "intervals" })).toEqual({
      key: "learn.practice.flashcards",
      deckKey: "drills.flashcards.decks.intervals",
    });
    expect(practiceLabel({ kind: "ear-training", quiz: "scale" }).deckKey).toBeUndefined();
  });
});

describe("lesson practice lists", () => {
  const targets: [string, PracticeTarget[]][] = FUNDAMENTALS_TRACK.lessons.map((lesson) => [
    lesson.id,
    lesson.practice ?? [],
  ]);

  it.each(targets)("%s has between 1 and the max number of practice links", (_id, practice) => {
    expect(practice.length).toBeGreaterThanOrEqual(1);
    expect(practice.length).toBeLessThanOrEqual(MAX_PRACTICE_LINKS);
  });

  it.each(targets)("%s has no duplicated practice links", (_id, practice) => {
    const serialized = practice.map((target) => JSON.stringify(practiceLink(target)));

    expect(new Set(serialized).size).toBe(serialized.length);
  });
});
