import { CHORD_FAMILIES, MAJOR_SCALE_MODE_PATTERNS } from "@music-workspace/music-theory";
import { describe, expect, it } from "vitest";

import { FUNDAMENTALS_TRACK } from "./curriculum";
import { lessonForChord, lessonForMode, lessonForScale, lessonPath } from "./lesson-suggestions";

const lessonIds = FUNDAMENTALS_TRACK.lessons.map((lesson) => lesson.id);

describe("lessonForScale", () => {
  it("maps major and natural minor to their own lessons", () => {
    expect(lessonForScale("Major")).toBe("major-scale");
    expect(lessonForScale("Natural Minor")).toBe("natural-minor");
  });

  it("maps Ionian/Aeolian to the same lessons as major/natural minor", () => {
    expect(lessonForScale("Ionian")).toBe("major-scale");
    expect(lessonForScale("Aeolian")).toBe("natural-minor");
  });

  it("maps the other modes to the modes lesson", () => {
    for (const name of ["Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"]) {
      expect(lessonForScale(name)).toBe("modes");
    }
  });

  it("covers every mode pattern of the major scale", () => {
    for (const pattern of MAJOR_SCALE_MODE_PATTERNS) {
      expect(lessonForScale(pattern.name)).not.toBeNull();
    }
  });

  it("relates harmonic and melodic minor to natural minor", () => {
    expect(lessonForScale("Harmonic Minor")).toBe("natural-minor");
    expect(lessonForScale("Melodic Minor")).toBe("natural-minor");
  });

  it("returns null for scales without a lesson", () => {
    expect(lessonForScale("Blues")).toBeNull();
  });
});

describe("lessonForChord", () => {
  it("maps triads to the triads lesson and sevenths to the seventh-chords lesson", () => {
    expect(lessonForChord("Triads")).toBe("triads");
    expect(lessonForChord("Seventh")).toBe("seventh-chords");
  });

  it("maps extended and altered chords to seventh chords, add chords to triads", () => {
    expect(lessonForChord("Extended")).toBe("seventh-chords");
    expect(lessonForChord("Altered")).toBe("seventh-chords");
    expect(lessonForChord("Add")).toBe("triads");
  });

  it("covers every chord family of the explorer", () => {
    for (const family of CHORD_FAMILIES) {
      expect(lessonForChord(family.name)).not.toBeNull();
    }
  });

  it("returns null for an unknown family", () => {
    expect(lessonForChord("Quartal")).toBeNull();
  });
});

describe("lessonForMode / lessonPath", () => {
  it("always suggests the modes lesson for the mode explorer", () => {
    expect(lessonForMode()).toBe("modes");
  });

  it("only suggests lessons that exist in the curriculum", () => {
    const suggested = [
      lessonForScale("Major"),
      lessonForScale("Natural Minor"),
      lessonForScale("Dorian"),
      lessonForChord("Triads"),
      lessonForChord("Seventh"),
      lessonForMode(),
    ];

    for (const id of suggested) expect(lessonIds).toContain(id);
  });

  it("falls back to the tracks page when there is no lesson", () => {
    expect(lessonPath("triads")).toBe("/learn/triads");
    expect(lessonPath(null)).toBe("/learn");
  });
});
