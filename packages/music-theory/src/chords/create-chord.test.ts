import { describe, expect, it } from "vitest";

import { Note } from "../notes/note";
import { SpelledNote } from "../notes/spelled-note";

import { DOMINANT_7_CHORD_PATTERN, MAJOR_CHORD_PATTERN } from "./chord-patterns";
import { createChord } from "./create-chord";

describe("createChord", () => {
  it("spells the root with a sharp when no spelling is given", () => {
    const chord = createChord(Note.from("C#"), MAJOR_CHORD_PATTERN);

    expect(chord.spelledNotes.map(String)).toEqual(["C#", "E#", "G#"]);
  });

  it("uses the given root spelling to spell the whole chord (flat roots)", () => {
    const chord = createChord(Note.from("C#"), DOMINANT_7_CHORD_PATTERN, new SpelledNote("D", -1));

    expect(chord.name).toBe("Db7");
    expect(chord.spelledNotes.map(String)).toEqual(["Db", "F", "Ab", "Cb"]);
    expect(chord.notes.map(String)).toEqual(["C#", "F", "G#", "B"]);
  });
});
