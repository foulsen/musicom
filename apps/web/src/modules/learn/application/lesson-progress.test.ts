import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import type { Lesson } from "./curriculum";
import { completedStepsOf, isLessonCompleted, isLessonLocked, useLearnViewModel } from "./use-learn-view-model";
import { useLearnStore, type LessonProgress } from "./use-learn-store";

function lesson(id: string, stepCount: number, prerequisiteId?: string): Lesson {
  return {
    id,
    titleKey: id,
    summaryKey: id,
    context: { root: "C", pattern: "Major" },
    prerequisiteId,
    steps: Array.from({ length: stepCount }, () => ({ kind: "concept" as const, titleKey: "", bodyKey: "" })),
  };
}

describe("lesson completion survives curriculum changes", () => {
  const today = lesson("major-scale", 5);

  it("counts a lesson with a recorded checkpoint as complete even if its saved indexes are fewer than today's steps", () => {
    // formato antigo: 3 passos (conceito, explorar, checkpoint) -> índices [0, 1, 2]
    const legacy: LessonProgress = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 4, total: 5 } };

    expect(isLessonCompleted(today, legacy)).toBe(true);
    expect(completedStepsOf(today, legacy)).toBe(5);
  });

  it("does not treat a partially done lesson without a checkpoint as complete", () => {
    const partial: LessonProgress = { completedStepIndexes: [0, 1] };

    expect(isLessonCompleted(today, partial)).toBe(false);
    expect(completedStepsOf(today, partial)).toBe(2);
  });

  it("ignores out-of-range and duplicate indexes", () => {
    const entry: LessonProgress = { completedStepIndexes: [0, 0, 1, 9] };

    expect(completedStepsOf(today, entry)).toBe(2);
  });

  it("completes by indexes alone when every step is done", () => {
    expect(isLessonCompleted(today, { completedStepIndexes: [0, 1, 2, 3, 4] })).toBe(true);
  });

  it("treats a missing entry as not started", () => {
    expect(isLessonCompleted(today, undefined)).toBe(false);
    expect(completedStepsOf(today, undefined)).toBe(0);
  });
});

describe("isLessonLocked", () => {
  const a = lesson("a", 3);
  const b = lesson("b", 3, "a");
  const c = lesson("c", 3, "b");
  const track = [a, b, c];

  it("locks a lesson whose prerequisite is not done and has nothing after it started", () => {
    expect(isLessonLocked(track, a, {})).toBe(false);
    expect(isLessonLocked(track, b, {})).toBe(true);
    expect(isLessonLocked(track, c, {})).toBe(true);
  });

  it("unlocks the next lesson once the prerequisite is complete", () => {
    expect(isLessonLocked(track, b, { a: { completedStepIndexes: [0, 1, 2] } })).toBe(false);
  });

  it("never locks a lesson the user already progressed past (new earlier lessons must not trap old progress)", () => {
    const progress = { c: { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } } };

    expect(isLessonLocked(track, b, progress)).toBe(false);
    expect(isLessonLocked(track, c, progress)).toBe(false);
  });

  it("does not unlock a later lesson because an earlier one has progress", () => {
    expect(isLessonLocked(track, c, { a: { completedStepIndexes: [0] } })).toBe(true);
  });
});

describe("useLearnViewModel with legacy progress", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("keeps a lesson completed (not locked, not regressed) when saved with the old step layout", () => {
    const store = useLearnStore();
    store.progress["major-scale"] = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } };
    store.progress.triads = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 4, total: 5 } };

    const model = useLearnViewModel();
    const status = (id: string) => model.lessonsWithStatus.value.find((item) => item.lesson.id === id)?.status;

    expect(status("major-scale")).toBe("completed");
    expect(status("triads")).toBe("completed");
    expect(model.completedStepCount("major-scale")).toBe(
      model.track.lessons.find((item) => item.id === "major-scale")!.steps.length,
    );
    expect(model.trackProgressPercent.value).toBeGreaterThan(0);
  });

  it("keeps every old lesson completed after the curriculum grew, and shows the new ones as open", () => {
    const store = useLearnStore();
    const done = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } };
    ["major-scale", "triads", "diatonic-field", "two-five-one", "modes"].forEach((id) => {
      store.progress[id] = { ...done };
    });

    const model = useLearnViewModel();
    const status = (id: string) => model.lessonsWithStatus.value.find((item) => item.lesson.id === id)?.status;

    ["major-scale", "triads", "diatonic-field", "two-five-one", "modes"].forEach((id) => expect(status(id)).toBe("completed"));
    ["notes", "intervals", "seventh-chords", "natural-minor"].forEach((id) => expect(status(id)).toBe("available"));
  });

  it("unlocks the next lesson from the new chain once a lesson is completed", () => {
    const store = useLearnStore();
    store.progress["major-scale"] = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } };
    store.progress.triads = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } };

    const model = useLearnViewModel();
    const status = (id: string) => model.lessonsWithStatus.value.find((item) => item.lesson.id === id)?.status;

    expect(status("seventh-chords")).toBe("available");
    expect(status("diatonic-field")).toBe("locked");
  });

  it("starts a brand new user at the first lesson, with the rest locked", () => {
    const model = useLearnViewModel();
    const statuses = model.lessonsWithStatus.value.map((item) => item.status);

    expect(statuses[0]).toBe("available");
    expect(statuses.slice(1).every((status) => status === "locked")).toBe(true);
    expect(model.continueLesson.value?.id).toBe("notes");
  });

  it("sends 'Continue' past the lessons already done, not back to a lesson inserted before them", () => {
    const store = useLearnStore();
    store.progress["major-scale"] = { completedStepIndexes: [0, 1, 2], checkpoint: { correct: 5, total: 5 } };
    store.lastVisitedLessonId = "major-scale";

    const model = useLearnViewModel();

    expect(model.continueLesson.value?.id).toBe("triads");
  });

  it("never sends 'Continue' to a locked lesson that was only visited", () => {
    const store = useLearnStore();
    store.lastVisitedLessonId = "major-scale";

    const model = useLearnViewModel();

    expect(model.continueLesson.value?.id).toBe("notes");
  });
});
