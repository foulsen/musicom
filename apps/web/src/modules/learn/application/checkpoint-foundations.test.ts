import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { Note, SEVENTH_FAMILY, createChord, type SingleNote } from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";
import { chordQualityLabel, intervalLabel, resolveLabel, type TermLabel } from "@/modules/shared/application/music-terms";

import { CHECKPOINT_QUESTION_COUNT, generateCheckpoint, promptSignature } from "./checkpoint-generators";
import { FUNDAMENTALS_TRACK } from "./curriculum";
import { spellIntervalAbove } from "./interval-notes";

const ITERATIONS = 40;

function lessonById(id: string) {
  const lesson = FUNDAMENTALS_TRACK.lessons.find((item) => item.id === id);
  if (!lesson) throw new Error(`lesson ${id} missing from curriculum`);

  return lesson;
}

/** Gera checkpoints até aparecer uma pergunta do tipo `questionId` (a seleção é aleatória). */
function findQuestion(lessonId: string, questionId: string) {
  const lesson = lessonById(lessonId);

  for (let i = 0; i < 80; i++) {
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

describe("every lesson's checkpoint pool", () => {
  it.each(FUNDAMENTALS_TRACK.lessons)("produces 5 distinct questions on 3+ question types ($id)", (lesson) => {
    const kinds = new Set<string>();

    for (let i = 0; i < ITERATIONS; i++) {
      const questions = generateCheckpoint(lesson.id, lesson.context);

      expect(questions).toHaveLength(CHECKPOINT_QUESTION_COUNT);
      expect(new Set(questions.map(promptSignature)).size).toBe(CHECKPOINT_QUESTION_COUNT);
      questions.forEach((question) => kinds.add(question.id));
    }

    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });

  it.each(["en", "pt"] as const)(
    "resolves prompt, options and explanation to plain text with no raw keys or placeholders (%s)",
    (locale) => {
      const resolve = translator(locale);
      const leaked = /learn\.|terms\.|common\.|[{}]/;

      for (const lesson of FUNDAMENTALS_TRACK.lessons) {
        for (let i = 0; i < ITERATIONS; i++) {
          for (const question of generateCheckpoint(lesson.id, lesson.context)) {
            const where = `${lesson.id}/${question.id}`;

            expect(resolve({ key: question.promptKey, params: question.promptParams }), where).not.toMatch(leaked);
            expect(resolve(question.explanation), where).not.toMatch(leaked);
            question.options.forEach((option) => {
              expect(resolve(option.label), where).not.toMatch(leaked);
              expect(resolve(option.label).length, where).toBeGreaterThan(0);
            });
          }
        }
      }
    },
  );
});

describe("notes lesson", () => {
  const naturals = ["C", "D", "E", "F", "G", "A", "B"];

  it("answers the semitone-neighbour question with the real chromatic neighbour", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("notes", "note-by-semitones");
      const base = Note.from(String(question.promptParams?.note) as SingleNote);
      const distance = (question.promptParams?.distance as { count: number }).count;
      const direction = question.promptKey.endsWith("noteAbove") ? 1 : -1;

      expect(naturals).toContain(base.value);
      expect(question.correctId).toBe(base.transpose(direction * distance).value);
    }
  });

  it("labels black keys with both of their names and naturals with just the letter", () => {
    const labels = new Set<string>();

    for (let i = 0; i < 100; i++) {
      findQuestion("notes", "note-by-semitones").options.forEach((option) => labels.add(String(option.label)));
    }

    expect(labels).toContain("C#/Db");
    expect(labels).toContain("A#/Bb");
    expect(labels).toContain("C");
    expect(labels).not.toContain("C#");
  });

  it("counts the semitones upward between two natural notes", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("notes", "semitones-between");
      const from = Note.from(String(question.promptParams?.from) as SingleNote);
      const to = Note.from(String(question.promptParams?.to) as SingleNote);

      expect(question.correctId).toBe(String(from.distanceTo(to)));
    }
  });

  it("knows E-F and B-C are semitones while every other neighbouring pair is a tone", () => {
    const answers = new Map<string, string>();

    for (let i = 0; i < 150; i++) {
      const question = findQuestion("notes", "tone-or-semitone");
      answers.set(`${question.promptParams?.from}${question.promptParams?.to}`, question.correctId);
    }

    expect(answers.get("EF")).toBe("semitone");
    expect(answers.get("BC")).toBe("semitone");
    ["CD", "DE", "FG", "GA", "AB"].forEach((pair) => expect(answers.get(pair)).toBe("tone"));
  });

  it("answers an enharmonic question with the other spelling of the same black key", () => {
    const pairs: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };

    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("notes", "enharmonic");
      const prompted = String(question.promptParams?.note);
      const expected = pairs[prompted] ?? Object.keys(pairs).find((sharp) => pairs[sharp] === prompted);

      expect(question.correctId).toBe(expected);
    }
  });
});

