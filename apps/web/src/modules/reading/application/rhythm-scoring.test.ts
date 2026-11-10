import { describe, expect, it } from "vitest";

import { scoreRhythmTaps } from "./rhythm-scoring";

const EXPECTED = [0, 1, 2, 3];

describe("scoreRhythmTaps", () => {
  it("scores perfect taps as 1", () => {
    const score = scoreRhythmTaps(EXPECTED, [0, 1, 2, 3]);

    expect(score.results).toEqual(["hit", "hit", "hit", "hit"]);
    expect(score.extraTaps).toBe(0);
    expect(score.accuracy).toBe(1);
  });

  it("accepts taps inside the tolerance, early or late", () => {
    const score = scoreRhythmTaps(EXPECTED, [-0.1, 1.05, 1.95, 3.12]);

    expect(score.accuracy).toBe(1);
  });

  it("counts a tap beyond the tolerance as a miss plus an extra tap", () => {
    const score = scoreRhythmTaps(EXPECTED, [0, 1, 2, 3.2]);

    expect(score.results).toEqual(["hit", "hit", "hit", "miss"]);
    expect(score.extraTaps).toBe(1);
    expect(score.accuracy).toBeCloseTo(3 / 5);
  });

  it("lowers accuracy with extra taps", () => {
    const score = scoreRhythmTaps(EXPECTED, [0, 0.5, 1, 2, 3]);

    expect(score.results).toEqual(["hit", "hit", "hit", "hit"]);
    expect(score.extraTaps).toBe(1);
    expect(score.accuracy).toBeCloseTo(4 / 5);
  });

  it("does not let one tap satisfy two attacks", () => {
    const score = scoreRhythmTaps([0, 0.1], [0.05]);

    expect(score.results).toEqual(["hit", "miss"]);
    expect(score.extraTaps).toBe(0);
    expect(score.accuracy).toBeCloseTo(1 / 2);
  });

  it("matches taps to the earliest free attack and ignores input order", () => {
    const score = scoreRhythmTaps([0, 0.15], [0.14, 0.02]);

    expect(score.results).toEqual(["hit", "hit"]);
    expect(score.accuracy).toBe(1);
  });

  it("scores no taps as 0", () => {
    const score = scoreRhythmTaps(EXPECTED, []);

    expect(score.results).toEqual(["miss", "miss", "miss", "miss"]);
    expect(score.extraTaps).toBe(0);
    expect(score.accuracy).toBe(0);
  });

  it("scores 0 when there is nothing to tap and nothing was tapped", () => {
    expect(scoreRhythmTaps([], []).accuracy).toBe(0);
  });
});
