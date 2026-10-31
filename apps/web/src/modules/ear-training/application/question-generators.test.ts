import { describe, expect, it } from "vitest";

import type { ItemStatsState } from "./item-stats";
import { generateQuestion, pickItemAndDistractors, type QuizKind } from "./question-generators";

const KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
const ITERATIONS = 30;

describe("generateQuestion", () => {
  it.each(KINDS)("returns 4 distinct options with the correct answer present (%s)", (kind) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion(kind, "hard");

      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(question.options.some((option) => option.id === question.correctId)).toBe(true);
    }
  });

  it.each(KINDS)(
    "builds strictly ascending pitches (regression: octave-wrap bug from Note+fixed-octave)",
    (kind) => {
      for (let i = 0; i < ITERATIONS; i++) {
        const question = generateQuestion(kind, "hard");
        const midis = question.pitches.map((pitch) => pitch.midi());

        for (let j = 1; j < midis.length; j++) {
          expect(midis[j]).toBeGreaterThan(midis[j - 1]);
        }
      }
    },
  );

  it("never puts both Ionian and Major (or Aeolian and Natural Minor) in the same scale question", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion("scale", "hard");
      const names = question.options.map((option) => option.id);

      expect(names).not.toContain("Ionian");
      expect(names).not.toContain("Aeolian");
    }
  });

  it.each(KINDS)("labels options with translatable terms while ids stay stable (%s)", (kind) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion(kind, "hard");

      question.options.forEach((option) => {
        expect(typeof option.label).toBe("object");
        expect(option.id).not.toBe(typeof option.label === "string" ? option.label : option.label.key);
      });
    }
  });
});

describe("adaptive sampling", () => {
  const pool = [1, 2, 3, 4, 5, 6];
  const idOf = String;

  // LCG determinístico: o teste não depende de Math.random.
  function seeded(seed: number) {
    let state = seed;

    return () => {
      state = (state * 16807) % 2147483647;

      return state / 2147483647;
    };
  }

  const stats: ItemStatsState = {
    itemStats: {
      interval: {
        "1": { correct: 20, total: 20 },
        "2": { correct: 20, total: 20 },
        "3": { correct: 20, total: 20 },
        "4": { correct: 20, total: 20 },
        "5": { correct: 20, total: 20 },
        "6": { correct: 0, total: 10 },
      },
    },
    confusions: { interval: { "6": { "5": 4, "2": 1 } } },
  };

  it("draws the weak item far more often than mastered ones, but still draws every item", () => {
    const random = seeded(42);
    const counts = new Map<number, number>();

    for (let i = 0; i < 3000; i++) {
      const { correct } = pickItemAndDistractors(pool, idOf, "interval", { stats, random });
      counts.set(correct, (counts.get(correct) ?? 0) + 1);
    }

    for (const item of pool) expect(counts.get(item) ?? 0).toBeGreaterThan(0);
    expect(counts.get(6)!).toBeGreaterThan(counts.get(1)! * 3);
  });

  it("is roughly uniform without stats", () => {
    const random = seeded(7);
    const counts = new Map<number, number>();

    for (let i = 0; i < 3000; i++) {
      const { correct } = pickItemAndDistractors(pool, idOf, "interval", { random });
      counts.set(correct, (counts.get(correct) ?? 0) + 1);
    }

    for (const item of pool) expect(counts.get(item)!).toBeGreaterThan(300);
  });

  it("always includes the learner's most frequent confusion as a distractor", () => {
    // random = 0.999 sorteia o último item do pool (6), o ponto fraco.
    for (let i = 0; i < 30; i++) {
      const { correct, distractors } = pickItemAndDistractors(pool, idOf, "interval", {
        stats,
        random: () => 0.999,
      });

      expect(correct).toBe(6);
      expect(distractors).toHaveLength(3);
      expect(distractors).toContain(5);
      expect(new Set([correct, ...distractors]).size).toBe(4);
    }
  });

  it("ignores a confusion that is outside the difficulty pool", () => {
    const outside: ItemStatsState = { confusions: { interval: { "6": { "99": 9 } } } };

    for (let i = 0; i < 20; i++) {
      const { correct, distractors } = pickItemAndDistractors(pool, idOf, "interval", {
        stats: outside,
        random: () => 0.999,
      });

      expect(correct).toBe(6);
      expect(distractors).toHaveLength(3);
      expect(distractors).not.toContain(99);
    }
  });

  it("generateQuestion keeps 4 distinct options with the confusion present", () => {
    const easyStats: ItemStatsState = {
      itemStats: { interval: { "7": { correct: 0, total: 10 } } },
      confusions: { interval: { "7": { "5": 6 } } },
    };

    for (let i = 0; i < 30; i++) {
      const question = generateQuestion("interval", "easy", { stats: easyStats, random: () => 0.5 });
      const ids = question.options.map((option) => option.id);

      expect(new Set(ids).size).toBe(4);
      expect(ids).toContain(question.correctId);
      if (question.correctId === "7") expect(ids).toContain("5");
    }
  });
});