describe("intervals lesson", () => {
  it("spells the upper note by letter: a major third above E is G#, never Ab", () => {
    expect(spellIntervalAbove("E", 4).toString()).toBe("G#");
    expect(spellIntervalAbove("C", 3).toString()).toBe("Eb");
    expect(spellIntervalAbove("G", 1).toString()).toBe("Ab");
    expect(spellIntervalAbove("F", 5).toString()).toBe("Bb");
    expect(spellIntervalAbove("D", 7).toString()).toBe("A");
    expect(spellIntervalAbove("A", 12).toString()).toBe("A");
  });

  it("names the interval between two notes by its size", () => {
    const resolve = translator("en");
    const sizeByName: Record<string, number> = {
      "minor second": 1,
      "major second": 2,
      "minor third": 3,
      "major third": 4,
      "perfect fourth": 5,
      "perfect fifth": 7,
    };

    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("intervals", "interval-between");
      const from = String(question.promptParams?.from) as SingleNote;
      const to = String(question.promptParams?.to);

      expect(spellIntervalAbove(from, sizeByName[question.correctId]).toString()).toBe(to);
      expect(resolve(question.explanation)).toContain(`From ${from} to ${to}:`);
    }
  });

  it("matches interval names and semitone counts in both directions", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const byName = findQuestion("intervals", "interval-semitones");
      expect(byName.promptParams?.interval).toEqual(intervalLabel(Number(byName.correctId)));

      const bySize = findQuestion("intervals", "interval-name");
      const semitones = (bySize.promptParams?.semitones as { count: number }).count;
      expect(bySize.options.find((option) => option.id === bySize.correctId)?.label).toEqual(intervalLabel(semitones));
    }
  });

  it("asks for the note above a root with distinct, correctly spelled options", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("intervals", "note-above-interval");
      const root = String(question.promptParams?.root) as SingleNote;
      const ids = question.options.map((option) => option.id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(question.correctId);
      expect(ids.filter((id) => id !== question.correctId).every((id) => id !== root)).toBe(true);
    }
  });
});

describe("seventh chords lesson", () => {
  const readable = /Cb|Fb|E#|B#|##|bb/;

  it("lists the notes of each seventh chord straight from the domain, with readable spelling", () => {
    const seen = new Set<string>();

    for (let i = 0; i < 150; i++) {
      const question = findQuestion("seventh-chords", "seventh-notes");
      const symbol = String(question.promptParams?.chord);
      seen.add(symbol);

      const root = symbol.match(/^[A-G]#?/)?.[0] as SingleNote;
      const pattern = SEVENTH_FAMILY.patterns.find((item) => item.name === question.correctId)!;
      const expected = createChord(Note.from(root), pattern)
        .spelledNotes.map((note) => note.toString())
        .join(" – ");

      expect(question.options).toHaveLength(4);
      expect(question.options.find((option) => option.id === question.correctId)?.label).toBe(expected);
      question.options.forEach((option) => expect(String(option.label)).not.toMatch(readable));
    }

    expect(seen).toContain("Cmaj7");
    expect(seen).toContain("Cm7b5");
    // F fica de fora: Fm7b5 teria um Cb
    expect([...seen].some((symbol) => symbol.startsWith("F"))).toBe(false);
  });

  it("maps each chord symbol to its quality", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("seventh-chords", "seventh-quality");
      const root = String(question.promptParams?.chord).match(/^[A-G]#?/)?.[0] as SingleNote;
      const pattern = SEVENTH_FAMILY.patterns.find((item) => item.name === question.correctId)!;

      expect(question.promptParams?.chord).toBe(createChord(Note.from(root), pattern).name);
      expect(question.options.find((option) => option.id === question.correctId)?.label).toEqual(chordQualityLabel(pattern.name));
    }
  });

  it("maps each quality and root to the right chord symbol", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("seventh-chords", "seventh-symbol");
      const root = String(question.promptParams?.root) as SingleNote;
      const pattern = SEVENTH_FAMILY.patterns.find(
        (item) => JSON.stringify(chordQualityLabel(item.name)) === JSON.stringify(question.promptParams?.quality),
      )!;

      expect(question.correctId).toBe(createChord(Note.from(root), pattern).name);
    }
  });
});

describe("natural minor lesson", () => {
  it("finds the relative minor on the 6th degree and the relative major on the 3rd", () => {
    const expectedMinor: Record<string, string> = { C: "A", G: "E", D: "B", F: "D", A: "F#", E: "C#" };
    const expectedMajor: Record<string, string> = { C: "Eb", G: "Bb", D: "F", F: "Ab", A: "C", E: "G" };

    for (let i = 0; i < ITERATIONS; i++) {
      const minor = findQuestion("natural-minor", "relative-minor");
      expect(minor.correctId).toBe(expectedMinor[String(minor.promptParams?.root)]);

      const major = findQuestion("natural-minor", "relative-major");
      expect(major.correctId).toBe(expectedMajor[String(major.promptParams?.root)]);
    }
  });

  it("derives the lowered degrees of natural minor by comparing the two scales", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("natural-minor", "lowered-degrees");

      expect(question.correctId).toBe("3-6-7");
      expect(question.options.map((option) => option.id)).toContain("3-6-7");
    }
  });

  it("keeps the lookalike scales on the same tonic as the right answer", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = findQuestion("natural-minor", "minor-scale-notes");
      const root = String(question.promptParams?.root);

      expect(question.correctId).toBe("Natural Minor");
      question.options.forEach((option) => expect(String(option.label).startsWith(root)).toBe(true));
    }
  });
});
