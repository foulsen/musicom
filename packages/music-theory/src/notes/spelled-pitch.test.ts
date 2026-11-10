import { describe, expect, it } from "vitest";

import { SpelledPitch } from "./spelled-pitch";

describe("SpelledPitch", () => {
  it("round-trips parse and toString", () => {
    for (const text of ["C4", "F#5", "Bb3", "Ebb2", "G##4", "A0"]) {
      expect(SpelledPitch.parse(text).toString()).toBe(text);
    }
  });

  it("rejects invalid text", () => {
    expect(() => SpelledPitch.parse("H4")).toThrow();
    expect(() => SpelledPitch.parse("C")).toThrow();
    expect(() => SpelledPitch.parse("c4")).toThrow();
  });

  it("maps C4 to MIDI 60 and Cb4 to 59", () => {
    expect(SpelledPitch.parse("C4").midi()).toBe(60);
    expect(SpelledPitch.parse("Cb4").midi()).toBe(59);
    expect(SpelledPitch.parse("A4").midi()).toBe(69);
  });

  it("sounds B#3 as C4", () => {
    const sounding = SpelledPitch.parse("B#3").pitch();

    expect(sounding.toString()).toBe("C4");
    expect(sounding.midi()).toBe(60);
  });

  it("round-trips the diatonic index", () => {
    const pitch = SpelledPitch.parse("F#5");

    expect(SpelledPitch.parse("C4").diatonicIndex()).toBe(28);
    expect(SpelledPitch.fromDiatonicIndex(pitch.diatonicIndex(), 1).equals(pitch)).toBe(true);
    expect(SpelledPitch.fromDiatonicIndex(-1).toString()).toBe("B-1");
  });

  it("changes the accidental without touching letter and octave", () => {
    expect(SpelledPitch.parse("E4").withAccidental(-1).toString()).toBe("Eb4");
  });
});
