/** Exercícios (abas) da prática de leitura de partitura. */
export const READING_EXERCISES = ["notes", "rhythm", "dictation", "keys"] as const;
export type ReadingExercise = (typeof READING_EXERCISES)[number];

export const NOTE_READING_LEVEL_IDS = [
  "treble-staff",
  "treble-ledger",
  "bass-staff",
  "bass-ledger",
  "grand-staff",
  "accidentals",
  "key-signatures",
  "c-clefs",
] as const;
export const RHYTHM_LEVEL_IDS = ["quarters", "eighths", "dotted", "sixteenths", "syncopation", "compound", "triplets"] as const;
export const DICTATION_LEVEL_IDS = ["steps", "thirds", "leaps", "minor"] as const;
export const KEY_SIGNATURE_LEVEL_IDS = ["up-to-2", "up-to-4", "all"] as const;

export type NoteReadingLevelId = (typeof NOTE_READING_LEVEL_IDS)[number];
export type RhythmLevelId = (typeof RHYTHM_LEVEL_IDS)[number];
export type DictationLevelId = (typeof DICTATION_LEVEL_IDS)[number];
export type KeySignatureLevelId = (typeof KEY_SIGNATURE_LEVEL_IDS)[number];

/** Níveis válidos de cada exercício — usado para validar o deep-link. */
export const READING_LEVEL_IDS: { [E in ReadingExercise]: readonly string[] } = {
  notes: NOTE_READING_LEVEL_IDS,
  rhythm: RHYTHM_LEVEL_IDS,
  dictation: DICTATION_LEVEL_IDS,
  keys: KEY_SIGNATURE_LEVEL_IDS,
};

export interface ItemScore {
  correct: number;
  total: number;
}
