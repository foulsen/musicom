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
 * Note ID tallies per fretboard position, keyed `"<stringIndex>-<fret>"` (string 0 = lowest).
 * Sparse: positions never answered have no entry.
 */
export const noteIdStatsSchema = z.record(z.string().regex(/^\d+-\d+$/), scoreSchema);
export type NoteIdStats = z.infer<typeof noteIdStatsSchema>;

/**
 * The *progress* half of `use-drills-store`. UI preferences that live in the
 * same Pinia store (`activeDeckId`, `fretboardNaturalsOnly`, `noteIdLevel`,
 * `noteIdNaturalsOnly`) belong to the preferences aggregate instead (plan §1);
 * the client sync layer splits them.
 */
export const drillsSnapshotSchema = z.object({
  cardStates: z.record(z.string(), leitnerCardStateSchema),
  /** Best time per target note — sparse, so a partial map keyed by note name. */
  fretboardBestMsByNote: z.record(noteSchema, z.number().nonnegative()),
  noteIdScore: scoreSchema,
  noteIdStreak: z.number().int().nonnegative(),
  noteIdBestStreak: z.number().int().nonnegative(),
  /** Added after the first release: snapshots saved before it have no value and default to `{}`. */
  noteIdStats: noteIdStatsSchema.default({}),
});
export type DrillsSnapshot = z.infer<typeof drillsSnapshotSchema>;

export const drillsEnvelopeSchema = syncEnvelopeSchema(drillsSnapshotSchema);
