import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import {
  Clef,
  KeySignature,
  SpelledNote,
  isMeasureComplete,
  measureAccidentalMarks,
  type Letter,
  type Passage,
} from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import type { CheckpointQuestion } from "./checkpoint-kit";
import { READING_PITCH_GENERATORS } from "./reading-pitch-checkpoints";
import { READING_PITCH_LESSONS } from "./reading-pitch-lessons";

const RUNS = 30;
const CONTEXT = { root: "C", pattern: "Major" } as const;

const LESSON_IDS = Object.keys(READING_PITCH_GENERATORS);
const GENERATOR_CASES = LESSON_IDS.flatMap((lessonId) =>
  READING_PITCH_GENERATORS[lessonId].map((generate, index) => ({ lessonId, index, generate })),
);

function translator(locale: "en" | "pt") {
  const { t } = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } }).global;

  return (label: TermLabel) =>
    resolveLabel((key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)), label);
}

function runGenerator(generate: (typeof GENERATOR_CASES)[number]["generate"], times = RUNS): CheckpointQuestion[] {
  return Array.from({ length: times }, () => generate(CONTEXT));
}

function singlePitch(question: CheckpointQuestion) {
  const event = question.staff?.measures[0].events[0];
  if (!event || event.kind !== "note") throw new Error("question has no note on its staff");

  return event.pitches[0];
}

/** "F#" -> SpelledNote */
function parseTonic(text: string): SpelledNote {
  return new SpelledNote(text[0] as Letter, text.length === 1 ? 0 : text[1] === "#" ? text.length - 1 : -(text.length - 1));
}

function lastEvent(passage: Passage) {
  const measureIndex = passage.measures.length - 1;
  const measure = passage.measures[measureIndex];

  return { measure, eventIndex: measure.events.length - 1 };
}

