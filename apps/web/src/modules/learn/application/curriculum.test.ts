import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";

import { CHECKPOINT_QUESTION_COUNT, generateCheckpoint } from "./checkpoint-generators";
import { FUNDAMENTALS_TRACK, READING_TRACK, TRACKS, type ConceptStep } from "./curriculum";

const lessons = FUNDAMENTALS_TRACK.lessons;

function conceptSteps(lesson: (typeof lessons)[number]): ConceptStep[] {
  return lesson.steps.filter((step): step is ConceptStep => step.kind === "concept");
}

describe("curriculum structure", () => {
  it("has unique lesson ids", () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
  });

  it("orders the track from the basics to modes", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      "notes",
      "intervals",
      "major-scale",
      "triads",
      "seventh-chords",
      "diatonic-field",
      "two-five-one",
      "natural-minor",
      "modes",
    ]);
  });

  it("chains prerequisites linearly and without cycles", () => {
    lessons.forEach((lesson, index) => {
      if (index === 0) {
        expect(lesson.prerequisiteId).toBeUndefined();
      } else {
        expect(lesson.prerequisiteId).toBe(lessons[index - 1].id);
      }
    });
  });

  it.each(lessons)("$id has 2-3 concept steps, then explore, then a checkpoint", (lesson) => {
    const kinds = lesson.steps.map((step) => step.kind);
    const conceptCount = conceptSteps(lesson).length;

    expect(conceptCount).toBeGreaterThanOrEqual(2);
    expect(conceptCount).toBeLessThanOrEqual(3);
    expect(kinds).toEqual([...Array(conceptCount).fill("concept"), "explore", "checkpoint"]);
  });

  it.each(lessons)("$id gives every interval viz its own semitones", (lesson) => {
    for (const step of conceptSteps(lesson)) {
      if (step.viz?.includes("interval")) expect(step.intervals?.length).toBeGreaterThan(0);
    }
  });

  it.each(lessons)("$id builds playable listen cues from its context", (lesson) => {
    for (const step of conceptSteps(lesson)) {
      for (const cue of step.listen?.(lesson.context) ?? []) {
        expect(cue.pitches.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe.each([
  ["pt", pt],
  ["en", en],
] as const)("curriculum copy (%s)", (locale, messages) => {
  const { te } = createI18n({ legacy: false, locale, messages: { [locale]: messages } }).global;

  it.each(lessons)("$id has every title, summary and concept text translated", (lesson) => {
    const keys = [lesson.titleKey, lesson.summaryKey];

    for (const step of conceptSteps(lesson)) keys.push(step.titleKey, step.bodyKey);

    for (const key of keys) expect(te(key), key).toBe(true);
  });
});

describe("tracks", () => {
  it("lists the fundamentals track, then the reading track", () => {
    expect(TRACKS.map((track) => track.id)).toEqual(["fundamentals", "reading"]);
  });

  it("has unique lesson ids across all tracks", () => {
    const ids = TRACKS.flatMap((track) => track.lessons.map((lesson) => lesson.id));

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("reading track", () => {
  const readingLessons = READING_TRACK.lessons;

  it("orders the lessons along the reading prerequisite chain", () => {
    expect(readingLessons.map((lesson) => lesson.id)).toEqual([
      "reading-staff",
      "reading-note-values",
      "reading-ledger-lines",
      "reading-time-signatures",
      "reading-bass-clef",
      "reading-accidentals",
      "reading-dots-ties",
      "reading-key-signatures",
      "reading-syncopation",
      "reading-compound-meter",
      "reading-tuplets",
      "reading-chords",
      "reading-expression",
      "reading-c-clefs",
      "reading-sight-reading",
    ]);
  });

  it("chains each prerequisite to the previous lesson of the track", () => {
    readingLessons.forEach((lesson, index) => {
      if (index === 0) {
        expect(lesson.prerequisiteId).toBeUndefined();
      } else {
        expect(lesson.prerequisiteId).toBe(readingLessons[index - 1].id);
      }
    });
  });

  it.each(readingLessons)("$id ends with a checkpoint that yields five questions", (lesson) => {
    const lastStep = lesson.steps[lesson.steps.length - 1];

    expect(lastStep.kind).toBe("checkpoint");
    expect(generateCheckpoint(lesson.id, lesson.context)).toHaveLength(CHECKPOINT_QUESTION_COUNT);
  });
});
