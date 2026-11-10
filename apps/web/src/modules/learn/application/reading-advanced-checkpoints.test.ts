import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import {
  Clef,
  isMeasureComplete,
  passageAttacks,
  type NoteEvent,
  type Passage,
} from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { isGlossaryTermId } from "@/modules/shared/application/glossary";
import { resolveLabel, type LabelRef, type TermLabel } from "@/modules/shared/application/music-terms";

import { promptSignature } from "./checkpoint-generators";
import type { CheckpointQuestion } from "./checkpoint-kit";
import type { ConceptStep } from "./curriculum";
import { MAX_PRACTICE_LINKS } from "./practice";
import { READING_ADVANCED_GENERATORS } from "./reading-advanced-checkpoints";
import { READING_ADVANCED_LESSONS } from "./reading-advanced-lessons";

const RUNS = 30;

const LESSON_IDS = ["reading-chords", "reading-expression", "reading-c-clefs", "reading-sight-reading"] as const;

function questionsOf(lessonId: (typeof LESSON_IDS)[number]): CheckpointQuestion[] {
  const dummy = { root: "C", pattern: "Major" } as const;

  return Array.from({ length: RUNS }, () => READING_ADVANCED_GENERATORS[lessonId].map((generate) => generate(dummy))).flat();
}

function allQuestions(): { lessonId: string; question: CheckpointQuestion }[] {
  return LESSON_IDS.flatMap((lessonId) => questionsOf(lessonId).map((question) => ({ lessonId, question })));
}

function questionsWithId(id: string): CheckpointQuestion[] {
  return allQuestions()
    .map((item) => item.question)
    .filter((question) => question.id === id);
}

function firstNote(passage: Passage): NoteEvent {
  const event = passage.measures[0].events[0];
  if (event.kind !== "note") throw new Error("expected a note");

  return event;
}

const LETTERS = "CDEFGAB";

/** Lê a mensagem crua de um locale (sem fallback), ou `undefined` quando a chave não existe. */
function rawMessage(messages: unknown, key: string): string | undefined {
  let node: unknown = messages;

  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }

  return typeof node === "string" ? node : undefined;
}

function translator(locale: "en" | "pt") {
  // sem `fallbackLocale`: uma chave que falta em pt vaza como "learn.…" e o teste pega
  const { t } = createI18n({ legacy: false, locale, messages: { en, pt }, missingWarn: false, fallbackWarn: false }).global;

  return (label: TermLabel) =>
    resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), label);
}

function refsOf(label: TermLabel): LabelRef[] {
  if (typeof label === "string") return [];

  return [label, ...Object.values(label.params ?? {}).flatMap((value) => (typeof value === "string" || typeof value === "number" ? [] : refsOf(value)))];
}

function placeholdersOf(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
}

