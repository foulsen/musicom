import { isMeasureComplete, measureTicks, passageAttacks, passageTotalTicks } from "@music-workspace/music-theory";
import { describe, expect, it } from "vitest";

import { RHYTHM_LEVEL_IDS } from "./reading-types";
import { generateRhythm, RHYTHM_LEVELS, RHYTHM_MEASURES } from "./rhythm-generator";

const ITERATIONS = 50;

describe("generateRhythm", () => {
  it.each(RHYTHM_LEVEL_IDS)("builds complete measures in an allowed time signature (%s)", (levelId) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const passage = generateRhythm(levelId);

      expect(RHYTHM_LEVELS[levelId].times).toContain(passage.time.toString());
      expect(passage.measures).toHaveLength(RHYTHM_MEASURES);
      expect(passage.clef.name).toBe("treble");

      for (const measure of passage.measures) {
        expect(isMeasureComplete(measure, passage.time)).toBe(true);
        expect(measureTicks(measure)).toBe(passage.time.measureTicks());
      }
      expect(passageTotalTicks(passage)).toBe(RHYTHM_MEASURES * passage.time.measureTicks());
    }
  });

  it.each(RHYTHM_LEVEL_IDS)("starts on a note and keeps an attack in every measure (%s)", (levelId) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const passage = generateRhythm(levelId);

      expect(passage.measures[0].events[0].kind).toBe("note");

      const attackedMeasures = new Set(passageAttacks(passage).map((attack) => attack.measureIndex));
      expect(attackedMeasures.size).toBe(passage.measures.length);
    }
  });

  it("uses compound time only in the compound level", () => {
    for (const levelId of RHYTHM_LEVEL_IDS) {
      for (let i = 0; i < ITERATIONS; i++) {
        expect(generateRhythm(levelId).time.isCompound()).toBe(levelId === "compound");
      }
    }
  });

  it("terminates even with a constant random source", () => {
    for (const levelId of RHYTHM_LEVEL_IDS) {
      expect(generateRhythm(levelId, () => 0).measures).toHaveLength(RHYTHM_MEASURES);
      expect(generateRhythm(levelId, () => 0.999).measures).toHaveLength(RHYTHM_MEASURES);
    }
  });
});
