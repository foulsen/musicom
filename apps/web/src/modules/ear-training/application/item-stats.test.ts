import { describe, expect, it } from "vitest";

import {
  MIN_ITEM_WEIGHT,
  clearItemStats,
  itemWeight,
  pickWeighted,
  recordItemAnswer,
  smoothedErrorRate,
  topConfusionId,
  weakestItems,
  type ConfusionsByKind,
  type ItemStatsByKind,
} from "./item-stats";

function emptyState() {
  return { itemStats: {} as ItemStatsByKind, confusions: {} as ConfusionsByKind };
}

describe("recordItemAnswer", () => {
  it("counts correct answers without recording a confusion", () => {
    const state = emptyState();

    recordItemAnswer(state, "interval", "8", "8");

    expect(state.itemStats.interval?.["8"]).toEqual({ correct: 1, total: 1 });
    expect(state.confusions).toEqual({});
  });

  it("counts a wrong answer and the correct -> chosen confusion", () => {
    const state = emptyState();

    recordItemAnswer(state, "interval", "8", "7");
    recordItemAnswer(state, "interval", "8", "7");
    recordItemAnswer(state, "interval", "8", "9");

    expect(state.itemStats.interval?.["8"]).toEqual({ correct: 0, total: 3 });
    expect(state.confusions.interval?.["8"]).toEqual({ "7": 2, "9": 1 });
  });

  it("keeps kinds apart and clears only the requested kind", () => {
    const state = emptyState();

    recordItemAnswer(state, "interval", "8", "7");
    recordItemAnswer(state, "scale", "Dorian", "Major");
    clearItemStats(state, "interval");

    expect(state.itemStats.interval).toBeUndefined();
    expect(state.confusions.interval).toBeUndefined();
    expect(state.itemStats.scale?.Dorian.total).toBe(1);
  });
});

describe("itemWeight", () => {
  it("weights unseen items at 0.5 and mastered items down to the floor", () => {
    expect(smoothedErrorRate(undefined)).toBe(0.5);
    expect(itemWeight(undefined)).toBe(0.5);
    expect(itemWeight({ correct: 50, total: 50 })).toBe(MIN_ITEM_WEIGHT);
  });

  it("weights a consistently missed item above an unseen one", () => {
    expect(itemWeight({ correct: 0, total: 8 })).toBeGreaterThan(itemWeight(undefined));
  });

  it("never reaches zero, so every item can still be drawn", () => {
    expect(itemWeight({ correct: 1000, total: 1000 })).toBeGreaterThan(0);
  });
});

describe("pickWeighted", () => {
  const items = ["a", "b", "c"];

  it("walks the cumulative weights with the injected random", () => {
    const weights = [1, 2, 1];

    expect(pickWeighted(items, weights, () => 0)).toBe("a");
    expect(pickWeighted(items, weights, () => 0.24)).toBe("a");
    expect(pickWeighted(items, weights, () => 0.3)).toBe("b");
    expect(pickWeighted(items, weights, () => 0.74)).toBe("b");
    expect(pickWeighted(items, weights, () => 0.8)).toBe("c");
    expect(pickWeighted(items, weights, () => 0.999999)).toBe("c");
  });
});

describe("topConfusionId", () => {
  it("returns the most frequent confusion that is inside the allowed pool", () => {
    expect(topConfusionId({ "7": 2, "9": 5, "1": 9 }, ["7", "9", "8"], "8")).toBe("9");
  });

  it("ignores the correct id itself and returns null without data", () => {
    expect(topConfusionId({ "8": 3 }, ["8", "7"], "8")).toBeNull();
    expect(topConfusionId(undefined, ["8", "7"], "8")).toBeNull();
  });
});

describe("weakestItems", () => {
  const state = {
    itemStats: {
      interval: {
        "8": { correct: 1, total: 6 },
        "3": { correct: 3, total: 4 },
        "4": { correct: 5, total: 5 },
        "10": { correct: 0, total: 2 },
        "9": { correct: 2, total: 8 },
        "6": { correct: 0, total: 3 },
      },
    },
    confusions: { interval: { "8": { "7": 3, "9": 1 }, "9": { "8": 2 } } },
  } satisfies { itemStats: ItemStatsByKind; confusions: ConfusionsByKind };

  it("lists items by ascending accuracy, with enough attempts and at least one miss", () => {
    const items = weakestItems(state, "interval", 3);

    expect(items.map((item) => item.id)).toEqual(["6", "8", "9"]);
    expect(items[1]).toMatchObject({ correct: 1, total: 6, topConfusion: { id: "7", count: 3 } });
    expect(items[1].accuracy).toBeCloseTo(1 / 6);
  });

  it("excludes perfect and under-sampled items and respects the limit", () => {
    const ids = weakestItems(state, "interval", 10).map((item) => item.id);

    expect(ids).not.toContain("4");
    expect(ids).not.toContain("10");
    expect(weakestItems(state, "interval", 1)).toHaveLength(1);
  });

  it("returns an empty list when there is no data for the kind", () => {
    expect(weakestItems(state, "scale")).toEqual([]);
    expect(weakestItems({}, "interval")).toEqual([]);
  });

  it("has a null confusion when the misses were never recorded", () => {
    expect(weakestItems(state, "interval", 3).find((item) => item.id === "6")?.topConfusion).toBeNull();
  });
});
