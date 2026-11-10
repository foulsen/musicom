import { describe, expect, it } from "vitest";

import { isMeasureComplete } from "@music-workspace/music-theory";

import { KEY_SIGNATURE_LEVEL_IDS } from "./reading-types";
import {
  fifthsRange,
  generateKeySignatureQuestion,
  keySignaturePassage,
  keyTonicName,
} from "./key-signature-quiz";

const ITERATIONS = 30;

describe("generateKeySignatureQuestion", () => {
  it.each(KEY_SIGNATURE_LEVEL_IDS)("returns 4 distinct options containing the answer (%s)", (levelId) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateKeySignatureQuestion(levelId, {});

      expect(question.optionFifths).toHaveLength(4);
      expect(new Set(question.optionFifths).size).toBe(4);
      expect(question.optionFifths).toContain(question.correctFifths);
    }
  });

  it.each(KEY_SIGNATURE_LEVEL_IDS)("keeps every option inside the level range (%s)", (levelId) => {
    const { min, max } = fifthsRange(levelId);

    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateKeySignatureQuestion(levelId, undefined);

      question.optionFifths.forEach((fifths) => {
        expect(fifths).toBeGreaterThanOrEqual(min);
        expect(fifths).toBeLessThanOrEqual(max);
      });
    }
  });

  it("uses the level ranges 2, 4 and 7", () => {
    expect(fifthsRange("up-to-2")).toEqual({ min: -2, max: 2 });
    expect(fifthsRange("up-to-4")).toEqual({ min: -4, max: 4 });
    expect(fifthsRange("all")).toEqual({ min: -7, max: 7 });
  });

  it("can produce both question kinds and both modes", () => {
    const kinds = new Set<string>();
    const modes = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const question = generateKeySignatureQuestion("all", {});
      kinds.add(question.kind);
      modes.add(question.mode);
    }

    expect(kinds).toEqual(new Set(["name", "signature"]));
    expect(modes).toEqual(new Set(["major", "minor"]));
  });

  it("can produce 7 sharps and 7 flats on the all level", () => {
    const seen = new Set<number>();

    for (let i = 0; i < 600; i++) seen.add(generateKeySignatureQuestion("all", {}).correctFifths);

    expect(seen.has(7)).toBe(true);
    expect(seen.has(-7)).toBe(true);
  });

  it("builds the item key from fifths and mode", () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const question = generateKeySignatureQuestion("up-to-4", {});

      expect(question.itemKey).toBe(`${question.correctFifths}:${question.mode}`);
    }
  });

  it("favours items the user gets wrong", () => {
    const stats = Object.fromEntries(
      [-2, -1, 0, 1, 2].flatMap((fifths) =>
        (["major", "minor"] as const).map((mode) => [`${fifths}:${mode}`, { correct: 40, total: 40 }]),
      ),
    );
    stats["2:minor"] = { correct: 0, total: 40 };

    let hits = 0;
    for (let i = 0; i < 200; i++) {
      if (generateKeySignatureQuestion("up-to-2", stats).itemKey === "2:minor") hits++;
    }

    // ~42% esperado (peso 0,98 contra 9 itens no piso de 0,15); sem adaptação seriam ~10%.
    expect(hits).toBeGreaterThan(50);
  });
});

describe("key helpers", () => {
  it("names the tonic for each mode", () => {
    expect(keyTonicName(0, "major")).toBe("C");
    expect(keyTonicName(0, "minor")).toBe("A");
    expect(keyTonicName(3, "minor")).toBe("F#");
    expect(keyTonicName(-2, "major")).toBe("Bb");
  });

  it("builds a one-measure passage carrying the key signature and a whole rest", () => {
    const passage = keySignaturePassage(-3);

    expect(passage.key.fifths).toBe(-3);
    expect(passage.clef.name).toBe("treble");
    expect(passage.measures).toHaveLength(1);
    expect(passage.measures[0].events.map((event) => event.kind)).toEqual(["rest"]);
    expect(isMeasureComplete(passage.measures[0], passage.time)).toBe(true);
  });
});
