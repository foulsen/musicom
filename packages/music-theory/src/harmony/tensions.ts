import { Note } from "../notes/note";

import { Tension } from "./tension";

export function createNine(note: Note) {
  return new Tension("9", note);
}

export function createEleven(note: Note) {
  return new Tension("11", note);
}

export function createThirteen(note: Note) {
  return new Tension("13", note);
}

export function createSharpEleven(note: Note) {
  return new Tension("#11", note);
}
