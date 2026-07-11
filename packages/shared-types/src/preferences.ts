import { z } from "zod";

import { syncEnvelopeSchema } from "./sync/envelope";

/**
 * Kept in sync with `apps/web` SUPPORTED_LOCALES / instrument presets / deck ids /
 * `use-theme-store` ThemeMode.
 */
export const localeSchema = z.enum(["en", "pt"]);
export const instrumentSchema = z.enum(["piano", "guitar", "realistic-guitar"]);
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const deckIdSchema = z.enum(["intervals", "intervalNames", "chordFormulas", "chordSpelling"]);
export const intervalPlaybackModeSchema = z.enum(["harmonic", "melodic"]);
export const themeSchema = z.enum(["light", "dark", "system"]);

/**
 * Cross-store preferences aggregate. Gathers the settings scattered across
 * `use-audio-settings-store`, the i18n locale, and the preference-shaped
 * fields of `use-ear-training-store` / `use-drills-store` (plan §1). Every
 * field is optional so a partial write from any one screen is valid; the
 * client fills defaults on hydration.
 */
export const preferencesSnapshotSchema = z.object({
  locale: localeSchema.optional(),
  theme: themeSchema.optional(),
  audio: z
    .object({
      masterVolume: z.number().min(0).max(1),
      instrument: instrumentSchema,
    })
    .partial()
    .optional(),
  earTraining: z
    .object({
      difficulty: difficultySchema,
      intervalPlaybackMode: intervalPlaybackModeSchema,
    })
    .partial()
    .optional(),
  drills: z
    .object({
      activeDeckId: deckIdSchema,
      fretboardNaturalsOnly: z.boolean(),
    })
    .partial()
    .optional(),
});
export type PreferencesSnapshot = z.infer<typeof preferencesSnapshotSchema>;

export const preferencesEnvelopeSchema = syncEnvelopeSchema(preferencesSnapshotSchema);
