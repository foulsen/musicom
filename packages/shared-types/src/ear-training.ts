import { z } from "zod";

import { scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** Quiz kinds from `question-generators` (`ear-training` module). */
export const quizKindSchema = z.enum(["interval", "chordQuality", "scale"]);
export type QuizKind = z.infer<typeof quizKindSchema>;

/**
 * The *progress* half of `use-ear-training-store`. `difficulty` and
 * `intervalPlaybackMode` are preferences and live in the preferences
 * aggregate (plan §1); the client sync layer splits them out.
 */
export const earTrainingSnapshotSchema = z.object({
  scores: z.record(quizKindSchema, scoreSchema),
  streak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
});
export type EarTrainingSnapshot = z.infer<typeof earTrainingSnapshotSchema>;

export const earTrainingEnvelopeSchema = syncEnvelopeSchema(earTrainingSnapshotSchema);
