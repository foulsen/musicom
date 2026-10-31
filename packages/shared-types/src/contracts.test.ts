import { describe, expect, expectTypeOf, it } from "vitest";

import type { SingleNote } from "@music-workspace/music-theory";

import {
  drillsSnapshotSchema,
  earTrainingSnapshotSchema,
  learnEnvelopeSchema,
  learnSnapshotSchema,
  loginInputSchema,
  preferencesSnapshotSchema,
  registerInputSchema,
  updateProfileInputSchema,
  userProfileSchema,
  type DrillsSnapshot,
} from "./index";

describe("auth", () => {
  it("accepts a valid register input", () => {
    expect(
      registerInputSchema.safeParse({ email: "ada@example.com", password: "supersecret" }).success,
    ).toBe(true);
  });

  it("accepts a valid login input", () => {
    expect(
      loginInputSchema.safeParse({ email: "ada@example.com", password: "supersecret" }).success,
    ).toBe(true);
  });

  it("rejects a bad email", () => {
    expect(
      registerInputSchema.safeParse({ email: "not-an-email", password: "supersecret" }).success,
    ).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      loginInputSchema.safeParse({ email: "ada@example.com", password: "short" }).success,
    ).toBe(false);
  });
});

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
      studyDays: ["2026-10-30", "2026-10-31"],
    };

    expect(learnSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("defaults the study days for snapshots saved before they existed", () => {
    const legacy = { progress: {}, lastVisitedLessonId: null };

    expect(learnSnapshotSchema.parse(legacy).studyDays).toEqual([]);
  });

  it("rejects a study day that is not a YYYY-MM-DD date", () => {
    const base = { progress: {}, lastVisitedLessonId: null };

    expect(learnSnapshotSchema.safeParse({ ...base, studyDays: ["31/10/2026"] }).success).toBe(false);
  });

  it("wraps in an envelope with updatedAt", () => {
    const result = learnEnvelopeSchema.safeParse({
      data: { progress: {}, lastVisitedLessonId: null, studyDays: [] },
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
      noteIdStats: { "0-3": { correct: 2, total: 3 } },
    };

    expect(drillsSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("defaults the per-position Note ID stats for snapshots saved before they existed", () => {
    const legacy = {
      cardStates: {},
      fretboardBestMsByNote: {},
      noteIdScore: { correct: 0, total: 0 },
      noteIdStreak: 0,
      noteIdBestStreak: 0,
    };

    expect(drillsSnapshotSchema.parse(legacy).noteIdStats).toEqual({});
  });

  it("rejects Note ID stats with a malformed position key or an invalid tally", () => {
    const base = {
      cardStates: {},
      fretboardBestMsByNote: {},
      noteIdScore: { correct: 0, total: 0 },
      noteIdStreak: 0,
      noteIdBestStreak: 0,
    };

    expect(drillsSnapshotSchema.safeParse({ ...base, noteIdStats: { "e-3": { correct: 1, total: 1 } } }).success).toBe(false);
    expect(drillsSnapshotSchema.safeParse({ ...base, noteIdStats: { "0-3": { correct: -1, total: 1 } } }).success).toBe(false);
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

  const base = {
    scores: { interval: { correct: 1, total: 2 } },
    streak: 0,
    bestStreak: 0,
  };

  it("parses an old snapshot (no per-item stats) with empty defaults", () => {
    const result = earTrainingSnapshotSchema.parse(base);

    expect(result.itemStats).toEqual({});
    expect(result.confusions).toEqual({});
  });

  it("round-trips per-item stats and confusions", () => {
    const snapshot = {
      ...base,
      itemStats: { interval: { "8": { correct: 1, total: 4 } }, scale: { Dorian: { correct: 2, total: 2 } } },
      confusions: { interval: { "8": { "7": 2, "9": 1 } } },
    };

    expect(earTrainingSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("rejects a non-positive confusion count and an unknown kind", () => {
    expect(
      earTrainingSnapshotSchema.safeParse({ ...base, confusions: { interval: { "8": { "7": 0 } } } }).success,
    ).toBe(false);
    expect(
      earTrainingSnapshotSchema.safeParse({ ...base, itemStats: { melody: { x: { correct: 0, total: 1 } } } })
        .success,
    ).toBe(false);
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

  it("accepts a theme preference", () => {
    expect(preferencesSnapshotSchema.safeParse({ theme: "light" }).success).toBe(true);
  });

  it("accepts the Note ID level and naturals toggle as drill preferences, and rejects an unknown level", () => {
    expect(
      preferencesSnapshotSchema.safeParse({ drills: { noteIdLevel: "frets7", noteIdNaturalsOnly: true } }).success,
    ).toBe(true);
    expect(preferencesSnapshotSchema.safeParse({ drills: { noteIdLevel: "frets99" } }).success).toBe(false);
  });

  it("rejects an unknown theme", () => {
    expect(preferencesSnapshotSchema.safeParse({ theme: "sepia" }).success).toBe(false);
  });
});
