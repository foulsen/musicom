import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";

import { allCardIds } from "./flashcard-decks";
import { summarizeDueReviews, useDueReviews } from "./use-due-reviews";
import { useDrillsStore } from "./use-drills-store";

const NOW = 1_700_000_000_000;

describe("summarizeDueReviews", () => {
  it("counts studied cards whose review expired as due and never-seen cards as new", () => {
    const summary = summarizeDueReviews(
      ["a", "b", "c", "d"],
      {
        a: { box: 2, dueAt: NOW - 1 },
        b: { box: 2, dueAt: NOW },
        c: { box: 4, dueAt: NOW + 1 },
      },
      NOW,
    );

    expect(summary).toEqual({ dueCount: 2, newCount: 1 });
  });

  it("ignores states of ids that are not cards anymore", () => {
    const summary = summarizeDueReviews(["a"], { "chord-spelling-C7": { box: 1, dueAt: 0 } }, NOW);

    expect(summary).toEqual({ dueCount: 0, newCount: 1 });
  });
});

describe("useDueReviews", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no reviews due: everything is new", () => {
    const scope = effectScope();
    const { dueCount, newCount } = scope.run(() => useDueReviews())!;

    expect(dueCount.value).toBe(0);
    expect(newCount.value).toBe(allCardIds().length);

    scope.stop();
  });

  it("sums due reviews across decks and reacts to the clock", () => {
    const [first, second] = allCardIds();
    const { cardStates } = useDrillsStore();
    cardStates[first] = { box: 2, dueAt: NOW - 1_000 };
    cardStates[second] = { box: 2, dueAt: NOW + 45_000 };

    const scope = effectScope();
    const { dueCount } = scope.run(() => useDueReviews())!;

    expect(dueCount.value).toBe(1);

    vi.advanceTimersByTime(60_000);

    expect(dueCount.value).toBe(2);

    scope.stop();
  });

  it("reacts when a card is graded", () => {
    const [first] = allCardIds();
    const { cardStates } = useDrillsStore();
    cardStates[first] = { box: 2, dueAt: NOW - 1 };

    const scope = effectScope();
    const { dueCount } = scope.run(() => useDueReviews())!;
    expect(dueCount.value).toBe(1);

    cardStates[first] = { box: 3, dueAt: NOW + 86_400_000 };

    expect(dueCount.value).toBe(0);

    scope.stop();
  });
});
