import {
  AEOLIAN_DEGREE_PATTERN,
  DORIAN_DEGREE_PATTERN,
  HARMONIC_MINOR_DEGREE_PATTERN,
  LOCRIAN_DEGREE_PATTERN,
  LYDIAN_DEGREE_PATTERN,
  MAJOR_DEGREE_PATTERN,
  MELODIC_MINOR_DEGREE_PATTERN,
  MIXOLYDIAN_DEGREE_PATTERN,
  PHRYGIAN_DEGREE_PATTERN,
} from "../intervals/degree-patterns";
import { Interval } from "../intervals/interval";

import { ScalePattern } from "./scale-pattern";

export const MAJOR_SCALE_PATTERN = new ScalePattern(
  "Major",
  [
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
  ],
  MAJOR_DEGREE_PATTERN,
);

export const DORIAN_SCALE_PATTERN = new ScalePattern(
  "Dorian",
  [
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
  ],
  DORIAN_DEGREE_PATTERN,
);

export const IONIAN_SCALE_PATTERN = new ScalePattern(
  "Ionian",
  [
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
  ],
  MAJOR_DEGREE_PATTERN,
);

export const PHRYGIAN_SCALE_PATTERN = new ScalePattern(
  "Phrygian",
  [
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
  ],
  PHRYGIAN_DEGREE_PATTERN,
);

export const LYDIAN_SCALE_PATTERN = new ScalePattern(
  "Lydian",
  [
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
  ],
  LYDIAN_DEGREE_PATTERN,
);

export const MIXOLYDIAN_SCALE_PATTERN = new ScalePattern(
  "Mixolydian",
  [
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
  ],
  MIXOLYDIAN_DEGREE_PATTERN,
);

export const AEOLIAN_SCALE_PATTERN = new ScalePattern(
  "Aeolian",
  [
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
  ],
  AEOLIAN_DEGREE_PATTERN,
);

export const LOCRIAN_SCALE_PATTERN = new ScalePattern(
  "Locrian",
  [
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
  ],
  LOCRIAN_DEGREE_PATTERN,
);

export const NATURAL_MINOR_SCALE_PATTERN = new ScalePattern(
  "Natural Minor",
  [
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
  ],
  AEOLIAN_DEGREE_PATTERN,
);

export const HARMONIC_MINOR_SCALE_PATTERN = new ScalePattern(
  "Harmonic Minor",
  [
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStepAndHalf(),
    Interval.halfStep(),
  ],
  HARMONIC_MINOR_DEGREE_PATTERN,
);

export const MELODIC_MINOR_SCALE_PATTERN = new ScalePattern(
  "Melodic Minor",
  [
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
  ],
  MELODIC_MINOR_DEGREE_PATTERN,
);