describe("reading pitch checkpoint pools", () => {
  it("covers the five pitch lessons with 3+ generators each", () => {
    expect(LESSON_IDS).toEqual(Object.keys(READING_PITCH_LESSONS));
    LESSON_IDS.forEach((id) => expect(READING_PITCH_GENERATORS[id].length).toBeGreaterThanOrEqual(3));
  });

  it.each(GENERATOR_CASES)("builds valid questions ($lessonId #$index)", ({ generate }) => {
    for (const question of runGenerator(generate)) {
      const ids = question.options.map((option) => option.id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(3);
      expect(ids).toContain(question.correctId);

      // pautas: compassos completos (ou só clave e armadura, sem notas)
      question.staff?.measures.forEach((measure) => {
        expect(measure.events.length === 0 || isMeasureComplete(measure, question.staff!.time)).toBe(true);
      });
    }
  });

  it.each(["en", "pt"] as const)("resolves prompts, options and explanations to plain text (%s)", (locale) => {
    const resolve = translator(locale);
    const leaked = /learn\.|terms\.|common\.|[{}|]/;

    for (const { lessonId, generate } of GENERATOR_CASES) {
      for (const question of runGenerator(generate, 10)) {
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

describe("reading-staff answers", () => {
  const [nameNote, lineOrSpace, stepOrSkip] = READING_PITCH_GENERATORS["reading-staff"];

  it("names the treble-clef note at the drawn position", () => {
    for (const question of runGenerator(nameNote)) {
      const pitch = singlePitch(question);
      const position = Clef.TREBLE.staffPosition(pitch);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThanOrEqual(8);
      expect(question.correctId).toBe(pitch.spelled.letter);
    }
  });

  it("tells lines from spaces by counting from the bottom", () => {
    for (const question of runGenerator(lineOrSpace)) {
      const position = Clef.TREBLE.staffPosition(singlePitch(question));
      const expected = Clef.TREBLE.isLine(position) ? `line-${position / 2 + 1}` : `space-${(position + 1) / 2}`;

      expect(question.correctId).toBe(expected);
    }
  });

  it("classifies the motion between two notes by their distance in positions", () => {
    const kinds = new Set<string>();

    for (const question of runGenerator(stepOrSkip, 90)) {
      const [first, second] = question.staff!.measures[0].events.map((event) =>
        event.kind === "note" ? Clef.TREBLE.staffPosition(event.pitches[0]) : NaN,
      );
      const distance = Math.abs(first - second);

      expect(question.correctId).toBe(distance === 1 ? "step" : distance === 2 ? "skip" : "leap");
      kinds.add(question.correctId);
    }

    expect(kinds).toEqual(new Set(["step", "skip", "leap"]));
  });
});

describe("reading-ledger-lines answers", () => {
  const [nameLedger, countLedger, whichOctave] = READING_PITCH_GENERATORS["reading-ledger-lines"];

  it("names notes outside the treble staff", () => {
    for (const question of runGenerator(nameLedger)) {
      const pitch = singlePitch(question);
      const position = Clef.TREBLE.staffPosition(pitch);

      expect(position < 0 || position > 8).toBe(true);
      expect(question.correctId).toBe(pitch.spelled.letter);
    }
  });

  it("counts ledger lines with the clef rule", () => {
    for (const question of runGenerator(countLedger)) {
      const position = Clef.TREBLE.staffPosition(singlePitch(question));

      expect(question.correctId).toBe(String(Clef.TREBLE.ledgerLineCount(position)));
    }
  });

  it("answers with the drawn letter and octave", () => {
    for (const question of runGenerator(whichOctave)) {
      expect(question.correctId).toBe(singlePitch(question).toString());
      expect(question.options.map((option) => option.id)).toHaveLength(4);
    }
  });
});

describe("reading-bass-clef answers", () => {
  const [nameBass, nameBassLedger, sameSpot] = READING_PITCH_GENERATORS["reading-bass-clef"];

  it("reads bass-clef notes on and just outside the staff", () => {
    for (const question of runGenerator(nameBass)) {
      const pitch = singlePitch(question);

      expect(question.staff?.clef.name).toBe("bass");
      expect(Clef.BASS.staffPosition(pitch)).toBeGreaterThanOrEqual(-1);
      expect(Clef.BASS.staffPosition(pitch)).toBeLessThanOrEqual(9);
      expect(question.correctId).toBe(pitch.spelled.letter);
    }
  });

  it("reads bass-clef ledger-line notes", () => {
    for (const question of runGenerator(nameBassLedger)) {
      const pitch = singlePitch(question);
      const position = Clef.BASS.staffPosition(pitch);

      expect(question.staff?.clef.name).toBe("bass");
      expect(position < 0 || position > 8).toBe(true);
      expect(question.correctId).toBe(pitch.spelled.letter);
    }
  });

  it("answers with the bass-clef note at the position drawn on the treble staff", () => {
    for (const question of runGenerator(sameSpot)) {
      const position = Clef.TREBLE.staffPosition(singlePitch(question));

      expect(question.staff?.clef.name).toBe("treble");
      expect(question.correctId).toBe(Clef.BASS.pitchAt(position).spelled.letter);
    }
  });
});

describe("reading-accidentals answers", () => {
  const [nameAccidental, measureRule, enharmonic] = READING_PITCH_GENERATORS["reading-accidentals"];

  it("names the drawn note with its accidental", () => {
    for (const question of runGenerator(nameAccidental)) {
      const pitch = singlePitch(question);
      const [mark] = measureAccidentalMarks(question.staff!.measures[0], question.staff!.key)[0];

      expect(mark).not.toBeNull();
      expect(question.correctId).toBe(pitch.spelled.toString());
    }
  });

  it("leaves the last note without a sign and answers with the sounding accidental", () => {
    const prompts = new Set<string>();

    for (const question of runGenerator(measureRule, 60)) {
      const passage = question.staff!;
      const { measure, eventIndex } = lastEvent(passage);
      const marks = measureAccidentalMarks(measure, passage.key);
      const event = measure.events[eventIndex];
      const first = passage.measures[0].events[0];

      if (event.kind !== "note" || first.kind !== "note") throw new Error("expected notes");

      expect(marks[eventIndex][0]).toBeNull();
      expect(question.correctId).toBe(event.pitches[0].spelled.toString());

      // no mesmo compasso o acidente continua; no seguinte volta ao natural da armadura
      const sameMeasure = passage.measures.length === 1;
      expect(event.pitches[0].spelled.accidental).toBe(sameMeasure ? first.pitches[0].spelled.accidental : 0);
      prompts.add(question.promptKey);
    }

    expect(prompts.size).toBe(2);
  });

  it("answers with the other spelling of the same key", () => {
    for (const question of runGenerator(enharmonic)) {
      const shown = singlePitch(question).spelled;
      const answer = parseTonic(question.correctId);

      expect(answer.pitchClass()).toBe(shown.pitchClass());
      expect(answer.letter).not.toBe(shown.letter);
    }
  });
});

describe("reading-key-signatures answers", () => {
  const [majorKey, minorKey, countQuestion, noteInKey] = READING_PITCH_GENERATORS["reading-key-signatures"];

  it("agrees with KeySignature for major and minor tonics", () => {
    for (const question of runGenerator(majorKey)) {
      const key = question.staff!.key;

      expect(question.staff!.measures[0].events).toHaveLength(0);
      expect(KeySignature.forMajor(parseTonic(question.correctId)).fifths).toBe(key.fifths);
    }

    for (const question of runGenerator(minorKey)) {
      const key = question.staff!.key;

      expect(KeySignature.forMinor(parseTonic(question.correctId)).fifths).toBe(key.fifths);
    }
  });

  it("counts the sharps or flats of the asked major key", () => {
    for (const question of runGenerator(countQuestion)) {
      const key = KeySignature.forMajor(parseTonic(String(question.promptParams?.key)));

      expect(question.correctId).toBe(String(key.accidentals().length));
      expect(key.fifths).not.toBe(0);
    }
  });

  it("answers with the key-signature accidental of the drawn plain note", () => {
    for (const question of runGenerator(noteInKey)) {
      const passage = question.staff!;
      const pitch = singlePitch(question);
      const [mark] = measureAccidentalMarks(passage.measures[0], passage.key)[0];

      expect(mark).toBeNull();
      expect(pitch.spelled.accidental).toBe(passage.key.accidentalFor(pitch.spelled.letter));
      expect(pitch.spelled.accidental).not.toBe(0);
      expect(question.correctId).toBe(pitch.spelled.toString());
    }
  });
});

describe("reading pitch lessons", () => {
  const lessons = Object.values(READING_PITCH_LESSONS);

  it("follows the track table: ids, prerequisites and practice", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      "reading-staff",
      "reading-ledger-lines",
      "reading-bass-clef",
      "reading-accidentals",
      "reading-key-signatures",
    ]);
    expect(lessons.map((lesson) => lesson.prerequisiteId)).toEqual([
      undefined,
      "reading-note-values",
      "reading-time-signatures",
      "reading-bass-clef",
      "reading-dots-ties",
    ]);
    lessons.forEach((lesson) => {
      expect(lesson.context).toEqual({ root: "C", pattern: "Major" });
      expect(lesson.steps.map((step) => step.kind)).toEqual(["concept", "concept", "concept", "checkpoint"]);
      expect(lesson.practice?.length).toBeGreaterThan(0);
    });
  });

  it.each(["en", "pt"] as const)("has every referenced i18n key in %s", (locale) => {
    const { te } = createI18n({ legacy: false, locale, messages: { en, pt } }).global;
    const missing: string[] = [];
    const check = (key: string | undefined) => {
      if (key && !te(key, locale)) missing.push(key);
    };

    for (const lesson of lessons) {
      check(lesson.titleKey);
      check(lesson.summaryKey);

      for (const step of lesson.steps) {
        if (step.kind !== "concept") continue;

        check(step.titleKey);
        check(step.bodyKey);
        step.staves?.forEach((example) => check(example.captionKey));
      }
    }

    expect(missing).toEqual([]);
  });

  it("draws every staff with complete measures", () => {
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (step.kind !== "concept") continue;

        step.staves?.forEach((example) => {
          example.passage.measures.forEach((measure) => {
            expect(measure.events.length === 0 || isMeasureComplete(measure, example.passage.time)).toBe(true);
          });
        });
      }
    }
  });
});
