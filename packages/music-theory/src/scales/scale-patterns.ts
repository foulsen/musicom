import { Interval } from "../intervals/interval";

import { ScalePattern } from "./scale-pattern";

export const MAJOR_SCALE_PATTERN = new ScalePattern("Major", [
  Interval.wholeStep(),
  Interval.wholeStep(),
  Interval.halfStep(),
  Interval.wholeStep(),
  Interval.wholeStep(),
  Interval.wholeStep(),
  Interval.halfStep(),
]);

export const DORIAN_SCALE_PATTERN = new ScalePattern("Dorian", [
  Interval.wholeStep(),
  Interval.halfStep(),
  Interval.wholeStep(),
  Interval.wholeStep(),
  Interval.wholeStep(),
  Interval.halfStep(),
  Interval.wholeStep(),
]);
