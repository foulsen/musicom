import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useLearnStore } from "./use-learn-store";
import { useStudyActivity } from "./use-study-activity";

describe("useStudyActivity", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("records the local day of the answer once, however many answers happen that day", () => {
    const { recordActivity } = useStudyActivity();

    recordActivity(new Date(2026, 9, 31, 8, 0));
    recordActivity(new Date(2026, 9, 31, 23, 59));

    expect(useLearnStore().studyDays).toEqual(["2026-10-31"]);
  });

  it("keeps days in chronological order across days", () => {
    const { recordActivity } = useStudyActivity();

    recordActivity(new Date(2026, 10, 1, 9, 0));
    recordActivity(new Date(2026, 9, 31, 9, 0));

    expect(useLearnStore().studyDays).toEqual(["2026-10-31", "2026-11-01"]);
  });
});
