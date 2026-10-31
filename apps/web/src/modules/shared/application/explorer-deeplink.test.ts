import { describe, expect, it } from "vitest";

import { buildExplorerLink } from "./explorer-deeplink";

describe("buildExplorerLink", () => {
  it("serializes only the filled config fields", () => {
    expect(buildExplorerLink("/modes", { root: "C", pattern: "Dorian", tuning: "", degree: 2 })).toEqual({
      path: "/modes",
      query: { root: "C", pattern: "Dorian", degree: "2" },
    });
  });

  it("adds no return params when returnTo is omitted", () => {
    expect(buildExplorerLink("/", { root: "C" })).toEqual({ path: "/", query: { root: "C" } });
  });

  it("adds from=learn and the lesson id when returnTo is given", () => {
    expect(buildExplorerLink("/", { root: "C" }, { lessonId: "triads" })).toEqual({
      path: "/",
      query: { root: "C", from: "learn", lesson: "triads" },
    });
  });

  it("adds the step index (including 0) so the lesson can resume at the same step", () => {
    expect(buildExplorerLink("/chords", {}, { lessonId: "triads", stepIndex: 1 })).toEqual({
      path: "/chords",
      query: { from: "learn", lesson: "triads", step: "1" },
    });

    expect(buildExplorerLink("/", {}, { lessonId: "triads", stepIndex: 0 })).toEqual({
      path: "/",
      query: { from: "learn", lesson: "triads", step: "0" },
    });
  });
});
