import { Clef, KeySignature, passageAttacks } from "@music-workspace/music-theory";
import { describe, expect, it } from "vitest";

import { NOTE_READING_LEVELS } from "./note-reading-levels";
import {
  isNoteReadingAnswerCorrect,
  nextNoteReadingQuestion,
  noteReadingPool,
} from "./note-reading-generator";
import { NOTE_READING_LEVEL_IDS } from "./reading-types";

describe("noteReadingPool", () => {
  it.each(NOTE_READING_LEVEL_IDS)("is non-empty and stays within the level positions (%s)", (levelId) => {
    const level = NOTE_READING_LEVELS[levelId];
    const pool = noteReadingPool(levelId);

    expect(pool.length).toBeGreaterThan(0);
    expect(new Set(pool.map((item) => item.itemKey)).size).toBe(pool.length);

    for (const item of pool) {
      expect(level.clefs).toContain(item.clef);

      const position = Clef.from(item.clef).staffPosition(item.pitch);
      expect(position).toBeGreaterThanOrEqual(level.minPosition);
      expect(position).toBeLessThanOrEqual(level.maxPosition);
    }
  });

  it("covers sharps, flats and naturals in the accidentals level", () => {
    const accidentals = new Set(noteReadingPool("accidentals").map((item) => item.pitch.spelled.accidental));

    expect([...accidentals].sort()).toEqual([-1, 0, 1]);
  });

  it("gives key-signature items the accidental of their key", () => {
    const pool = noteReadingPool("key-signatures");

    expect(pool.some((item) => item.fifths !== 0)).toBe(true);

    for (const item of pool) {
      const key = new KeySignature(item.fifths);

      expect(item.fifths).not.toBe(0);
      expect(item.pitch.spelled.accidental).toBe(key.accidentalFor(item.pitch.spelled.letter));
      expect(item.itemKey).toBe(`${item.clef}:${item.fifths}:${item.pitch}`);
    }
  });

  it("uses plain `clef:pitch` item keys outside the key-signature level", () => {
    for (const item of noteReadingPool("treble-staff")) {
      expect(item.itemKey).toBe(`treble:${item.pitch}`);
    }
  });
});

describe("nextNoteReadingQuestion", () => {
  it("builds a one-whole-note passage whose answer is the spelled pitch", () => {
    const question = nextNoteReadingQuestion("key-signatures", {});
    const [attack] = passageAttacks(question.passage);

    expect(question.passage.measures).toHaveLength(1);
    expect(attack.event.pitches).toHaveLength(1);
    expect(attack.event.pitches[0].equals(question.pitch)).toBe(true);
    expect(question.answer).toBe(question.pitch.spelled);
    expect(isNoteReadingAnswerCorrect(question.answer, question.pitch.spelled.letter, question.pitch.spelled.accidental)).toBe(true);
    expect(isNoteReadingAnswerCorrect(question.answer, question.pitch.spelled.letter, question.pitch.spelled.accidental + 1)).toBe(false);
  });

  it("never repeats the previous item", () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (const levelId of NOTE_READING_LEVEL_IDS) {
      let previousKey: string | undefined;

      for (let i = 0; i < 60; i++) {
        const question = nextNoteReadingQuestion(levelId, {}, previousKey, random);

        expect(question.itemKey).not.toBe(previousKey);
        previousKey = question.itemKey;
      }
    }
  });

  it("prefers an item with many errors (stubbed random)", () => {
    const pool = noteReadingPool("treble-staff");
    const struggling = pool[4];
    const mastered = pool[7];
    const stats = {
      [struggling.itemKey]: { correct: 0, total: 30 },
      [mastered.itemKey]: { correct: 30, total: 30 },
    };

    // Varre r uniformemente em [0, 1): a fração de r que cai em cada item é a sua probabilidade.
    const draws = 1000;
    const counts = new Map<string, number>();

    for (let i = 0; i < draws; i++) {
      const key = nextNoteReadingQuestion("treble-staff", stats, undefined, () => i / draws).itemKey;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.get(struggling.itemKey) ?? 0).toBeGreaterThan(2 * (counts.get(pool[0].itemKey) ?? 0) * 0.9);
    expect(counts.get(struggling.itemKey) ?? 0).toBeGreaterThan(4 * (counts.get(mastered.itemKey) ?? 0));
  });
});
