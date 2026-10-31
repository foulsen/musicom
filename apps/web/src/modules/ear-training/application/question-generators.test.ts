import { describe, expect, it } from "vitest";

import { generateQuestion, type QuizKind } from "./question-generators";

const KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
const ITERATIONS = 30;

describe("generateQuestion", () => {
  it.each(KINDS)("returns 4 distinct options with the correct answer present (%s)", (kind) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion(kind, "hard");

      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(4);
      expect(question.options.some((option) => option.id === question.correctId)).toBe(true);
    }
  });

  it.each(KINDS)(
    "builds strictly ascending pitches (regression: octave-wrap bug from Note+fixed-octave)",
    (kind) => {
      for (let i = 0; i < ITERATIONS; i++) {
        const question = generateQuestion(kind, "hard");
        const midis = question.pitches.map((pitch) => pitch.midi());

        for (let j = 1; j < midis.length; j++) {
          expect(midis[j]).toBeGreaterThan(midis[j - 1]);
        }
      }
    },
  );

  it("never puts both Ionian and Major (or Aeolian and Natural Minor) in the same scale question", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion("scale", "hard");
      const names = question.options.map((option) => option.id);

      expect(names).not.toContain("Ionian");
      expect(names).not.toContain("Aeolian");
    }
  });

  it.each(KINDS)("labels options with translatable terms while ids stay stable (%s)", (kind) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateQuestion(kind, "hard");

      question.options.forEach((option) => {
        expect(typeof option.label).toBe("object");
        expect(option.id).not.toBe(typeof option.label === "string" ? option.label : option.label.key);
      });
    }
  });
});
