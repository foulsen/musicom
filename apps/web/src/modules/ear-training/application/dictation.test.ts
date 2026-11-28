import { describe, expect, it } from "vitest";

import {
  DICTATION_DEGREE_IDS,
  dictationAnswerId,
  dictationLength,
  dictationVocabulary,
  degreeIdForDigit,
  generateDictation,
  gradeDictation,
} from "./dictation";
import type { Difficulty } from "./question-generators";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const RUNS = 300;

/** Gerador pseudoaleatório determinístico (mulberry32) para repetir os sorteios sem acaso entre execuções. */
function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function many(difficulty: Difficulty) {
  const random = seeded(42);

  return Array.from({ length: RUNS }, () => generateDictation(difficulty, random));
}

/** Posição na escala maior (0 = tônica, 7 = oitava) de um deslocamento em semitons a partir da tônica. */
const MAJOR_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
function scalePosition(semitones: number): number {
  const octave = Math.floor(semitones / 12);
  const degree = MAJOR_SEMITONES.indexOf(((semitones % 12) + 12) % 12);

  return octave * 7 + degree;
}

/** Tamanho (em passos de escala) de cada salto entre notas consecutivas da melodia. */
function stepSizes(question: ReturnType<typeof generateDictation>): number[] {
  const positions = question.notes.map((note) => scalePosition(note.midi() - question.tonic.midi()));

  return positions.slice(1).map((position, index) => Math.abs(position - positions[index]));
}

describe("generateDictation", () => {
  it("uses the melody length of each difficulty", () => {
    expect(dictationLength("easy")).toBe(3);
    expect(dictationLength("medium")).toBe(4);
    expect(dictationLength("hard")).toBe(5);

    for (const difficulty of DIFFICULTIES) {
      many(difficulty).forEach((question) => {
        expect(question.notes).toHaveLength(dictationLength(difficulty));
        expect(question.degreeIds).toHaveLength(dictationLength(difficulty));
      });
    }
  });

  it("keeps easy to degrees 1-5 and the others to the full major scale", () => {
    expect(dictationVocabulary("easy")).toEqual(["0", "2", "4", "5", "7"]);
    expect(dictationVocabulary("medium")).toEqual([...DICTATION_DEGREE_IDS]);
    expect(dictationVocabulary("hard")).toEqual([...DICTATION_DEGREE_IDS]);

    for (const difficulty of DIFFICULTIES) {
      const allowed = new Set(dictationVocabulary(difficulty));

      many(difficulty).forEach((question) => {
        expect(question.vocabulary).toEqual(dictationVocabulary(difficulty));
        question.degreeIds.forEach((id) => expect(allowed.has(id)).toBe(true));
      });
    }
  });

  it("derives each degree id from the note (semitones mod 12 from the tonic)", () => {
    for (const difficulty of DIFFICULTIES) {
      many(difficulty).forEach((question) => {
        const expected = question.notes.map((note) => (((note.midi() - question.tonic.midi()) % 12) + 12) % 12);

        expect(question.degreeIds).toEqual(expected.map(String));
      });
    }
  });

  it("keeps every note within the 5th below to the octave above the tonic", () => {
    for (const difficulty of DIFFICULTIES) {
      many(difficulty).forEach((question) => {
        question.notes.forEach((note) => {
          const offset = note.midi() - question.tonic.midi();

          expect(offset).toBeGreaterThanOrEqual(-5);
          expect(offset).toBeLessThanOrEqual(12);
        });
      });
    }
  });

  it("uses a tonic in octave 3 or 4 and varies it", () => {
    const questions = many("medium");
    const octaves = new Set(questions.map((question) => Math.floor(question.tonic.midi() / 12) - 1));

    questions.forEach((question) => {
      expect(question.tonic.midi()).toBeGreaterThanOrEqual(48);
      expect(question.tonic.midi()).toBeLessThanOrEqual(71);
    });
    expect([...octaves].sort()).toEqual([3, 4]);
    expect(new Set(questions.map((question) => question.tonic.midi() % 12)).size).toBeGreaterThan(6);
  });

  it("limits easy to steps of at most 2 scale steps, mostly stepwise", () => {
    const steps = many("easy").flatMap(stepSizes);

    expect(Math.min(...steps)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...steps)).toBeLessThanOrEqual(2);
    expect(steps.filter((step) => step === 1).length / steps.length).toBeGreaterThan(0.6);
  });

  it("limits medium to steps of at most 3 scale steps (a 4th)", () => {
    const steps = many("medium").flatMap(stepSizes);

    expect(Math.min(...steps)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...steps)).toBe(3);
  });

  it("lets hard leap up to an octave and start on any degree", () => {
    const questions = many("hard");
    const steps = questions.flatMap(stepSizes);

    expect(Math.max(...steps)).toBeGreaterThan(4);
    expect(Math.max(...steps)).toBeLessThanOrEqual(7);
    expect(new Set(questions.map((question) => question.degreeIds[0])).size).toBe(7);
  });

  it("starts easy and medium on degree 1, 3 or 5, using all three", () => {
    for (const difficulty of ["easy", "medium"] as const) {
      const starts = new Set(many(difficulty).map((question) => question.degreeIds[0]));

      expect([...starts].sort()).toEqual(["0", "4", "7"]);
    }
  });

  it("never repeats the same note twice in a row", () => {
    for (const difficulty of DIFFICULTIES) {
      many(difficulty).forEach((question) => {
        question.notes.slice(1).forEach((note, index) => {
          expect(note.midi()).not.toBe(question.notes[index].midi());
        });
      });
    }
  });

  it("is deterministic for a given random source", () => {
    for (const difficulty of DIFFICULTIES) {
      const first = generateDictation(difficulty, seeded(7));
      const second = generateDictation(difficulty, seeded(7));

      expect(second.tonic.midi()).toBe(first.tonic.midi());
      expect(second.notes.map((note) => note.midi())).toEqual(first.notes.map((note) => note.midi()));
      expect(second.degreeIds).toEqual(first.degreeIds);
    }
  });

  it("works at the extremes of the random source", () => {
    for (const value of [0, 0.999999]) {
      for (const difficulty of DIFFICULTIES) {
        const question = generateDictation(difficulty, () => value);

        expect(question.notes).toHaveLength(dictationLength(difficulty));
      }
    }
  });
});

