import { describe, expect, it } from "vitest";

import { ScalePattern } from "./scale-pattern";
import * as scalePatterns from "./scale-patterns";
import { scalePatternSteps } from "./scale-steps";

const { HARMONIC_MINOR_SCALE_PATTERN, LOCRIAN_SCALE_PATTERN, MAJOR_SCALE_PATTERN } = scalePatterns;

const ALL_PATTERNS = Object.values(scalePatterns).filter(
  (value): value is ScalePattern => value instanceof ScalePattern,
);

describe("scalePatternSteps", () => {
  it("returns the step sizes in semitones", () => {
    expect(scalePatternSteps(MAJOR_SCALE_PATTERN)).toEqual([2, 2, 1, 2, 2, 2, 1]);
    expect(scalePatternSteps(HARMONIC_MINOR_SCALE_PATTERN)).toEqual([2, 1, 2, 2, 1, 3, 1]);
    expect(scalePatternSteps(LOCRIAN_SCALE_PATTERN)).toEqual([1, 2, 2, 1, 2, 2, 2]);
  });

  it("closes the octave and agrees with the degree semitones for every pattern", () => {
    expect(ALL_PATTERNS.length).toBeGreaterThan(0);

    for (const pattern of ALL_PATTERNS) {
      const steps = scalePatternSteps(pattern);
      const accumulated = [0];
      for (const step of steps.slice(0, -1)) accumulated.push(accumulated[accumulated.length - 1] + step);

      expect(steps.reduce((a, b) => a + b, 0), pattern.name).toBe(12);
      expect(accumulated, pattern.name).toEqual(pattern.degrees.map((degree) => degree.semitones()));
    }
  });
});
