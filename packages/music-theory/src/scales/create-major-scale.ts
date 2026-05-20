import { Interval } from "../intervals/interval";
import { Note } from "../notes/note";

import { Scale } from "./scale";

export function createMajorScale(root: Note) {
  return new Scale(root, [
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.wholeStep(),
    Interval.halfStep(),
  ]);
}
