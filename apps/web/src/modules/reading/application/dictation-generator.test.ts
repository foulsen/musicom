import { describe, expect, it } from "vitest";

import { Clef, SpelledPitch, isMeasureComplete, passageSignature, type Passage } from "@music-workspace/music-theory";

import { generateDictation } from "./dictation-generator";
import { DICTATION_LEVEL_IDS } from "./reading-types";

const ITERATIONS = 50;

/** Gerador pseudoaleatório determinístico (mulberry32), para os testes não oscilarem. */
function seeded(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pitchesOf(passage: Passage): SpelledPitch[] {
  return passage.measures.flatMap((measure) =>
    measure.events.flatMap((event) => (event.kind === "note" ? event.pitches : [])),
  );
}

function allQuestions(levelId: (typeof DICTATION_LEVEL_IDS)[number]) {
  const random = seeded(7);

  return Array.from({ length: ITERATIONS }, () => generateDictation(levelId, random));
}

describe("generateDictation", () => {
  it.each(DICTATION_LEVEL_IDS)("%s: 3 distinct options that contain the answer", (levelId) => {
    allQuestions(levelId).forEach(({ answer, options }) => {
      const signatures = options.map(passageSignature);

      expect(options).toHaveLength(3);
      expect(new Set(signatures).size).toBe(3);
      expect(signatures).toContain(passageSignature(answer));
    });
  });

  it.each(DICTATION_LEVEL_IDS)("%s: complete measures and pitches within the staff range", (levelId) => {
    allQuestions(levelId).forEach(({ options }) => {
      options.forEach((passage) => {
        expect(passage.clef.name).toBe("treble");
        expect(passage.time.toString()).toBe("4/4");
        passage.measures.forEach((measure) => expect(isMeasureComplete(measure, passage.time)).toBe(true));

        pitchesOf(passage).forEach((pitch) => {
          const position = Clef.TREBLE.staffPosition(pitch);

          expect(position).toBeGreaterThanOrEqual(-2);
          expect(position).toBeLessThanOrEqual(10);
        });
      });
    });
  });

  it("uses the expected number of measures and never ties notes", () => {
    expect(allQuestions("steps").every(({ answer }) => answer.measures.length === 1)).toBe(true);

    DICTATION_LEVEL_IDS.filter((id) => id !== "steps").forEach((levelId) => {
      allQuestions(levelId).forEach(({ answer }) => {
        expect(answer.measures).toHaveLength(2);
        answer.measures.forEach((measure) =>
          measure.events.forEach((event) => expect(event.kind === "note" && event.tieToNext).toBeFalsy()),
        );
      });
    });
  });

  it("steps: C major, stepwise quarters from C4 within degrees 1-5", () => {
    allQuestions("steps").forEach(({ answer }) => {
      const pitches = pitchesOf(answer);
      const indexes = pitches.map((pitch) => pitch.diatonicIndex());

      expect(answer.key.fifths).toBe(0);
      expect(pitches).toHaveLength(4);
      expect(pitches[0].toString()).toBe("C4");
      indexes.forEach((index, i) => {
        expect(index).toBeGreaterThanOrEqual(28);
        expect(index).toBeLessThanOrEqual(32);
        if (i > 0) expect(Math.abs(index - indexes[i - 1])).toBe(1);
      });
    });
  });

  it("thirds and leaps: major key whose melody ends on a resting degree", () => {
    allQuestions("thirds").forEach(({ answer }) => {
      const tonic = answer.key.majorTonic();
      const last = pitchesOf(answer).at(-1)!;

      expect([-1, 0, 1]).toContain(answer.key.fifths);
      expect(last.spelled.letter).toBe(tonic.letter);
      expect(last.spelled.accidental).toBe(tonic.accidental);
    });

    allQuestions("leaps").forEach(({ answer }) => {
      const tonicLetter = answer.key.majorTonic().letter;
      const last = pitchesOf(answer).at(-1)!;
      const degree = (last.diatonicIndex() - SpelledPitch.of(tonicLetter, 0, 4).diatonicIndex() + 700) % 7;

      expect(Math.abs(answer.key.fifths)).toBeLessThanOrEqual(2);
      expect([0, 4]).toContain(degree);
    });
  });

  it("minor: minor key (A, D or E minor) that ends on the tonic and may raise the 7th", () => {
    const questions = allQuestions("minor");

    questions.forEach(({ answer }) => {
      const tonic = answer.key.minorTonic();
      const last = pitchesOf(answer).at(-1)!;

      expect([0, -1, 1]).toContain(answer.key.fifths);
      expect(["A", "D", "E"]).toContain(tonic.letter);
      expect(last.spelled.letter).toBe(tonic.letter);
      expect(last.spelled.accidental).toBe(tonic.accidental);
    });

    const raised = questions.some(({ answer }) =>
      pitchesOf(answer).some(
        (pitch) => pitch.spelled.accidental === answer.key.accidentalFor(pitch.spelled.letter) + 1,
      ),
    );
    expect(raised).toBe(true);
  });

  it("is reproducible for the same random stream", () => {
    const first = generateDictation("leaps", seeded(3));
    const second = generateDictation("leaps", seeded(3));

    expect(first.options.map(passageSignature)).toEqual(second.options.map(passageSignature));
  });
});
