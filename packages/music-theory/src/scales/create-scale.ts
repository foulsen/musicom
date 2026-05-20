import { Note } from "../notes/note";

import { Scale } from "./scale";
import { ScalePattern } from "./scale-pattern";

export function createScale(root: Note, pattern: ScalePattern) {
  return new Scale(root, pattern);
}
