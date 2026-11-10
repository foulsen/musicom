import { describe, expect, it } from "vitest";

import type { Lesson, Track } from "./curriculum";
import { findLessonLocation, pickContinueLesson, type LessonStatus, type LessonWithStatus } from "./use-learn-view-model";

function fakeLesson(id: string): Lesson {
  return { id, titleKey: `${id}.title`, summaryKey: `${id}.summary`, context: {} as Lesson["context"], steps: [] };
}

function fakeTrack(id: string, lessonIds: string[]): Track {
  return { id, titleKey: `${id}.title`, lessons: lessonIds.map(fakeLesson) };
}

function withStatus(ids: string[], statuses: LessonStatus[]): LessonWithStatus[] {
  return ids.map((id, index) => ({ lesson: fakeLesson(id), status: statuses[index], checkpoint: null }));
}

describe("findLessonLocation", () => {
  const tracks = [fakeTrack("first", ["a", "b"]), fakeTrack("second", ["c", "d", "e"])];

  it("finds a lesson in the second track with its own index", () => {
    const location = findLessonLocation(tracks, "d");

    expect(location?.track.id).toBe("second");
    expect(location?.lesson.id).toBe("d");
    expect(location?.index).toBe(1);
  });

  it("finds a lesson in the first track", () => {
    expect(findLessonLocation(tracks, "a")?.track.id).toBe("first");
  });

  it("returns null for an unknown id", () => {
    expect(findLessonLocation(tracks, "nope")).toBeNull();
  });
});

describe("pickContinueLesson", () => {
  const ids = ["x", "y", "z"];

  it("ignores a last visited lesson that belongs to another track", () => {
    const items = withStatus(ids, ["completed", "available", "locked"]);

    expect(pickContinueLesson(items, "from-another-track")?.id).toBe("y");
  });

  it("picks the first open lesson after the last completed one", () => {
    const items = withStatus(["w", ...ids], ["available", "completed", "available", "locked"]);

    expect(pickContinueLesson(items, null)?.id).toBe("y");
  });

  it("returns the last visited lesson while it is still open", () => {
    const items = withStatus(ids, ["completed", "available", "in-progress"]);

    expect(pickContinueLesson(items, "z")?.id).toBe("z");
  });

  it("does not return a last visited lesson that is locked or completed", () => {
    const items = withStatus(ids, ["completed", "available", "locked"]);

    expect(pickContinueLesson(items, "z")?.id).toBe("y");
    expect(pickContinueLesson(items, "x")?.id).toBe("y");
  });

  it("returns null when nothing is open", () => {
    expect(pickContinueLesson(withStatus(ids, ["completed", "completed", "completed"]), null)).toBeNull();
  });
});
