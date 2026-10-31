import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import {
  CHECKPOINT_MASTERY_THRESHOLD,
  bestCheckpoint,
  checkpointPercent,
  isCheckpointMastered,
} from "./checkpoint-mastery";
import { deriveLessonStatus, useLearnViewModel } from "./use-learn-view-model";

describe("isCheckpointMastered", () => {
  it("uses a 70% threshold", () => {
    expect(CHECKPOINT_MASTERY_THRESHOLD).toBe(0.7);
    expect(isCheckpointMastered({ correct: 3, total: 5 })).toBe(false);
    expect(isCheckpointMastered({ correct: 4, total: 5 })).toBe(true);
    expect(isCheckpointMastered({ correct: 7, total: 10 })).toBe(true);
    expect(isCheckpointMastered({ correct: 5, total: 5 })).toBe(true);
  });

  it("treats a missing or empty score as not mastered", () => {
    expect(isCheckpointMastered(null)).toBe(false);
    expect(isCheckpointMastered(undefined)).toBe(false);
    expect(isCheckpointMastered({ correct: 0, total: 0 })).toBe(false);
  });
});

describe("checkpointPercent", () => {
  it("rounds to a whole percentage", () => {
    expect(checkpointPercent({ correct: 4, total: 5 })).toBe(80);
    expect(checkpointPercent({ correct: 1, total: 3 })).toBe(33);
  });
});

describe("bestCheckpoint", () => {
  it("keeps the first attempt when there is no previous score", () => {
    expect(bestCheckpoint(undefined, { correct: 2, total: 5 })).toEqual({ correct: 2, total: 5 });
  });

  it("keeps the better ratio, even across different totals (legacy 2-question scores)", () => {
    expect(bestCheckpoint({ correct: 2, total: 5 }, { correct: 4, total: 5 })).toEqual({ correct: 4, total: 5 });
    expect(bestCheckpoint({ correct: 4, total: 5 }, { correct: 1, total: 5 })).toEqual({ correct: 4, total: 5 });
    expect(bestCheckpoint({ correct: 2, total: 2 }, { correct: 4, total: 5 })).toEqual({ correct: 2, total: 2 });
  });

  it("keeps the earlier attempt on a tie", () => {
    expect(bestCheckpoint({ correct: 2, total: 4 }, { correct: 3, total: 6 })).toEqual({ correct: 2, total: 4 });
  });
});

describe("deriveLessonStatus", () => {
  const base = { isComplete: false, isLocked: false, hasStarted: false };

  it("derives the pre-completion states", () => {
    expect(deriveLessonStatus({ ...base, isLocked: true })).toBe("locked");
    expect(deriveLessonStatus(base)).toBe("available");
    expect(deriveLessonStatus({ ...base, hasStarted: true })).toBe("in-progress");
  });

  it("is completed when the lesson is done and the best checkpoint reaches the target", () => {
    expect(deriveLessonStatus({ ...base, isComplete: true, checkpoint: { correct: 4, total: 5 } })).toBe("completed");
  });

  it("is review when the lesson is done but the best checkpoint is below the target", () => {
    expect(deriveLessonStatus({ ...base, isComplete: true, checkpoint: { correct: 2, total: 5 } })).toBe("review");
  });

  it("is completed when the lesson is done without any recorded checkpoint", () => {
    expect(deriveLessonStatus({ ...base, isComplete: true })).toBe("completed");
  });

  it("is never locked once complete, so review does not gate the next lesson", () => {
    expect(deriveLessonStatus({ ...base, isComplete: true, isLocked: true, checkpoint: { correct: 0, total: 5 } })).toBe(
      "review",
    );
  });
});

describe("useLearnViewModel soft gate", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function finishLesson(
    model: ReturnType<typeof useLearnViewModel>,
    lessonId: string,
    score: { correct: number; total: number },
  ) {
    const lesson = model.track.lessons.find((item) => item.id === lessonId)!;
    lesson.steps.forEach((_, index) => model.markStepDone(lessonId, index));
    model.recordCheckpoint(lessonId, score);
  }

  it("unlocks the next lesson but flags the finished one for review below 70%", () => {
    const model = useLearnViewModel();
    finishLesson(model, "major-scale", { correct: 2, total: 5 });

    const statusOf = (id: string) => model.lessonsWithStatus.value.find((item) => item.lesson.id === id)?.status;

    expect(statusOf("major-scale")).toBe("review");
    expect(statusOf("triads")).toBe("available");
  });

  it("clears the review state once a retry reaches 70% and never regresses on a worse retry", () => {
    const model = useLearnViewModel();
    finishLesson(model, "major-scale", { correct: 2, total: 5 });

    const status = () => model.lessonsWithStatus.value.find((item) => item.lesson.id === "major-scale");

    model.recordCheckpoint("major-scale", { correct: 4, total: 5 });
    expect(status()?.status).toBe("completed");
    expect(status()?.checkpoint).toEqual({ correct: 4, total: 5 });

    model.recordCheckpoint("major-scale", { correct: 1, total: 5 });
    expect(status()?.status).toBe("completed");
    expect(model.bestCheckpointOf("major-scale")).toEqual({ correct: 4, total: 5 });
  });
});
