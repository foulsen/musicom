import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { Note } from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";

import { notePath } from "./note-path";

describe("notePath", () => {
  it("is just the open string on fret 0", () => {
    expect(notePath(Note.from("E"), 0)).toEqual({ openNote: "E", fret: 0, path: ["E"] });
  });

  it("walks the chromatic scale one semitone per fret", () => {
    expect(notePath(Note.from("E"), 3).path).toEqual(["E", "F", "F#", "G"]);
  });

  it("wraps around the octave", () => {
    const { path } = notePath(Note.from("A"), 5);

    expect(path).toEqual(["A", "A#", "B", "C", "C#", "D"]);
    expect(notePath(Note.from("B"), 12).path.at(-1)).toBe("B");
  });
});

describe("note ID explanation messages", () => {
  function render(locale: "pt" | "en", fret: number) {
    const { t } = createI18n({ legacy: false, locale, messages: { pt, en } }).global;
    const { openNote, path } = notePath(Note.from("E"), fret);
    const joined = path.join(" → ");

    return fret === 0
      ? t("drills.noteId.explanationOpen", { string: openNote, note: joined })
      : t("drills.noteId.explanation", { string: openNote, path: joined, count: fret }, fret);
  }

  it("reads the open string plus the fret count and the chromatic path", () => {
    expect(render("pt", 3)).toBe("Corda E solta + 3 casas: E → F → F# → G");
    expect(render("en", 3)).toBe("Open E string + 3 frets: E → F → F# → G");
  });

  it("uses the singular for one fret and drops the count for the open string", () => {
    expect(render("pt", 1)).toBe("Corda E solta + 1 casa: E → F");
    expect(render("en", 1)).toBe("Open E string + 1 fret: E → F");
    expect(render("pt", 0)).toBe("Corda E solta: E");
  });
});
