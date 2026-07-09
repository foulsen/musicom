import { describe, expect, it } from "vitest";

import { Pitch } from "./pitch";

describe("Pitch.transpose", () => {
  it("ascends across the B->C octave boundary instead of wrapping in place", () => {
    const b4 = Pitch.from("B", 4);

    const majorSecondUp = b4.transpose(2);

    expect(majorSecondUp.note.value).toBe("C#");
    expect(majorSecondUp.octave).toBe(5);
    expect(majorSecondUp.midi()).toBeGreaterThan(b4.midi());
  });

  it("never produces a pitch below the original when transposing up, even by a full octave", () => {
    for (let semitones = 1; semitones <= 12; semitones++) {
      for (const value of ["C", "E", "G#", "B"] as const) {
        const root = Pitch.from(value, 4);
        const transposed = root.transpose(semitones);

        expect(transposed.midi()).toBe(root.midi() + semitones);
      }
    }
  });

  it("keeps the same pitch class an octave apart for a +12 semitone transpose", () => {
    const root = Pitch.from("D", 3);
    const octaveUp = root.transpose(12);

    expect(octaveUp.note.value).toBe(root.note.value);
    expect(octaveUp.octave).toBe(root.octave + 1);
  });
});
