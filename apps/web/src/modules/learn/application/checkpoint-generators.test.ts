import { describe, expect, it } from "vitest";

import { generateCheckpoint } from "./checkpoint-generators";
import { FUNDAMENTALS_TRACK } from "./curriculum";

const ITERATIONS = 30;

describe("generateCheckpoint", () => {
  it.each(FUNDAMENTALS_TRACK.lessons)(
    "returns 2 questions with the correct answer present among distinct options ($id)",
    (lesson) => {
      for (let i = 0; i < ITERATIONS; i++) {
        const questions = generateCheckpoint(lesson.id, lesson.context);

        expect(questions).toHaveLength(2);

        questions.forEach((question) => {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
          expect(question.options.some((option) => option.id === question.correctId)).toBe(true);
        });
      }
    },
  );

  it("returns no questions for a lesson id with no generator registered", () => {
    expect(generateCheckpoint("not-a-real-lesson", { root: "C", pattern: "Major" })).toEqual([]);
  });

  it("exercises both branches of the ii-V-I recognition question without crashing", () => {
    const twoFiveOne = FUNDAMENTALS_TRACK.lessons.find((lesson) => lesson.id === "two-five-one");
    if (!twoFiveOne) throw new Error("two-five-one lesson missing from curriculum");

    const seenAnswers = new Set<string>();

    for (let i = 0; i < 60; i++) {
      const [, isProgressionQuestion] = generateCheckpoint(twoFiveOne.id, twoFiveOne.context);
      seenAnswers.add(isProgressionQuestion.correctId);
    }

    expect(seenAnswers).toEqual(new Set(["yes", "no"]));
  });

  it("keeps yes/no ids stable and labels them through i18n keys", () => {
    const twoFiveOne = FUNDAMENTALS_TRACK.lessons.find((lesson) => lesson.id === "two-five-one");
    if (!twoFiveOne) throw new Error("two-five-one lesson missing from curriculum");

    const [, isProgressionQuestion] = generateCheckpoint(twoFiveOne.id, twoFiveOne.context);

    expect(isProgressionQuestion.options.map((option) => option.id).sort()).toEqual(["no", "yes"]);
    expect(isProgressionQuestion.options.map((option) => option.label)).toContainEqual({ key: "common.yes" });
  });

  it("passes scale names in prompt params as translatable labels", () => {
    const modes = FUNDAMENTALS_TRACK.lessons.find((lesson) => lesson.id === "modes");
    if (!modes) throw new Error("modes lesson missing from curriculum");

    const [modeOfMajor] = generateCheckpoint(modes.id, modes.context);

    expect(modeOfMajor.promptParams?.pattern).toEqual({ key: "terms.scales.dorian" });
  });
});
