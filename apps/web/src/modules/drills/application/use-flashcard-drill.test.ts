import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
      grade(true);
    }

    expect(seen).toHaveLength(deckSize.value);
    expect(new Set(seen).size).toBe(deckSize.value);
  });

  it("requeues a wrongly-answered card once, at the end of the session, without skipping others", () => {
    const { current, grade, deckSize } = useFlashcardDrill();
    const firstCardId = current.value?.id;
    expect(firstCardId).toBeDefined();

    grade(false);

    const seenAfter: string[] = [];
    while (current.value) {
      seenAfter.push(current.value.id);
      grade(true);
    }

    expect(seenAfter).toHaveLength(deckSize.value);
    expect(seenAfter.filter((id) => id === firstCardId)).toHaveLength(1);
    expect(seenAfter[seenAfter.length - 1]).toBe(firstCardId);
  });
});
