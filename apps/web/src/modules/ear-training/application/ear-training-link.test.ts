import { describe, expect, it } from "vitest";

import { buildEarTrainingLink, parseEarTrainingQuery } from "./ear-training-link";

describe("parseEarTrainingQuery", () => {
  it("reads a valid quiz kind and difficulty", () => {
    expect(parseEarTrainingQuery({ quiz: "chordQuality", difficulty: "easy" })).toEqual({
      kind: "chordQuality",
      difficulty: "easy",
    });
  });

  it("accepts each field on its own", () => {
    expect(parseEarTrainingQuery({ quiz: "scale" })).toEqual({ kind: "scale" });
    expect(parseEarTrainingQuery({ difficulty: "hard" })).toEqual({ difficulty: "hard" });
  });

  it("ignores unknown values", () => {
    expect(parseEarTrainingQuery({ quiz: "rhythm", difficulty: "impossible" })).toEqual({});
    expect(parseEarTrainingQuery({ quiz: "Interval" })).toEqual({});
  });

  it("keeps the valid field when the other one is invalid", () => {
    expect(parseEarTrainingQuery({ quiz: "interval", difficulty: "nope" })).toEqual({ kind: "interval" });
  });

  it("uses the first value of a repeated param and ignores empty queries", () => {
    expect(parseEarTrainingQuery({ quiz: ["scale", "interval"] })).toEqual({ kind: "scale" });
    expect(parseEarTrainingQuery({ quiz: null })).toEqual({});
    expect(parseEarTrainingQuery({})).toEqual({});
  });
});

describe("buildEarTrainingLink", () => {
  it("builds a link that parses back to the same config", () => {
    const link = buildEarTrainingLink("interval", "medium") as { path: string; query: Record<string, string> };

    expect(link.path).toBe("/ear-training");
    expect(parseEarTrainingQuery(link.query)).toEqual({ kind: "interval", difficulty: "medium" });
  });

  it("omits the difficulty when not given", () => {
    const link = buildEarTrainingLink("scale") as { query: Record<string, string> };

    expect(link.query).toEqual({ quiz: "scale" });
  });
});
