import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import {
  Duration,
  TICKS_PER_QUARTER,
  TimeSignature,
  isMeasureComplete,
  measureTicks,
  passageAttacks,
  type NoteValue,
} from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { readingRhythmLessonsEn } from "@/i18n/locales/reading/lessons-rhythm.en";
import { readingRhythmLessonsPt } from "@/i18n/locales/reading/lessons-rhythm.pt";
import { pt } from "@/i18n/locales/pt";
import { isGlossaryTermId } from "@/modules/shared/application/glossary";
import { resolveLabel, type LabelRef, type TermLabel } from "@/modules/shared/application/music-terms";

import { promptSignature, type CheckpointQuestion } from "./checkpoint-generators";
import type { ConceptStep, Lesson } from "./curriculum";
import { READING_RHYTHM_GENERATORS } from "./reading-rhythm-checkpoints";
import { READING_RHYTHM_LESSONS } from "./reading-rhythm-lessons";

const RUNS = 30;

const lessonIds = Object.keys(READING_RHYTHM_GENERATORS) as (keyof typeof READING_RHYTHM_GENERATORS)[];

/** Todas as perguntas que um gerador produz em `RUNS` sorteios, com o id do gerador. */
function questionsOf(lessonId: keyof typeof READING_RHYTHM_GENERATORS): CheckpointQuestion[] {
  const ctx = READING_RHYTHM_LESSONS[lessonId].context;

  return READING_RHYTHM_GENERATORS[lessonId].flatMap((generate) => Array.from({ length: RUNS }, () => generate(ctx)));
}

function questionsById(lessonId: keyof typeof READING_RHYTHM_GENERATORS, id: string): CheckpointQuestion[] {
  return questionsOf(lessonId).filter((question) => question.id === id);
}

/** Último trecho da chave de um rótulo (`...names.eighthPlural` → `eighthPlural`). */
function labelName(label: unknown): string {
  return (label as LabelRef).key.split(".").pop() as string;
}

function valueOfName(name: string): NoteValue {
  return name.replace(/(Plural|Rest)$/, "") as NoteValue;
}

function translator(locale: "en" | "pt") {
  const i18n = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } });
  const { t } = i18n.global;

  return {
    resolve: (label: TermLabel) =>
      resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), label),
    has: (key: string) => i18n.global.te(key, locale),
  };
}

