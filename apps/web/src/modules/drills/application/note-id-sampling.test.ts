import { describe, expect, it } from "vitest";

import { Fretboard, STANDARD_GUITAR_TUNING } from "@music-workspace/music-theory";

import { NOTE_ID_LEVELS, noteIdPool } from "./note-id-levels";
import {
  chooseNoteIdPosition,
  positionKey,
  positionWeight,
  recordAnswer,
  summarizeByString,
  WEIGHT_FLOOR,
} from "./note-id-sampling";

const positions = new Fretboard(STANDARD_GUITAR_TUNING, 12).positions();

describe("noteIdPool", () => {
  it("covers frets 0..maxFret on every string, per level", () => {
    for (const level of NOTE_ID_LEVELS) {
      const pool = noteIdPool(positions, level.id, false);

      expect(pool).toHaveLength(6 * (level.maxFret + 1));
      expect(Math.max(...pool.map((position) => position.fret))).toBe(level.maxFret);
    }
  });

  it("grows monotonically and ends with the whole neck", () => {
    const sizes = NOTE_ID_LEVELS.map((level) => noteIdPool(positions, level.id, false).length);

    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes.at(-1)).toBe(6 * 13);
  });

  it("keeps only natural notes with the naturals-only toggle", () => {
    const pool = noteIdPool(positions, "frets12", true);

    expect(pool.length).toBeGreaterThan(0);
    expect(pool.length).toBeLessThan(6 * 13);
    expect(pool.every((position) => !position.pitch.note.value.includes("#"))).toBe(true);
  });
});

describe("positionWeight", () => {
  it("weights an unseen position between a mastered one and a failed one", () => {
    const unseen = positionWeight(undefined);
    const mastered = positionWeight({ correct: 10, total: 10 });
    const failing = positionWeight({ correct: 0, total: 10 });

    expect(mastered).toBeLessThan(unseen);
    expect(unseen).toBeLessThan(failing);
  });

  it("never drops below the floor, however long the winning streak", () => {
    expect(positionWeight({ correct: 100_000, total: 100_000 })).toBeGreaterThanOrEqual(WEIGHT_FLOOR);
    expect(positionWeight({ correct: 100_000, total: 100_000 })).toBeGreaterThan(0);
  });

  it("is monotonic in the error count for the same number of attempts", () => {
    const weights = [0, 1, 2, 3, 4].map((wrong) => positionWeight({ correct: 4 - wrong, total: 4 }));

    expect(weights).toEqual([...weights].sort((a, b) => a - b));
  });
});

describe("chooseNoteIdPosition", () => {
  const pool = noteIdPool(positions, "frets3", false);

  it("is deterministic given the random source", () => {
    expect(chooseNoteIdPosition(pool, {}, () => 0)).toBe(pool[0]);
    expect(chooseNoteIdPosition(pool, {}, () => 0.999999)).toBe(pool[pool.length - 1]);
  });

  it("favours weak positions over mastered ones", () => {
    const weak = pool[5];
    const stats = Object.fromEntries(
      pool.map((position) => [positionKey(position), { correct: 20, total: 20 }]),
    );
    stats[positionKey(weak)] = { correct: 0, total: 20 };

    let weakHits = 0;
    const draws = 5_000;
    // Sequência de números "aleatórios" uniforme e determinística (passo coprimo).
    for (let i = 0; i < draws; i++) {
      const picked = chooseNoteIdPosition(pool, stats, () => ((i * 7919) % draws) / draws);
      if (picked === weak) weakHits++;
    }

    // Uniforme daria ~1/24 (4,2%); o ponto fraco deve aparecer várias vezes mais.
    expect(weakHits / draws).toBeGreaterThan(0.15);
  });

  it("still reaches every position of the pool, even fully mastered ones (floor)", () => {
    const stats = Object.fromEntries(
      pool.map((position) => [positionKey(position), { correct: 1_000, total: 1_000 }]),
    );
    const seen = new Set<string>();
    const draws = 2_000;

    for (let i = 0; i < draws; i++) {
      seen.add(positionKey(chooseNoteIdPosition(pool, stats, () => ((i * 7919) % draws) / draws)));
    }

    expect(seen.size).toBe(pool.length);
  });

  it("never repeats the previous position when there is an alternative", () => {
    const previous = positionKey(pool[0]);

    for (let i = 0; i < 200; i++) {
      expect(positionKey(chooseNoteIdPosition(pool, {}, () => i / 200, previous))).not.toBe(previous);
    }
  });

  it("returns the only position of a single-item pool even if it was the previous one", () => {
    const only = [pool[0]];

    expect(chooseNoteIdPosition(only, {}, Math.random, positionKey(pool[0]))).toBe(pool[0]);
  });
});

describe("recordAnswer", () => {
  it("accumulates per position without mutating the previous map", () => {
    const first = recordAnswer({}, { string: 0, fret: 3 }, true);
    const second = recordAnswer(first, { string: 0, fret: 3 }, false);

    expect(first).toEqual({ "0-3": { correct: 1, total: 1 } });
    expect(second).toEqual({ "0-3": { correct: 1, total: 2 } });
  });
});

describe("summarizeByString", () => {
  const pool = noteIdPool(positions, "frets3", false);

  it("lists every string of the pool, low to high, with null accuracy when unanswered", () => {
    const summary = summarizeByString(pool, {});

    expect(summary.map((entry) => entry.string)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(summary.every((entry) => entry.percent === null && entry.total === 0)).toBe(true);
  });

  it("sums the positions of each string and rounds the accuracy", () => {
    const summary = summarizeByString(pool, {
      "0-0": { correct: 1, total: 1 },
      "0-2": { correct: 1, total: 2 },
      "3-1": { correct: 0, total: 3 },
    });

    expect(summary[0]).toEqual({ string: 0, correct: 2, total: 3, percent: 67 });
    expect(summary[3]).toEqual({ string: 3, correct: 0, total: 3, percent: 0 });
  });

  it("ignores answers on positions outside the pool (e.g. a higher level)", () => {
    const summary = summarizeByString(pool, { "0-9": { correct: 5, total: 5 } });

    expect(summary[0].total).toBe(0);
  });
});
