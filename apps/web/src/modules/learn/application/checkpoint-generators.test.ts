import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import { generateCheckpoint } from "./checkpoint-generators";
import { FUNDAMENTALS_TRACK } from "./curriculum";

const ITERATIONS = 30;

function translator(locale: "en" | "pt") {
  const { t } = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } }).global;

  return (label: TermLabel) =>
    resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), label);
}

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

  it.each(["en", "pt"] as const)(
    "returns a fully resolvable explanation for every generator (%s)",
    (locale) => {
      const resolve = translator(locale);

      for (const lesson of FUNDAMENTALS_TRACK.lessons) {
        for (let i = 0; i < ITERATIONS; i++) {
          for (const question of generateCheckpoint(lesson.id, lesson.context)) {
            const text = resolve(question.explanation);

            expect(text.length).toBeGreaterThan(10);
            // chave não encontrada, parâmetro sem valor ("{x}") ou rótulo de termo sem tradução
            expect(text).not.toMatch(/learn\.explanations|terms\.|[{}]/);
          }
        }
      }
    },
  );

  it("builds the explanation from the real domain data (degree counting and triad quality)", () => {
    const resolve = translator("pt");
    const major = FUNDAMENTALS_TRACK.lessons[0];
    const triads = FUNDAMENTALS_TRACK.lessons[1];

    const degreeText = new Set<string>();
    for (let i = 0; i < 40; i++) {
      degreeText.add(resolve(generateCheckpoint(major.id, major.context)[0].explanation));
    }
    expect([...degreeText].every((text) => text.includes("C(1) D(2) E(3) F(4) G(5) A(6) B(7)"))).toBe(true);

    const qualityText = new Set<string>();
    for (let i = 0; i < 60; i++) {
      qualityText.add(resolve(generateCheckpoint(triads.id, triads.context)[1].explanation));
    }
    expect(
      [...qualityText].some((text) =>
        text.includes("D – F – A: terça menor (3 semitons) + quinta justa (7 semitons) → qualidade: Menor"),
      ),
    ).toBe(true);
    expect([...qualityText].some((text) => text.includes("B – D – F: terça menor (3 semitons) + quinta diminuta"))).toBe(true);
  });
});
