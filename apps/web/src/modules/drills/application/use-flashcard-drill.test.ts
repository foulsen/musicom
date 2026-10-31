import { createPinia, setActivePinia } from "pinia";
import { toRaw } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildDeck, type Flashcard } from "./flashcard-decks";
import { HARD_BOX_1_INTERVAL_MS } from "./leitner";
import { useDrillsStore } from "./use-drills-store";
import { useFlashcardDrill } from "./use-flashcard-drill";

beforeEach(() => {
  setActivePinia(createPinia());

  // O composable chama onMounted/onUnmounted (ticker do placar "devidos"); fora de um
  // componente eles só viram no-op com um aviso do Vue — irrelevante para estes testes.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("useFlashcardDrill", () => {
  it("shows every due card exactly once when every answer is correct (regression: skip/repeat bug)", () => {
    const { current, grade, deckSize } = useFlashcardDrill();
    const seen: string[] = [];

    while (current.value) {
      seen.push(current.value.id);
      grade("good");
    }

    expect(seen).toHaveLength(deckSize.value);
    expect(new Set(seen).size).toBe(deckSize.value);
  });

  it("requeues a wrongly-answered card once, at the end of the session, without skipping others", () => {
    const { current, grade, deckSize } = useFlashcardDrill();
    const firstCardId = current.value?.id;
    expect(firstCardId).toBeDefined();

    grade("again");

    const seenAfter: string[] = [];
    while (current.value) {
      seenAfter.push(current.value.id);
      grade("good");
    }

    expect(seenAfter).toHaveLength(deckSize.value);
    expect(seenAfter.filter((id) => id === firstCardId)).toHaveLength(1);
    expect(seenAfter[seenAfter.length - 1]).toBe(firstCardId);
  });
});

describe("useFlashcardDrill grading", () => {
  const NOW = 1_700_000_000_000;

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps a 'hard' card in its box and reschedules it with the box interval", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const { current, grade } = useFlashcardDrill();
    const { cardStates } = useDrillsStore();
    const id = current.value!.id;

    grade("hard");

    expect(cardStates[id]).toEqual({ box: 1, dueAt: NOW + HARD_BOX_1_INTERVAL_MS });
  });

  it("does not requeue a 'hard' card inside the session", () => {
    const { current, grade, deckSize, remaining } = useFlashcardDrill();
    const id = current.value!.id;

    grade("hard");

    expect(remaining.value).toBe(deckSize.value - 1);
    expect(current.value?.id).not.toBe(id);
  });

  describe("free practice (nothing due)", () => {
    function seedAllNotDue() {
      const { cardStates } = useDrillsStore();

      for (const card of buildDeck("intervals")) {
        cardStates[card.id] = { box: 3, dueAt: Date.now() + 10 * 24 * 60 * 60 * 1000 };
      }

      return structuredClone(toRaw(cardStates));
    }

    it("starts in free practice with the whole deck queued", () => {
      seedAllNotDue();
      const { isFreePractice, remaining, deckSize } = useFlashcardDrill();

      expect(isFreePractice.value).toBe(true);
      expect(remaining.value).toBe(deckSize.value);
    });

    it("never changes Leitner state, whatever the grade", () => {
      const before = seedAllNotDue();
      const { grade } = useFlashcardDrill();
      const { cardStates } = useDrillsStore();

      grade("good");
      grade("hard");
      grade("again");

      expect(structuredClone(toRaw(cardStates))).toEqual(before);
    });

    it("still requeues a missed card at the end of the session", () => {
      seedAllNotDue();
      const { current, grade, remaining, deckSize } = useFlashcardDrill();
      const missedId = current.value!.id;

      grade("again");

      expect(remaining.value).toBe(deckSize.value);

      const seen: string[] = [];
      while (current.value) {
        seen.push(current.value.id);
        grade("good");
      }

      expect(seen[seen.length - 1]).toBe(missedId);
    });
  });

  it("brings a missed chord-spelling card back with a different root", () => {
    const { selectDeck, current, grade } = useFlashcardDrill();
    selectDeck("chordSpelling");

    const first = current.value!;
    grade("again");

    const queued: Flashcard[] = [];
    while (current.value) {
      queued.push(current.value);
      grade("good");
    }
    const requeued = queued[queued.length - 1];

    expect(requeued.id).toBe(first.id);
    expect(requeued.prompt).not.toBe(first.prompt);
  });

  it("drops states saved under legacy chord-spelling ids without touching the others", () => {
    const { cardStates } = useDrillsStore();
    cardStates["chord-spelling-C7"] = { box: 4, dueAt: 1 };
    cardStates["interval-b3"] = { box: 2, dueAt: 1 };

    useFlashcardDrill();

    expect(cardStates["chord-spelling-C7"]).toBeUndefined();
    expect(cardStates["interval-b3"]).toEqual({ box: 2, dueAt: 1 });
  });
});
