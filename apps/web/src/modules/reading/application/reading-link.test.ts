import { describe, expect, it } from "vitest";

import { buildReadingLink, parseReadingQuery } from "./reading-link";

describe("parseReadingQuery", () => {
  it("reads a valid tab and level", () => {
    expect(parseReadingQuery({ tab: "rhythm", level: "dotted" })).toEqual({ tab: "rhythm", level: "dotted" });
  });

  it("drops a level that belongs to another tab", () => {
    expect(parseReadingQuery({ tab: "notes", level: "dotted" })).toEqual({ tab: "notes" });
  });

  it("drops unknown tabs (and their level)", () => {
    expect(parseReadingQuery({ tab: "karaoke", level: "dotted" })).toEqual({});
    expect(parseReadingQuery({})).toEqual({});
  });

  it("uses the first value of a repeated param", () => {
    expect(parseReadingQuery({ tab: ["keys", "notes"], level: ["all", "up-to-2"] })).toEqual({ tab: "keys", level: "all" });
  });
});

describe("buildReadingLink", () => {
  it("builds a link with tab and level", () => {
    expect(buildReadingLink("rhythm", "dotted")).toEqual({ path: "/reading", query: { tab: "rhythm", level: "dotted" } });
  });

  it("omits the level when not given", () => {
    expect(buildReadingLink("notes")).toEqual({ path: "/reading", query: { tab: "notes" } });
  });
});
