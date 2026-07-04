import { Note } from "../notes/note";
import { Tuning } from "./tuning";

export const STANDARD_GUITAR_TUNING = new Tuning("Standard", [
  Note.from("E"),
  Note.from("A"),
  Note.from("D"),
  Note.from("G"),
  Note.from("B"),
  Note.from("E"),
]);
