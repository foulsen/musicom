import { describe, expect, expectTypeOf, it } from "vitest";

import type { SingleNote } from "@music-workspace/music-theory";

import {
  drillsSnapshotSchema,
  earTrainingSnapshotSchema,
  learnEnvelopeSchema,
  learnSnapshotSchema,
  preferencesSnapshotSchema,
  updateProfileInputSchema,
  userProfileSchema,
  type DrillsSnapshot,
} from "./index";

describe("profile", () => {
  it("accepts a nullable email", () => {
    const parsed = userProfileSchema.parse({
      id: "00000000-0000-0000-0000-000000000000",
      name: "Ada",
      email: null,
    });

    expect(parsed.email).toBeNull();
  });

  it("rejects a blank name on update", () => {
    expect(updateProfileInputSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});

describe("learn snapshot", () => {
  it("round-trips progress with an optional checkpoint", () => {
    const snapshot = {
      progress: {
        "lesson-1": { completedStepIndexes: [0, 1], checkpoint: { correct: 3, total: 4 } },
        "lesson-2": { completedStepIndexes: [] },
      },
      lastVisitedLessonId: "lesson-1",
    };

    expect(learnSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("wraps in an envelope with updatedAt", () => {
    const result = learnEnvelopeSchema.safeParse({
      data: { progress: {}, lastVisitedLessonId: null },
      updatedAt: 1_700_000_000_000,
    });

    expect(result.success).toBe(true);
  });
});

describe("drills snapshot", () => {
  it("keeps a sparse per-note best-time map", () => {
    const snapshot = {
      cardStates: { "interval-b3": { box: 2, dueAt: 1_700_000_000_000 } },
      fretboardBestMsByNote: { C: 1200, "F#": 900 },
      noteIdScore: { correct: 10, total: 12 },
      noteIdStreak: 3,
      noteIdBestStreak: 8,
    };

    expect(drillsSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("infers the note map as partial so a sparse client value assigns cleanly", () => {
    expectTypeOf<DrillsSnapshot["fretboardBestMsByNote"]>().toEqualTypeOf<
      Partial<Record<SingleNote, number>>
    >();
  });
});

describe("ear-training snapshot", () => {
  it("scores keyed by quiz kind", () => {
    expect(
      earTrainingSnapshotSchema.safeParse({
        scores: {
          interval: { correct: 1, total: 2 },
          chordQuality: { correct: 0, total: 0 },
          scale: { correct: 5, total: 5 },
        },
        streak: 2,
        bestStreak: 5,
      }).success,
    ).toBe(true);
  });
});

describe("preferences snapshot", () => {
  it("accepts a partial write from a single screen", () => {
    expect(preferencesSnapshotSchema.safeParse({ locale: "pt" }).success).toBe(true);
    expect(preferencesSnapshotSchema.safeParse({ audio: { masterVolume: 0.5 } }).success).toBe(true);
  });

  it("rejects an out-of-range volume", () => {
    expect(
      preferencesSnapshotSchema.safeParse({ audio: { masterVolume: 2 } }).success,
    ).toBe(false);
  });

  it("rejects an unknown instrument", () => {
    expect(
      preferencesSnapshotSchema.safeParse({ audio: { instrument: "kazoo" } }).success,
    ).toBe(false);
  });
});
