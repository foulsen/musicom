import { describe, expect, it } from "vitest";

import { randomChoice, randomInt, sampleDistinct, shuffle } from "./random";

describe("randomInt", () => {
  it("returns an integer within [0, maxExclusive)", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(5);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(5);
    }
  });
});

describe("randomChoice", () => {
  it("always returns an item that belongs to the input array", () => {
    const items = ["a", "b", "c"];

    for (let i = 0; i < 50; i++) {
      expect(items).toContain(randomChoice(items));
    }
  });
});

describe("shuffle", () => {
  it("returns the same multiset of elements, in a new array", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items);

    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual([...items].sort());
  });
});

describe("sampleDistinct", () => {
  it("excludes items matching the predicate and returns the requested count", () => {
    const pool = [1, 2, 3, 4, 5, 6];

    for (let i = 0; i < 50; i++) {
      const result = sampleDistinct(pool, 3, (value) => value === 3);

      expect(result).toHaveLength(3);
      expect(result).not.toContain(3);
      expect(new Set(result).size).toBe(3);
    }
  });
});
