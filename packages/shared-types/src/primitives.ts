import { CHROMATIC_SCALE } from "@music-workspace/music-theory";
import { z } from "zod";

/**
 * Note names come from the domain package so there is a single source of truth
 * (`shared-types` depends on `music-theory`, never the reverse).
 */
export const noteSchema = z.enum(CHROMATIC_SCALE);

/** Correct-out-of-total tally, shared by every quiz/drill score across the app. */
export const scoreSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type Score = z.infer<typeof scoreSchema>;
