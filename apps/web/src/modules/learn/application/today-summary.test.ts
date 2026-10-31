import { describe, expect, it } from "vitest";

import { weakestEarItems, weakestNoteIdString } from "./today-summary";

describe("weakestEarItems", () => {
  it("merges the three quiz kinds, worst accuracy first, and applies the limit", () => {
    const state = {
      itemStats: {
        interval: { "3": { correct: 1, total: 4 }, "7": { correct: 3, total: 4 } },
        chordQuality: { Minor: { correct: 2, total: 4 } },
        scale: { Dorian: { correct: 0, total: 3 } },
      },
    };

    expect(weakestEarItems(state, 3).map(({ kind, id }) => `${kind}:${id}`)).toEqual([
      "scale:Dorian",
      "interval:3",
      "chordQuality:Minor",
    ]);
    expect(weakestEarItems(state, 1)).toHaveLength(1);
  });

  it("breaks ties by the larger number of attempts", () => {
    const state = {
      itemStats: {
        interval: { "3": { correct: 1, total: 4 } },
        scale: { Dorian: { correct: 2, total: 8 } },
      },
    };

    expect(weakestEarItems(state).map((item) => item.id)).toEqual(["Dorian", "3"]);
  });

  it("ignores items below the minimum attempts or without any miss", () => {
    const state = {
      itemStats: {
        interval: { "3": { correct: 0, total: 2 }, "5": { correct: 5, total: 5 } },
      },
    };

    expect(weakestEarItems(state)).toEqual([]);
  });

  it("is empty for a learner with no history", () => {
    expect(weakestEarItems({})).toEqual([]);
  });
});

describe("weakestNoteIdString", () => {
  const entry = (string: number, correct: number, total: number) => ({
    string,
    correct,
    total,
    percent: total === 0 ? null : Math.round((correct / total) * 100),
  });

  it("picks the lowest-accuracy string with enough attempts", () => {
    expect(weakestNoteIdString([entry(0, 8, 10), entry(1, 5, 10), entry(2, 9, 10)])?.string).toBe(1);
  });

  it("needs enough attempts on the string", () => {
    expect(weakestNoteIdString([entry(0, 0, 4), entry(1, 6, 10)])?.string).toBe(1);
    expect(weakestNoteIdString([entry(0, 0, 4)])).toBeNull();
  });

  it("does not flag strings that are already good", () => {
    expect(weakestNoteIdString([entry(0, 19, 20), entry(1, 10, 10)])).toBeNull();
  });

  it("ignores strings without answers", () => {
    expect(weakestNoteIdString([entry(0, 0, 0)])).toBeNull();
  });
});