describe("gradeDictation", () => {
  const expected = ["0", "4", "7"];

  it("is correct only when every position matches", () => {
    expect(gradeDictation(expected, ["0", "4", "7"])).toEqual({ perNote: [true, true, true], allCorrect: true });
    expect(gradeDictation(expected, ["0", "5", "7"])).toEqual({ perNote: [true, false, true], allCorrect: false });
    expect(gradeDictation(expected, ["7", "4", "0"])).toEqual({ perNote: [false, true, false], allCorrect: false });
  });

  it("treats missing positions as wrong and never as complete", () => {
    expect(gradeDictation(expected, ["0", "4"])).toEqual({ perNote: [true, true, false], allCorrect: false });
    expect(gradeDictation(expected, [])).toEqual({ perNote: [false, false, false], allCorrect: false });
  });

  it("builds the composite answer id used as the correctId of a dictation question", () => {
    expect(dictationAnswerId(["0", "4", "11"])).toBe("0-4-11");
  });
});

describe("degreeIdForDigit", () => {
  it("maps digits 1-7 to major-scale degree ids", () => {
    expect(["1", "2", "3", "4", "5", "6", "7"].map(degreeIdForDigit)).toEqual(["0", "2", "4", "5", "7", "9", "11"]);
  });

  it("ignores any other key", () => {
    for (const key of ["0", "8", "9", "a", "Backspace", "Enter", "10", ""]) {
      expect(degreeIdForDigit(key)).toBeNull();
    }
  });
});
