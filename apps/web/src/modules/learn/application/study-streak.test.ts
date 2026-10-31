import { describe, expect, it } from "vitest";

import { addStudyDay, currentStreak, MAX_STUDY_DAYS, normalizeStudyDays, toLocalIsoDate } from "./study-streak";

describe("toLocalIsoDate", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // Construído por componentes locais: independe do fuso da máquina que roda o teste.
    expect(toLocalIsoDate(new Date(2026, 9, 31, 23, 59, 59))).toBe("2026-10-31");
    expect(toLocalIsoDate(new Date(2026, 0, 1, 0, 0, 0))).toBe("2026-01-01");
  });

  it("pads month and day", () => {
    expect(toLocalIsoDate(new Date(2026, 2, 5))).toBe("2026-03-05");
  });
});

describe("normalizeStudyDays", () => {
  it("dedupes, sorts chronologically and keeps only the most recent days", () => {
    expect(normalizeStudyDays(["2026-10-03", "2026-10-01", "2026-10-03", "2026-10-02"], 2)).toEqual([
      "2026-10-02",
      "2026-10-03",
    ]);
  });
});

describe("addStudyDay", () => {
  it("is idempotent for the same day", () => {
    const days = ["2026-10-30", "2026-10-31"];

    expect(addStudyDay(days, "2026-10-31")).toBe(days);
  });

  it("appends a new day in order and stays bounded", () => {
    expect(addStudyDay(["2026-10-30"], "2026-10-31")).toEqual(["2026-10-30", "2026-10-31"]);

    const many = Array.from({ length: MAX_STUDY_DAYS }, (_, index) => toLocalIsoDate(new Date(2025, 0, 1 + index)));
    const next = addStudyDay(many, "2030-01-01");

    expect(next).toHaveLength(MAX_STUDY_DAYS);
    expect(next.at(-1)).toBe("2030-01-01");
    expect(next).not.toContain(many[0]);
  });
});

describe("currentStreak", () => {
  it("is 0 without any study day", () => {
    expect(currentStreak([], "2026-10-31")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-10-29", "2026-10-30", "2026-10-31"], "2026-10-31")).toBe(3);
  });

  it("keeps the streak alive when only today is missing", () => {
    expect(currentStreak(["2026-10-29", "2026-10-30"], "2026-10-31")).toBe(2);
  });

  it("resets after a full day without studying", () => {
    expect(currentStreak(["2026-10-28", "2026-10-29"], "2026-10-31")).toBe(0);
  });

  it("stops at the first gap", () => {
    expect(currentStreak(["2026-10-26", "2026-10-28", "2026-10-30", "2026-10-31"], "2026-10-31")).toBe(2);
  });

  it("crosses month, year and leap-day boundaries", () => {
    expect(currentStreak(["2026-12-31", "2027-01-01"], "2027-01-01")).toBe(2);
    expect(currentStreak(["2024-02-28", "2024-02-29", "2024-03-01"], "2024-03-01")).toBe(3);
  });

  it("is not thrown off by daylight-saving transitions", () => {
    expect(currentStreak(["2026-03-07", "2026-03-08", "2026-03-09"], "2026-03-09")).toBe(3);
    expect(currentStreak(["2026-10-31", "2026-11-01", "2026-11-02"], "2026-11-02")).toBe(3);
  });

  it("ignores days in the future relative to today", () => {
    expect(currentStreak(["2026-11-01"], "2026-10-31")).toBe(0);
  });
});