describe("reading rhythm checkpoint pools", () => {
  it.each(lessonIds)("%s: every generator yields valid options and well-formed staves", (lessonId) => {
    const generators = READING_RHYTHM_GENERATORS[lessonId];

    expect(generators.length).toBeGreaterThanOrEqual(3);

    for (const question of questionsOf(lessonId)) {
      const ids = question.options.map((option) => option.id);
      const isYesNo = question.id === "is-syncopated" || question.id === "simple-or-compound";

      expect(new Set(ids).size, question.id).toBe(ids.length);
      expect(ids.length, question.id).toBeGreaterThanOrEqual(isYesNo ? 2 : 3);
      expect(ids, question.id).toContain(question.correctId);

      if (question.staff) {
        const staff = question.staff;
        // pautas de uma nota/pausa só e o compasso incompleto de "qual figura falta" são intencionais
        const intentional = question.id === "missing-value" || staff.measures.every((measure) => measure.events.length === 1);

        if (!intentional) {
          staff.measures.forEach((measure) => expect(isMeasureComplete(measure, staff.time), `${question.id} ${staff.time}`).toBe(true));
        }
      }
    }
  });

  it.each(lessonIds)("%s: the pool offers enough distinct prompts for a 5-question checkpoint", (lessonId) => {
    const ctx = READING_RHYTHM_LESSONS[lessonId].context;
    const signatures = new Set<string>();

    for (const generate of READING_RHYTHM_GENERATORS[lessonId]) {
      // cada gerador sozinho precisa render variantes (>= 2 enunciados distintos em 30 sorteios)
      const variants = new Set(Array.from({ length: RUNS }, () => promptSignature(generate(ctx))));

      expect(variants.size).toBeGreaterThanOrEqual(2);
      variants.forEach((signature) => signatures.add(signature));
    }

    expect(signatures.size).toBeGreaterThanOrEqual(5);
  });

  it("names the value of a single note or rest", () => {
    for (const question of questionsById("reading-note-values", "value-name")) {
      const event = question.staff?.measures[0].events[0];

      expect(event?.kind).toBe("note");
      expect(event?.duration.value).toBe(question.correctId);
    }

    for (const question of questionsById("reading-note-values", "rest-name")) {
      const event = question.staff?.measures[0].events[0];

      expect(event?.kind).toBe("rest");
      expect(event?.duration.value).toBe(question.correctId);
    }
  });

  it("answers how many small values fit in a big one with the real tick ratio", () => {
    for (const question of questionsById("reading-note-values", "how-many-fit")) {
      const small = Duration.of(valueOfName(labelName((question.promptParams as Record<string, unknown>).small))).ticks();
      const big = Duration.of(valueOfName(labelName((question.promptParams as Record<string, unknown>).big))).ticks();

      expect(Number(question.correctId) * small).toBe(big);
    }
  });

  it("counts the beats of the time signature shown", () => {
    for (const question of questionsById("reading-time-signatures", "beats-per-measure")) {
      expect(Number(question.correctId)).toBe(question.staff?.time.beats);
    }
  });

  it("completes the measure with the one value that is missing", () => {
    for (const question of questionsById("reading-time-signatures", "missing-value")) {
      const staff = question.staff!;
      const remaining = staff.time.measureTicks() - measureTicks(staff.measures[0]);

      expect(Duration.of(question.correctId as NoteValue).ticks()).toBe(remaining);
    }
  });

  it("describes the time signature with its own beats and beat value", () => {
    for (const question of questionsById("reading-time-signatures", "which-time-signature")) {
      const signature = TimeSignature.parse(question.correctId);
      const params = question.promptParams as { beats: number; value: LabelRef };
      const beatTicks = TICKS_PER_QUARTER * (4 / signature.beatValue);

      expect(params.beats).toBe(signature.beats);
      expect(Duration.of(labelName(params.value) as NoteValue).ticks()).toBe(beatTicks);
    }
  });

  it("answers dotted values and tied durations with real tick counts", () => {
    for (const question of questionsById("reading-dots-ties", "dotted-value")) {
      const event = question.staff!.measures[0].events[0];
      const unit = Duration.of(valueOfName(labelName((question.promptParams as Record<string, unknown>).unit))).ticks();

      expect(event.duration.dots).toBe(1);
      expect(Number(question.correctId) * unit).toBe(event.duration.ticks());
    }

    for (const question of questionsById("reading-dots-ties", "tied-duration")) {
      const tied = passageAttacks(question.staff!).find((attack) => attack.event.tieToNext)!;
      const unit = Duration.of(valueOfName(labelName((question.promptParams as Record<string, unknown>).unit))).ticks();

      expect(Number(question.correctId) * unit).toBe(tied.durationTicks);
      expect(tied.durationTicks).toBeGreaterThan(tied.event.duration.ticks());
    }
  });

  it("counts struck notes without rests or tie continuations", () => {
    const ids = [
      ["reading-dots-ties", "attack-count"],
      ["reading-syncopation", "attack-count-rests"],
      ["reading-tuplets", "triplet-attack-count"],
    ] as const;

    for (const [lessonId, id] of ids) {
      for (const question of questionsById(lessonId, id)) {
        const events = question.staff!.measures.flatMap((measure) => measure.events);
        const struck = events.filter((event, index) => event.kind === "note" && !(events[index - 1] as { tieToNext?: boolean } | undefined)?.tieToNext);

        expect(Number(question.correctId), id).toBe(struck.length);
        expect(Number(question.correctId), id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("flags syncopation only when an off-beat note is held across the next beat", () => {
    const seen = new Set<string>();

    for (let run = 0; run < 5; run++) {
      for (const question of questionsById("reading-syncopation", "is-syncopated")) {
        const attacks = passageAttacks(question.staff!);
        const held = attacks.some((attack) => attack.tick % TICKS_PER_QUARTER !== 0 && attack.durationTicks > TICKS_PER_QUARTER / 2);

        expect(question.correctId).toBe(held ? "yes" : "no");
        seen.add(question.correctId);
      }
    }

    expect(seen).toEqual(new Set(["yes", "no"]));
  });

  it("places the asked note on the count where it starts", () => {
    for (const question of questionsById("reading-syncopation", "count-of-note")) {
      const attacks = passageAttacks(question.staff!);
      const which = labelName((question.promptParams as Record<string, unknown>).which);
      const target = which === "secondNote" ? attacks[1] : attacks[attacks.length - 1];

      expect(question.correctId).toBe(String(target.tick));
    }
  });

  it("derives pulses, meter kind and pulse value from the time signature", () => {
    for (const question of questionsById("reading-compound-meter", "pulses-in-meter")) {
      const signature = TimeSignature.parse(String((question.promptParams as Record<string, unknown>).time));

      expect(signature.isCompound()).toBe(true);
      expect(Number(question.correctId)).toBe(signature.pulsesPerMeasure());
      expect(question.staff!.measures[0].events).toHaveLength(signature.pulsesPerMeasure());
    }

    for (const question of questionsById("reading-compound-meter", "simple-or-compound")) {
      const signature = TimeSignature.parse(String((question.promptParams as Record<string, unknown>).time));

      expect(question.correctId).toBe(signature.isCompound() ? "compound" : "simple");
    }

    for (const question of questionsById("reading-compound-meter", "pulse-value")) {
      const signature = TimeSignature.parse(String((question.promptParams as Record<string, unknown>).time));

      expect(question.correctId).toBe(String(signature.pulseTicks()));
    }
  });

  it("answers triplet questions from the tuplet ratio", () => {
    for (const question of questionsById("reading-tuplets", "triplet-count")) {
      const triplets = question.staff!.measures[0].events.filter((event) => event.duration.tuplet);

      expect(triplets).toHaveLength(Number(question.correctId));
    }

    for (const question of questionsById("reading-tuplets", "triplet-fraction")) {
      const triplet = question.staff!.measures[0].events.find((event) => event.duration.tuplet)!;
      const [numerator, denominator] = question.correctId.split("/").map(Number);

      expect(triplet.duration.ticks() * denominator).toBe(TICKS_PER_QUARTER * numerator);
    }
  });
});

describe("reading rhythm lessons", () => {
  const lessons = Object.values(READING_RHYTHM_LESSONS);

  it("builds the six rhythm lessons of the reading track in order", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      "reading-note-values",
      "reading-time-signatures",
      "reading-dots-ties",
      "reading-syncopation",
      "reading-compound-meter",
      "reading-tuplets",
    ]);
    expect(lessons.map((lesson) => lesson.prerequisiteId)).toEqual([
      "reading-staff",
      "reading-ledger-lines",
      "reading-accidentals",
      "reading-key-signatures",
      "reading-syncopation",
      "reading-compound-meter",
    ]);
  });

  it.each(lessons)("$id has 3 concept steps, then a checkpoint, and suggests rhythm practice", (lesson: Lesson) => {
    expect(lesson.steps.map((step) => step.kind)).toEqual(["concept", "concept", "concept", "checkpoint"]);
    expect(lesson.context).toEqual({ root: "C", pattern: "Major" });
    expect(lesson.practice?.length).toBeGreaterThan(0);
    lesson.practice?.forEach((target) => expect(target).toMatchObject({ kind: "reading", exercise: "rhythm" }));
  });

  it.each(lessons)("$id gives every staff example a complete playable rhythm", (lesson: Lesson) => {
    const concepts = lesson.steps.filter((step): step is ConceptStep => step.kind === "concept");

    for (const step of concepts) {
      for (const example of step.staves ?? []) {
        expect(step.viz).toContain("staff");
        expect(example.playback).toEqual({ bpm: 72, click: true });
        example.passage.measures.forEach((measure) => expect(isMeasureComplete(measure, example.passage.time)).toBe(true));
        expect(passageAttacks(example.passage).length).toBeGreaterThan(0);
      }
    }
  });

  it.each(["en", "pt"] as const)("has every i18n key the lessons reference (%s)", (locale) => {
    const { has } = translator(locale);

    for (const lesson of lessons) {
      expect(has(lesson.titleKey), lesson.titleKey).toBe(true);
      expect(has(lesson.summaryKey), lesson.summaryKey).toBe(true);

      for (const step of lesson.steps) {
        if (step.kind !== "concept") continue;

        expect(has(step.titleKey), step.titleKey).toBe(true);
        expect(has(step.bodyKey), step.bodyKey).toBe(true);
        step.staves?.forEach((example) => expect(has(example.captionKey ?? ""), example.captionKey).toBe(true));
      }
    }
  });

  it("only uses known glossary terms in its markup (en and pt)", () => {
    const texts: string[] = [];
    const collect = (value: unknown) => {
      if (typeof value === "string") texts.push(value);
      else if (value && typeof value === "object") Object.values(value).forEach(collect);
    };

    collect(readingRhythmLessonsEn.lessons);
    collect(readingRhythmLessonsPt.lessons);

    const ids = texts.flatMap((text) => [...text.matchAll(/\[\[(\w+)(?::[^\]]*)?\]\]/g)].map((match) => match[1]));

    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => expect(isGlossaryTermId(id), id).toBe(true));
  });
});

describe("reading rhythm checkpoint texts", () => {
  it.each(["en", "pt"] as const)("resolve to plain text with no raw keys or placeholders (%s)", (locale) => {
    const { resolve } = translator(locale);
    const leaked = /learn\.|terms\.|common\.|[{}]/;

    for (const lessonId of lessonIds) {
      for (const question of questionsOf(lessonId)) {
        const where = `${lessonId}/${question.id}`;

        expect(resolve({ key: question.promptKey, params: question.promptParams }), where).not.toMatch(leaked);
        expect(resolve(question.explanation), where).not.toMatch(leaked);
        question.options.forEach((option) => {
          expect(resolve(option.label), where).not.toMatch(leaked);
          expect(resolve(option.label).length, where).toBeGreaterThan(0);
        });
      }
    }
  });
});