describe("reading-advanced checkpoint pools", () => {
  it.each(LESSON_IDS)("%s: every generator yields >= 3 distinct options with the answer among them", (lessonId) => {
    for (const question of questionsOf(lessonId)) {
      const ids = question.options.map((option) => option.id);

      expect(new Set(ids).size, question.id).toBe(ids.length);
      expect(ids.length, question.id).toBeGreaterThanOrEqual(3);
      expect(ids, question.id).toContain(question.correctId);
    }
  });

  it.each(LESSON_IDS)("%s: staves have complete measures and can be told apart", (lessonId) => {
    for (const question of questionsOf(lessonId)) {
      if (!question.staff) continue;

      question.staff.measures.forEach((measure) => {
        expect(isMeasureComplete(measure, question.staff!.time), question.id).toBe(true);
      });
    }
  });

  it.each(LESSON_IDS)("%s: each generator varies enough to fill a 5-question checkpoint", (lessonId) => {
    const dummy = { root: "C", pattern: "Major" } as const;

    for (const generate of READING_ADVANCED_GENERATORS[lessonId]) {
      const signatures = new Set(Array.from({ length: RUNS }, () => promptSignature(generate(dummy))));

      expect(signatures.size).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(["en", "pt"] as const)("resolves prompts, options and explanations without leaks or missing params (%s)", (locale) => {
    const resolve = translator(locale);
    const messages = locale === "en" ? en : pt;
    const leaked = /learn\.|terms\.|common\.|[{}]/;

    for (const { lessonId, question } of allQuestions()) {
      const where = `${lessonId}/${question.id}`;
      const prompt: LabelRef = { key: question.promptKey, params: question.promptParams };

      expect(resolve(prompt), where).not.toMatch(leaked);
      expect(resolve(question.explanation), where).not.toMatch(leaked);

      question.options.forEach((option) => {
        expect(resolve(option.label), where).not.toMatch(leaked);
        expect(resolve(option.label).length, where).toBeGreaterThan(0);
      });

      // todo `{param}` da mensagem precisa ter sido entregue pelo gerador (o vue-i18n renderiza o que falta como vazio)
      for (const ref of [prompt, question.explanation, ...question.options.flatMap((option) => refsOf(option.label))]) {
        const message = rawMessage(messages, ref.key);

        expect(message, `${where}: ${ref.key}`).toBeTypeOf("string");
        for (const name of placeholdersOf(message ?? "")) {
          expect(Object.keys(ref.params ?? {}), `${where}: {${name}} in ${ref.key}`).toContain(name);
        }
      }
    }
  });

  it("intervalOnStaff names the interval from the diatonic distance of the stacked notes", () => {
    for (const question of questionsWithId("interval-on-staff")) {
      const [low, high] = firstNote(question.staff!).pitches;

      expect(question.correctId).toBe(String(high.diatonicIndex() - low.diatonicIndex() + 1));
    }
  });

  it("triadName agrees with the stacked notes (root + quality from the semitones)", () => {
    for (const question of questionsWithId("triad-name")) {
      const [root, third, fifth] = firstNote(question.staff!).pitches;
      const thirdSize = third.midi() - root.midi();
      const fifthSize = fifth.midi() - root.midi();
      const quality = thirdSize === 3 ? (fifthSize === 6 ? "dim" : "m") : "";

      expect(question.correctId).toBe(`${root.spelled}${quality}`);
    }
  });

  it("rootOfTriad answers with the lowest note of the chord", () => {
    for (const question of questionsWithId("root-of-triad")) {
      expect(question.correctId).toBe(firstNote(question.staff!).pitches[0].spelled.toString());
    }
  });

  it("dynamic and articulation questions answer with what is written on the staff", () => {
    for (const question of questionsWithId("dynamic-meaning")) {
      expect(firstNote(question.staff!).dynamic).toBe(question.correctId);
    }

    for (const question of questionsWithId("articulation-name")) {
      expect(firstNote(question.staff!).articulations).toEqual([question.correctId]);
    }
  });

  it("tempoTerm answers with the term whose range holds the BPM", () => {
    const ranges: Record<string, [number, number]> = {
      Largo: [40, 60],
      Adagio: [66, 76],
      Andante: [76, 108],
      Moderato: [108, 120],
      Allegro: [120, 156],
      Presto: [168, 200],
    };

    for (const question of questionsWithId("tempo-term")) {
      const bpm = question.promptParams?.bpm as number;
      const [from, to] = ranges[question.correctId];

      expect(bpm).toBeGreaterThanOrEqual(from);
      expect(bpm).toBeLessThanOrEqual(to);
    }
  });

  it("C-clef note questions follow 'middle line = C' (alto) and '4th line = C' (tenor)", () => {
    const middleCPosition = { alto: 4, tenor: 6 } as const;

    for (const id of ["alto-note", "tenor-note"]) {
      for (const question of questionsWithId(id)) {
        const staff = question.staff!;
        const clefName = staff.clef.name as "alto" | "tenor";
        const position = staff.clef.staffPosition(firstNote(staff).pitches[0]);

        expect(clefName).toBe(id === "alto-note" ? "alto" : "tenor");
        expect(question.correctId).toBe(LETTERS[(((position - middleCPosition[clefName]) % 7) + 7) % 7]);
      }
    }
  });

  it("middleCLine places middle C by clef", () => {
    const expected: Record<string, string> = {
      "learn.checkpoints.readingAdvanced.options.clef.treble": "ledgerBelow",
      "learn.checkpoints.readingAdvanced.options.clef.bass": "ledgerAbove",
      "learn.checkpoints.readingAdvanced.options.clef.alto": "line3",
      "learn.checkpoints.readingAdvanced.options.clef.tenor": "line4",
    };

    for (const question of questionsWithId("middle-c-line")) {
      const clef = question.promptParams?.clef as LabelRef;

      expect(question.correctId).toBe(expected[clef.key]);
    }
  });

  it("keyAndMeter reports the key signature and time signature of the staff", () => {
    for (const question of questionsWithId("key-and-meter")) {
      const staff = question.staff!;

      expect(question.correctId).toBe(`${staff.key.fifths}|${staff.time.toString()}`);
    }
  });

  it("firstNoteName applies the key signature to the first note", () => {
    for (const question of questionsWithId("first-note-name")) {
      const staff = question.staff!;
      const first = firstNote(staff).pitches[0];

      expect(question.correctId).toBe(first.spelled.toString());
      expect(first.spelled.accidental).toBe(staff.key.accidentalFor(first.spelled.letter));
      expect(Clef.from(staff.clef.name).staffPosition(first)).toBeGreaterThanOrEqual(0);
    }
  });

  it("attackCount counts struck notes, with ties only between notes of the same pitch", () => {
    for (const question of questionsWithId("attack-count")) {
      const staff = question.staff!;
      const events = staff.measures.flatMap((measure) => measure.events);

      expect(question.correctId).toBe(String(passageAttacks(staff).length));

      events.forEach((event, index) => {
        if (event.kind !== "note" || !event.tieToNext) return;

        const following = events[index + 1];
        expect(following?.kind).toBe("note");
        if (following?.kind === "note") {
          expect(following.pitches.map(String)).toEqual(event.pitches.map(String));
        }
      });
    }
  });
});

describe("reading-advanced lessons", () => {
  const lessons = LESSON_IDS.map((id) => READING_ADVANCED_LESSONS[id]);

  it("chains from reading-tuplets and in table order", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([...LESSON_IDS]);
    expect(lessons.map((lesson) => lesson.prerequisiteId)).toEqual([
      "reading-tuplets",
      "reading-chords",
      "reading-expression",
      "reading-c-clefs",
    ]);
  });

  it.each(lessons)("$id has 3 concept steps with staves, then a checkpoint, and up to 3 practice links", (lesson) => {
    expect(lesson.steps.map((step) => step.kind)).toEqual(["concept", "concept", "concept", "checkpoint"]);
    expect(lesson.practice?.length).toBeGreaterThan(0);
    expect(lesson.practice?.length).toBeLessThanOrEqual(MAX_PRACTICE_LINKS);

    for (const step of lesson.steps.filter((item): item is ConceptStep => item.kind === "concept")) {
      expect(step.viz).toEqual(["staff"]);
      expect(step.staves?.length).toBeGreaterThan(0);

      for (const example of step.staves ?? []) {
        example.passage.measures.forEach((measure) => {
          expect(isMeasureComplete(measure, example.passage.time), `${lesson.id}/${step.titleKey}`).toBe(true);
        });
      }
    }
  });

  it.each(["en", "pt"] as const)("every key and glossary term the lessons use exists (%s)", (locale) => {
    const messages = locale === "en" ? en : pt;

    for (const lesson of lessons) {
      const keys = [
        lesson.titleKey,
        lesson.summaryKey,
        ...lesson.steps.flatMap((step) =>
          step.kind === "concept"
            ? [step.titleKey, step.bodyKey, ...(step.staves ?? []).flatMap((example) => (example.captionKey ? [example.captionKey] : []))]
            : [],
        ),
      ];

      for (const key of keys) {
        const message = rawMessage(messages, key);

        expect(message, key).toBeTypeOf("string");
        expect(message?.length, key).toBeGreaterThan(0);

        for (const match of (message ?? "").matchAll(/\[\[([A-Za-z]+)/g)) {
          expect(isGlossaryTermId(match[1]), `${key}: [[${match[1]}]]`).toBe(true);
        }
      }
    }
  });
});
