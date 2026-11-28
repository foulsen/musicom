import { describe, expect, it } from "vitest";

import { Pitch } from "@music-workspace/music-theory";

import type { ItemStatsState } from "./item-stats";
import { progressionChords } from "./progression";
import {
  MIN_CUSTOM_ITEMS,
  allItemsForKind,
  generateQuestion,
  invertPitches,
  itemIdsForDifficulty,
  orderScalePitches,
  poolFor,
  pickItemAndDistractors,
  pitchesForOption,
  resolveChordInversion,
  resolveIntervalDescending,
  type QuizKind,
} from "./question-generators";

describe("orderScalePitches", () => {
  const up = [1, 2, 3, 4];

  it("keeps ascending order", () => expect(orderScalePitches(up, "ascending")).toEqual([1, 2, 3, 4]));
  it("reverses for descending", () => expect(orderScalePitches(up, "descending")).toEqual([4, 3, 2, 1]));
  it("goes up and back down without repeating the top", () =>
    expect(orderScalePitches(up, "both")).toEqual([1, 2, 3, 4, 3, 2, 1]));
});

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

describe("scale degree questions", () => {
  it("plays a single target note relative to the tonic, with 4 distinct degree options", () => {
    for (let i = 0; i < 30; i++) {
      const question = generateQuestion("scaleDegree", "hard");

      expect(question.playback).toBe("cadence");
      expect(question.tonic).toBeDefined();
      expect(question.pitches).toHaveLength(1);
      expect(question.pitches[0].midi() - question.tonic!.midi()).toBe(Number(question.correctId));
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
    }
  });

  it("keeps easy questions on the stable degrees 1, 3, 4 and 5", () => {
    for (let i = 0; i < 30; i++) {
      const ids = generateQuestion("scaleDegree", "easy").options.map((option) => option.id);

      expect(ids.sort()).toEqual(["0", "4", "5", "7"]);
    }
  });

  it("answers with the option note over the same tonic", () => {
    const question = generateQuestion("scaleDegree", "medium");
    const [pitch] = pitchesForOption(question, "7");

    expect(pitch.midi() - question.tonic!.midi()).toBe(7);
  });
});

describe("progression questions", () => {
  it.each(["easy", "medium", "hard"] as const)("returns 4 distinct options with the correct id present (%s)", (difficulty) => {
    for (let i = 0; i < 30; i++) {
      const question = generateQuestion("progression", difficulty);

      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(question.options.map((option) => option.id)).toContain(question.correctId);
    }
  });

  it("labels options with the literal roman-numeral string while ids stay ASCII", () => {
    const question = generateQuestion("progression", "hard");

    question.options.forEach((option) => {
      expect(typeof option.label).toBe("string");
      expect(option.id).toMatch(/^[A-Za-z-]+$/);
    });
    expect(allItemsForKind("progression").find((item) => item.id === "I-V-vi-IV")?.label).toBe("I–V–vi–IV");
  });

  it("plays in the question tonic and rebuilds any option in that same key", () => {
    const question = generateQuestion("progression", "medium");

    expect(question.playback).toBe("progression");
    expect(question.tonic).toBeDefined();
    expect(question.pitches).toEqual([question.tonic]);

    const option = question.options[0].id;
    const expected = progressionChords(option, question.tonic!)!.flat();

    expect(pitchesForOption(question, option).map((pitch) => pitch.midi())).toEqual(expected.map((pitch) => pitch.midi()));
  });

  it("keeps easy questions on the easy pool", () => {
    const easy = itemIdsForDifficulty("progression", "easy");

    for (let i = 0; i < 20; i++) {
      generateQuestion("progression", "easy").options.forEach((option) => expect(easy).toContain(option.id));
    }
  });
});

describe("chord inversions", () => {
  const C4 = Pitch.from("C", 4);
  const triad = [C4, C4.transpose(4), C4.transpose(7)];
  const seventh = [...triad, C4.transpose(11)];
  const midis = (pitches: Pitch[]) => pitches.map((pitch) => pitch.midi());

  it("moves the lowest k tones up an octave and keeps pitches strictly ascending", () => {
    expect(midis(invertPitches(triad, 0))).toEqual([60, 64, 67]);
    expect(midis(invertPitches(triad, 1))).toEqual([64, 67, 72]);
    expect(midis(invertPitches(triad, 2))).toEqual([67, 72, 76]);
    expect(midis(invertPitches(seventh, 3))).toEqual([71, 72, 76, 79]);

    for (const chord of [triad, seventh]) {
      for (let k = 0; k < chord.length; k++) {
        const result = midis(invertPitches(chord, k));

        result.slice(1).forEach((midi, index) => expect(midi).toBeGreaterThan(result[index]));
      }
    }
  });

  it("clamps the inversion to the chord size", () => {
    expect(midis(invertPitches(triad, 3))).toEqual(midis(invertPitches(triad, 2)));
    expect(midis(invertPitches(triad, -1))).toEqual(midis(triad));
  });

  it("resolves the inversion from the voicing preference", () => {
    expect(resolveChordInversion("root", 4)).toBe(0);
    expect(resolveChordInversion("inversions", 3, () => 0)).toBe(0);
    expect(resolveChordInversion("inversions", 3, () => 0.999)).toBe(2);
  });

  it("stores an inversion within range with the inversions voicing", () => {
    const seen = new Set<number>();

    for (let i = 0; i < 200; i++) {
      const question = generateQuestion("chordQuality", "hard", { chordVoicing: "inversions" });

      expect(question.inversion).toBeGreaterThanOrEqual(0);
      expect(question.inversion).toBeLessThanOrEqual(question.pitches.length - 1);
      seen.add(question.inversion!);
    }

    expect(seen.size).toBeGreaterThan(1);
  });

  it("stays in root position by default", () => {
    for (let i = 0; i < 30; i++) {
      expect(generateQuestion("chordQuality", "hard").inversion).toBe(0);
      expect(generateQuestion("chordQuality", "hard", { chordVoicing: "root" }).inversion).toBe(0);
    }
  });

  it("rebuilds an option's chord in root position on the question root, so playback applies the same inversion", () => {
    const question = generateQuestion("chordQuality", "hard", { chordVoicing: "inversions" });
    const option = pitchesForOption(question, question.options[0].id);

    expect(option[0].midi()).toBe(question.pitches[0].midi());
  });
});

