import { z } from "zod";

import { scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** Quiz kinds from `question-generators` (`ear-training` module). */
export const quizKindSchema = z.enum(["interval", "chordQuality", "scale"]);
export type QuizKind = z.infer<typeof quizKindSchema>;

/** Stable domain id of a quiz item (semitones as string, or the chord/scale pattern name). */
const itemIdSchema = z.string().min(1).max(64);

/** Per-kind, per-item tally: `itemStats[kind][itemId]`. */
export const itemStatsSchema = z.record(quizKindSchema, z.record(itemIdSchema, scoreSchema));
export type ItemStats = z.infer<typeof itemStatsSchema>;

/** Wrong-answer counts: `confusions[kind][correctId][chosenId] = times`. */
export const confusionsSchema = z.record(
  quizKindSchema,
  z.record(itemIdSchema, z.record(itemIdSchema, z.number().int().positive())),
);
export type Confusions = z.infer<typeof confusionsSchema>;

/**
 * The *progress* half of `use-ear-training-store`. `difficulty` and
 * `intervalPlaybackMode` are preferences and live in the preferences
 * aggregate (plan §1); the client sync layer splits them out.
 */
export const earTrainingSnapshotSchema = z.object({
  scores: z.record(quizKindSchema, scoreSchema),
  streak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  // Added after the first release: optional on the wire (old snapshots parse to `{}`).
  itemStats: itemStatsSchema.default({}),
  confusions: confusionsSchema.default({}),
});
export type EarTrainingSnapshot = z.infer<typeof earTrainingSnapshotSchema>;

export const earTrainingEnvelopeSchema = syncEnvelopeSchema(earTrainingSnapshotSchema);
