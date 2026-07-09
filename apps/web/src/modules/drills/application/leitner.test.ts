import { describe, expect, it } from "vitest";

import { gradeLeitnerCard, initialLeitnerState, isDue, LEITNER_BOX_COUNT } from "./leitner";

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
});