describe("interval direction", () => {
  it("resolves fixed directions and splits mixed by the random source", () => {
    expect(resolveIntervalDescending("ascending")).toBe(false);
    expect(resolveIntervalDescending("descending")).toBe(true);
    expect(resolveIntervalDescending("mixed", () => 0.2)).toBe(true);
    expect(resolveIntervalDescending("mixed", () => 0.8)).toBe(false);
  });

  it("marks interval questions descending but keeps pitches ascending from the root", () => {
    const question = generateQuestion("interval", "medium", { intervalDirection: "descending" });

    expect(question.descending).toBe(true);
    expect(question.pitches[1].midi()).toBeGreaterThan(question.pitches[0].midi());
  });
});

describe("custom item set", () => {
  const entries: [number, number][] = [
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 2],
    [5, 3],
    [6, 3],
  ];
  const ALL_KINDS: QuizKind[] = ["interval", "chordQuality", "scale", "scaleDegree", "progression"];

  it("uses the difficulty pool when there are no custom ids", () => {
    expect(poolFor(entries, String, "easy")).toEqual([1, 2]);
    expect(poolFor(entries, String, "medium", [])).toEqual([1, 2, 3, 4]);
  });

  it("uses the custom items from the full pool, ignoring difficulty", () => {
    expect(poolFor(entries, String, "easy", ["6", "1", "4", "5"])).toEqual([1, 4, 5, 6]);
  });

  it("falls back to the difficulty pool with fewer than the minimum valid ids", () => {
    expect(MIN_CUSTOM_ITEMS).toBe(4);
    expect(poolFor(entries, String, "easy", ["3", "4", "5"])).toEqual([1, 2]);
  });

  it("ignores unknown ids and counts only valid ones toward the minimum", () => {
    expect(poolFor(entries, String, "easy", ["3", "4", "5", "99", "abc"])).toEqual([1, 2]);
    expect(poolFor(entries, String, "easy", ["3", "4", "5", "6", "99"])).toEqual([3, 4, 5, 6]);
  });

  it("generates questions only from the custom set (hard-only items on easy)", () => {
    const customItemIds = ["1", "6", "8", "11"];

    for (let i = 0; i < 40; i++) {
      const question = generateQuestion("interval", "easy", { customItemIds });

      expect(question.options.map((option) => option.id).sort()).toEqual([...customItemIds].sort());
    }
  });

  it("works for every quiz kind and falls back when the set is too small", () => {
    for (const kind of ALL_KINDS) {
      const customItemIds = allItemsForKind(kind)
        .slice(-MIN_CUSTOM_ITEMS)
        .map((item) => item.id);
      const small = customItemIds.slice(0, 2);

      for (let i = 0; i < 10; i++) {
        const ids = generateQuestion(kind, "easy", { customItemIds }).options.map((option) => option.id);
        expect(ids.sort()).toEqual([...customItemIds].sort());

        const fallbackIds = generateQuestion(kind, "easy", { customItemIds: small }).options.map((option) => option.id);
        expect(fallbackIds.sort()).toEqual([...itemIdsForDifficulty(kind, "easy")].sort());
      }
    }
  });

  it("allItemsForKind lists every item of every kind in pool order with a label", () => {
    for (const kind of ALL_KINDS) {
      const items = allItemsForKind(kind);
      const hard = itemIdsForDifficulty(kind, "hard");

      expect(items.length).toBeGreaterThanOrEqual(MIN_CUSTOM_ITEMS);
      expect(items.map((item) => item.id)).toEqual(hard);
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      items.forEach((item) => expect(item.label).toBeTruthy());
    }
  });

  it("itemIdsForDifficulty is cumulative and always has enough items", () => {
    for (const kind of ALL_KINDS) {
      const easy = itemIdsForDifficulty(kind, "easy");
      const medium = itemIdsForDifficulty(kind, "medium");

      expect(easy.length).toBeGreaterThanOrEqual(MIN_CUSTOM_ITEMS);
      expect(medium).toEqual(expect.arrayContaining(easy));
    }
  });
});
