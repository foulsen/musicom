import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import { createScale, Note } from "@music-workspace/music-theory";

import { findScalePattern } from "@/modules/shared/application/scale-patterns";

import {
  CHECKPOINT_QUESTION_COUNT,
  CHECKPOINT_TONICS,
  SINGLE_DIFFERENCE_MODE_PAIRS,
  generateCheckpoint,
  promptSignature,
} from "./checkpoint-generators";
import { FUNDAMENTALS_TRACK } from "./curriculum";

const ITERATIONS = 30;

function lessonById(id: string) {
  const lesson = FUNDAMENTALS_TRACK.lessons.find((item) => item.id === id);
  if (!lesson) throw new Error(`lesson ${id} missing from curriculum`);

  return lesson;
}

/** Gera checkpoints até aparecer uma pergunta do tipo `questionId` (a ordem/seleção é aleatória). */
function findQuestion(lessonId: string, questionId: string) {
  const lesson = lessonById(lessonId);

  for (let i = 0; i < 50; i++) {
    const question = generateCheckpoint(lesson.id, lesson.context).find((item) => item.id === questionId);
    if (question) return question;
  }

  throw new Error(`no ${questionId} question generated for ${lessonId}`);
}

function translator(locale: "en" | "pt") {
  const { t } = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } }).global;

  return (label: TermLabel) =>
    resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), label);
}

describe("generateCheckpoint", () => {
  it.each(FUNDAMENTALS_TRACK.lessons)(
    "returns 5 questions with the correct answer present among distinct options ($id)",
    (lesson) => {
      for (let i = 0; i < ITERATIONS; i++) {
        const questions = generateCheckpoint(lesson.id, lesson.context);

        expect(questions).toHaveLength(CHECKPOINT_QUESTION_COUNT);

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
      const isProgressionQuestion = findQuestion(twoFiveOne.id, "is-progression");
      seenAnswers.add(isProgressionQuestion.correctId);
    }

    expect(seenAnswers).toEqual(new Set(["yes", "no"]));
  });

  it("keeps yes/no ids stable and labels them through i18n keys", () => {
    const twoFiveOne = FUNDAMENTALS_TRACK.lessons.find((lesson) => lesson.id === "two-five-one");
    if (!twoFiveOne) throw new Error("two-five-one lesson missing from curriculum");

    const isProgressionQuestion = findQuestion(twoFiveOne.id, "is-progression");

    expect(isProgressionQuestion.options.map((option) => option.id).sort()).toEqual(["no", "yes"]);
    expect(isProgressionQuestion.options.map((option) => option.label)).toContainEqual({ key: "common.yes" });
  });

  it("passes scale names in prompt params as translatable labels", () => {
    const modes = FUNDAMENTALS_TRACK.lessons.find((lesson) => lesson.id === "modes");
    if (!modes) throw new Error("modes lesson missing from curriculum");

    const modeOfMajor = findQuestion(modes.id, "mode-of-major");

    expect(modeOfMajor.promptParams?.pattern).toEqual({ key: expect.stringMatching(/^terms\.scales\./) });
  });

  it.each(["en", "pt"] as const)(
    "returns a fully resolvable explanation for every generator (%s)",
    (locale) => {
      const resolve = translator(locale);

      for (const lesson of FUNDAMENTALS_TRACK.lessons) {
        for (let i = 0; i < ITERATIONS; i++) {
          for (const question of generateCheckpoint(lesson.id, lesson.context)) {
            const prompt = resolve({ key: question.promptKey, params: question.promptParams });
            expect(prompt).not.toMatch(/learn\.checkpoints|terms\.|[{}]/);

            const text = resolve(question.explanation);

            expect(text.length).toBeGreaterThan(10);
            // chave não encontrada, parâmetro sem valor ("{x}") ou rótulo de termo sem tradução
            expect(text).not.toMatch(/learn\.explanations|terms\.|[{}]/);
          }
        }
      }
    },
  );

  it.each(FUNDAMENTALS_TRACK.lessons)("never repeats a prompt within a set ($id)", (lesson) => {
    for (let i = 0; i < 100; i++) {
      const signatures = generateCheckpoint(lesson.id, lesson.context).map(promptSignature);

      expect(new Set(signatures).size).toBe(CHECKPOINT_QUESTION_COUNT);
    }
  });

  it.each(FUNDAMENTALS_TRACK.lessons.filter((lesson) => lesson.id !== "modes"))(
    "uses one beginner-friendly major key for the whole set and varies it across attempts ($id)",
    (lesson) => {
      const seenTonics = new Set<string>();

      for (let i = 0; i < 80; i++) {
        const roots = new Set(generateCheckpoint(lesson.id, lesson.context).map((q) => q.promptParams?.root));

        expect(roots.size).toBe(1);
        const [root] = [...roots] as string[];
        expect(CHECKPOINT_TONICS).toContain(root);
        seenTonics.add(root);
      }

      expect(seenTonics.size).toBeGreaterThan(1);
    },
  );

  it("keeps every modes question on the same parent major key", () => {
    const modes = lessonById("modes");

    for (let i = 0; i < 80; i++) {
      const questions = generateCheckpoint(modes.id, modes.context);
      const parents = new Set(
        questions
          .filter((question) => question.id === "mode-of-major")
          .map((question) => question.correctId),
      );

      expect(parents.size).toBe(1);
      expect(CHECKPOINT_TONICS).toContain([...parents][0]);

      questions
        .filter((question) => question.id === "mode-at-degree")
        .forEach((question) => expect([...parents][0]).toBe(question.promptParams?.parent));
    }
  });

  it("only uses mode pairs that differ by exactly one note", () => {
    for (const root of ["C", "D", "E", "F", "G", "A"] as const) {
      for (const [mode, reference] of SINGLE_DIFFERENCE_MODE_PAIRS) {
        const a = createScale(Note.from(root), findScalePattern(mode)).notes();
        const b = createScale(Note.from(root), findScalePattern(reference)).notes();

        expect(a.filter((note, index) => !note.equals(b[index]))).toHaveLength(1);
      }
    }
  });

  it("builds the explanation from the real domain data (degree counting and triad quality)", () => {
    const resolve = translator("pt");

    for (let i = 0; i < 40; i++) {
      const degreeName = findQuestion("major-scale", "degree-name");
      const root = String(degreeName.promptParams?.root);
      const text = resolve(degreeName.explanation);

      const spelled = createScale(Note.from(root as never), findScalePattern("Major"))
        .degrees()
        .map((item) => `${item.spelled}(${item.degree})`)
        .join(" ");
      expect(text).toContain(spelled);
    }

    const expectedByQuality: Record<string, string> = {
      Major: "terça maior (4 semitons) + quinta justa (7 semitons) → qualidade: Maior",
      Minor: "terça menor (3 semitons) + quinta justa (7 semitons) → qualidade: Menor",
      Diminished: "terça menor (3 semitons) + quinta diminuta (6 semitons) → qualidade: Diminuto",
    };
    const seenQualities = new Set<string>();

    for (let i = 0; i < 60; i++) {
      const triadQuality = findQuestion("triads", "triad-quality");

      expect(resolve(triadQuality.explanation)).toContain(expectedByQuality[triadQuality.correctId]);
      seenQualities.add(triadQuality.correctId);
    }

    expect(seenQualities).toEqual(new Set(["Major", "Minor", "Diminished"]));
  });
});
