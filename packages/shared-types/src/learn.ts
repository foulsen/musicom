import { z } from "zod";

import { scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** Mirrors `use-learn-store`: progress per lesson keyed by lesson id. */
export const lessonProgressSchema = z.object({
  completedStepIndexes: z.array(z.number().int().nonnegative()),
  checkpoint: scoreSchema.optional(),
});
export type LessonProgress = z.infer<typeof lessonProgressSchema>;

export const learnSnapshotSchema = z.object({
  progress: z.record(z.string(), lessonProgressSchema),
  lastVisitedLessonId: z.string().nullable(),
});
export type LearnSnapshot = z.infer<typeof learnSnapshotSchema>;

export const learnEnvelopeSchema = syncEnvelopeSchema(learnSnapshotSchema);
