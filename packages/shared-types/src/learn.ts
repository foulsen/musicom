import { z } from "zod";

import { scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** Mirrors `use-learn-store`: progress per lesson keyed by lesson id. */
export const lessonProgressSchema = z.object({
  completedStepIndexes: z.array(z.number().int().nonnegative()),
  checkpoint: scoreSchema.optional(),
});
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

/** Local calendar day the learner studied, as `YYYY-MM-DD`. */
export const studyDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const learnSnapshotSchema = z.object({
  progress: z.record(z.string(), lessonProgressSchema),
  lastVisitedLessonId: z.string().nullable(),
  /** Added after the first release: snapshots saved before it have no value and default to `[]`. Bounded recent study days (streak source). */
  studyDays: z.array(studyDaySchema).max(400).default([]),
});
export type LearnSnapshot = z.infer<typeof learnSnapshotSchema>;

export const learnEnvelopeSchema = syncEnvelopeSchema(learnSnapshotSchema);
