import { describe, expect, it } from "vitest";

import { MIN_ITEM_WEIGHT, itemWeight, pickWeighted, smoothedErrorRate } from "./weighted-sampling";

describe("smoothedErrorRate", () => {
  it("rates an unseen item at 0.5", () => {
    expect(smoothedErrorRate(undefined)).toBe(0.5);
    expect(itemWeight(undefined)).toBe(0.5);
  });
});

describe("itemWeight", () => {
  it("floors mastered items at MIN_ITEM_WEIGHT (0.15)", () => {
    expect(MIN_ITEM_WEIGHT).toBe(0.15);
    expect(itemWeight({ correct: 50, total: 50 })).toBe(0.15);
  });
});

describe("pickWeighted", () => {
  it("walks the cumulative weights with the injected random", () => {
    const items = ["a", "b", "c"];
    const weights = [1, 2, 1];

    expect(pickWeighted(items, weights, () => 0)).toBe("a");
    expect(pickWeighted(items, weights, () => 0.24)).toBe("a");
    expect(pickWeighted(items, weights, () => 0.3)).toBe("b");
    expect(pickWeighted(items, weights, () => 0.74)).toBe("b");
    expect(pickWeighted(items, weights, () => 0.8)).toBe("c");
    expect(pickWeighted(items, weights, () => 0.999999)).toBe("c");
  });
});
