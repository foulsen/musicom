import { describe, expect, it } from "vitest";

import {
  gradeLeitnerCard,
  HARD_BOX_1_INTERVAL_MS,
  initialLeitnerState,
  isDue,
  LEITNER_BOX_COUNT,
} from "./leitner";

describe("initialLeitnerState", () => {
  it("starts in box 1, due immediately", () => {
    const now = 1_000;
    const state = initialLeitnerState(now);

    expect(state.box).toBe(1);
    expect(isDue(state, now)).toBe(true);
  });
});

describe("gradeLeitnerCard", () => {
  it("advances one box per correct answer, up to the last box", () => {
    const now = 1_000;
    let state = initialLeitnerState(now);

    for (let i = 0; i < LEITNER_BOX_COUNT + 3; i++) {
      state = gradeLeitnerCard(state, true, now);
    }

    expect(state.box).toBe(LEITNER_BOX_COUNT);
  });

  it("resets to box 1 on a wrong answer and becomes immediately due", () => {
    const now = 1_000;
    let state = initialLeitnerState(now);

    state = gradeLeitnerCard(state, true, now);
    state = gradeLeitnerCard(state, true, now);
    expect(state.box).toBeGreaterThan(1);

    state = gradeLeitnerCard(state, false, now);

    expect(state.box).toBe(1);
    expect(isDue(state, now)).toBe(true);
  });

  it("pushes dueAt further into the future for each box, until the last one", () => {
    const now = 1_000;
    let state = initialLeitnerState(now);

    // LEITNER_BOX_COUNT - 1 transitions: box 1 -> 2 -> ... -> LEITNER_BOX_COUNT.
    const dueAtByBox: number[] = [];
    for (let i = 0; i < LEITNER_BOX_COUNT - 1; i++) {
      state = gradeLeitnerCard(state, true, now);
      dueAtByBox.push(state.dueAt);
    }

    for (let i = 1; i < dueAtByBox.length; i++) {
      expect(dueAtByBox[i]).toBeGreaterThan(dueAtByBox[i - 1]);
    }

    expect(state.box).toBe(LEITNER_BOX_COUNT);
    expect(isDue(state, now)).toBe(false);

    // Grading correct again at the last box caps out: same box, same interval.
    const cappedAgain = gradeLeitnerCard(state, true, now);
    expect(cappedAgain.box).toBe(LEITNER_BOX_COUNT);
    expect(cappedAgain.dueAt).toBe(state.dueAt);
  });

  it("keeps the legacy boolean grades working (true = good, false = again)", () => {
    const now = 1_000;
    const state = { box: 2, dueAt: now };

    expect(gradeLeitnerCard(state, true, now)).toEqual(gradeLeitnerCard(state, "good", now));
    expect(gradeLeitnerCard(state, false, now)).toEqual(gradeLeitnerCard(state, "again", now));
  });
});

describe("gradeLeitnerCard with the 'hard' grade", () => {
  const now = 1_000_000;

  it("stays in box 1 but is only due again after a short wait", () => {
    const state = gradeLeitnerCard(initialLeitnerState(now), "hard", now);

    expect(state.box).toBe(1);
    expect(state.dueAt).toBe(now + HARD_BOX_1_INTERVAL_MS);
    expect(isDue(state, now)).toBe(false);
    expect(isDue(state, now + HARD_BOX_1_INTERVAL_MS)).toBe(true);
  });

  it("stays in the same box and repeats that box's interval, never advancing", () => {
    const box2 = gradeLeitnerCard(initialLeitnerState(now), "good", now);
    const hardInBox2 = gradeLeitnerCard(box2, "hard", now);

    expect(hardInBox2.box).toBe(2);
    expect(hardInBox2.dueAt).toBe(box2.dueAt);

    const lastBox = { box: LEITNER_BOX_COUNT, dueAt: now };
    const hardInLastBox = gradeLeitnerCard(lastBox, "hard", now);

    expect(hardInLastBox.box).toBe(LEITNER_BOX_COUNT);
    expect(hardInLastBox.dueAt).toBeGreaterThan(now);
  });

  it("is gentler than 'again' and less rewarding than 'good'", () => {
    const state = { box: 3, dueAt: now };
    const again = gradeLeitnerCard(state, "again", now);
    const hard = gradeLeitnerCard(state, "hard", now);
    const good = gradeLeitnerCard(state, "good", now);

    expect(hard.box).toBeGreaterThan(again.box);
    expect(hard.box).toBeLessThan(good.box);
    expect(hard.dueAt).toBeGreaterThan(again.dueAt);
    expect(hard.dueAt).toBeLessThan(good.dueAt);
  });
});
