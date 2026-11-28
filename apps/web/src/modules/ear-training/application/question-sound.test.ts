import { describe, expect, it } from "vitest";

import { INSTRUMENT_IDS } from "@/modules/shared/application/instrument-presets";

import { pickQuestionSound, sequenceGapSeconds, TEMPO_FACTORS } from "./question-sound";

describe("pickQuestionSound", () => {
  it("covers every instrument and tempo across the random range", () => {
    const steps = 100;
    const sounds = Array.from({ length: steps }, (_, i) => pickQuestionSound(() => i / steps));

    expect(new Set(sounds.map((sound) => sound.instrument))).toEqual(new Set(INSTRUMENT_IDS));
    expect(new Set(sounds.map((sound) => sound.tempo))).toEqual(new Set(TEMPO_FACTORS));
  });

  it("picks the first options when random is 0 and the last when it is just below 1", () => {
    expect(pickQuestionSound(() => 0)).toEqual({ instrument: INSTRUMENT_IDS[0], tempo: TEMPO_FACTORS[0] });
    expect(pickQuestionSound(() => 0.999999)).toEqual({
      instrument: INSTRUMENT_IDS.at(-1),
      tempo: TEMPO_FACTORS.at(-1),
    });
  });

  it("only produces known tempo factors", () => {
    for (let i = 0; i < 50; i++) expect(TEMPO_FACTORS).toContain(pickQuestionSound().tempo);
  });
});

describe("sequenceGapSeconds", () => {
  it("keeps the normal gap at tempo 1 and shortens it when faster", () => {
    expect(sequenceGapSeconds()).toBe(0.45);
    expect(sequenceGapSeconds(1.25)).toBeCloseTo(0.36);
    expect(sequenceGapSeconds(0.8)).toBeCloseTo(0.5625);
  });
});
