import { z } from "zod";

import { noteSchema, scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** One Leitner card's scheduling state (box 1..5 + epoch-ms due date). */
export const leitnerCardStateSchema = z.object({
  box: z.number().int().min(1),
  dueAt: z.number().int().nonnegative(),
});
export type LeitnerCardState = z.infer<typeof leitnerCardStateSchema>;

/**
 * The *progress* half of `use-drills-store`. UI preferences that live in the
 * same Pinia store (`activeDeckId`, `fretboardNaturalsOnly`) belong to the
 * preferences aggregate instead (plan §1); the client sync layer splits them.
 */
export const drillsSnapshotSchema = z.object({
  cardStates: z.record(z.string(), leitnerCardStateSchema),
  /** Best time per target note — sparse, so a partial map keyed by note name. */
  fretboardBestMsByNote: z.record(noteSchema, z.number().nonnegative()),
  noteIdScore: scoreSchema,
  noteIdStreak: z.number().int().nonnegative(),
  noteIdBestStreak: z.number().int().nonnegative(),
});
export type DrillsSnapshot = z.infer<typeof drillsSnapshotSchema>;

export const drillsEnvelopeSchema = syncEnvelopeSchema(drillsSnapshotSchema);
