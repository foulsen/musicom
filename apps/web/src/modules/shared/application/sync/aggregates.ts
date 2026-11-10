import {
  drillsSnapshotSchema,
  earTrainingSnapshotSchema,
  learnSnapshotSchema,
  preferencesSnapshotSchema,
  readingSnapshotSchema,
  type DrillsSnapshot,
  type EarTrainingSnapshot,
  type LearnSnapshot,
  type PreferencesSnapshot,
  type ReadingSnapshot,
} from "@music-workspace/shared-types";
import type { Pinia } from "pinia";

import { i18n, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type AppLocale } from "@/i18n";
import { useDrillsStore } from "@/modules/drills/application/use-drills-store";
import { useEarTrainingStore } from "@/modules/ear-training/application/use-ear-training-store";
import { normalizeStudyDays } from "@/modules/learn/application/study-streak";
import { useLearnStore } from "@/modules/learn/application/use-learn-store";
import {
  DICTATION_LEVEL_IDS,
  KEY_SIGNATURE_LEVEL_IDS,
  NOTE_READING_LEVEL_IDS,
  RHYTHM_LEVEL_IDS,
  type RhythmLevelId,
} from "@/modules/reading/application/reading-types";
import { useReadingStore } from "@/modules/reading/application/use-reading-store";
import { useThemeStore } from "@/modules/settings/application/use-theme-store";
import { useAudioSettingsStore } from "@/modules/shared/application/use-audio-settings-store";

import type { AggregateKey } from "./types";

/** The slice of zod's schema surface the sync layer uses (avoids a direct zod dep). */
export interface SnapshotValidator<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false };
}

/**
 * Maps a synced aggregate between its wire snapshot (DTO) and the Pinia
 * store(s) that hold it. `read`/`apply` are typed against the DTO so any drift
 * between store shape and contract is a compile error.
 */
export interface Aggregate<T> {
  key: AggregateKey;
  slug: string;
  schema: SnapshotValidator<T>;
  read(pinia: Pinia): T;
  apply(pinia: Pinia, data: T): void;
}

function defineAggregate<T>(aggregate: Aggregate<T>): Aggregate<T> {
  return aggregate;
}

function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale;
}

function applyLocale(locale: AppLocale): void {
  if (SUPPORTED_LOCALES.includes(locale)) {
    i18n.global.locale.value = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

const learn = defineAggregate<LearnSnapshot>({
  key: "learn",
  slug: "learn",
  schema: learnSnapshotSchema,
  read: (pinia) => {
    const store = useLearnStore(pinia);
    return {
      progress: store.progress,
      lastVisitedLessonId: store.lastVisitedLessonId,
      studyDays: store.studyDays,
    };
  },
  apply: (pinia, data) => {
    const store = useLearnStore(pinia);
    store.progress = data.progress;
    store.lastVisitedLessonId = data.lastVisitedLessonId;
    // União, não substituição: dias estudados em outro dispositivo (ou offline) nunca são perdidos.
    store.studyDays = normalizeStudyDays([...store.studyDays, ...data.studyDays]);
  },
});

const drills = defineAggregate<DrillsSnapshot>({
  key: "drills",
  slug: "drills",
  schema: drillsSnapshotSchema,
  read: (pinia) => {
    const store = useDrillsStore(pinia);
    return {
      cardStates: store.cardStates,
      fretboardBestMsByNote: store.fretboardBestMsByNote,
      noteIdScore: store.noteIdScore,
      noteIdStreak: store.noteIdStreak,
      noteIdBestStreak: store.noteIdBestStreak,
      noteIdStats: store.noteIdStats,
    };
  },
  apply: (pinia, data) => {
    const store = useDrillsStore(pinia);
    store.cardStates = data.cardStates;
    store.fretboardBestMsByNote = data.fretboardBestMsByNote;
    store.noteIdScore = data.noteIdScore;
    store.noteIdStreak = data.noteIdStreak;
    store.noteIdBestStreak = data.noteIdBestStreak;
    store.noteIdStats = data.noteIdStats;
  },
});

const earTraining = defineAggregate<EarTrainingSnapshot>({
  key: "earTraining",
  slug: "ear-training",
  schema: earTrainingSnapshotSchema,
  read: (pinia) => {
    const store = useEarTrainingStore(pinia);
    return {
      scores: store.scores,
      streak: store.streak,
      bestStreak: store.bestStreak,
      itemStats: store.itemStats,
      confusions: store.confusions,
    };
  },
  apply: (pinia, data) => {
    const store = useEarTrainingStore(pinia);
    if (data.scores) {
      store.scores = { ...store.scores, ...data.scores };
    }
    // Mesmo merge por tipo de quiz: o que veio do servidor vence só nos tipos que ele conhece.
    if (data.itemStats) {
      store.itemStats = { ...store.itemStats, ...data.itemStats };
    }
    if (data.confusions) {
      store.confusions = { ...store.confusions, ...data.confusions };
    }
    store.streak = data.streak;
    store.bestStreak = data.bestStreak;
  },
});

/**
 * Cross-store aggregate: gathers preference-shaped fields from three stores plus
 * the i18n locale into one snapshot (plan §1). `apply` is field-by-field and
 * defensive, since any single field may be absent from a partial write.
 */
const preferences = defineAggregate<PreferencesSnapshot>({
  key: "preferences",
  slug: "preferences",
  schema: preferencesSnapshotSchema,
  read: (pinia) => {
    const audio = useAudioSettingsStore(pinia);
    const ear = useEarTrainingStore(pinia);
    const drillsStore = useDrillsStore(pinia);
    return {
      locale: currentLocale(),
      theme: useThemeStore(pinia).mode,
      audio: { masterVolume: audio.masterVolume, instrument: audio.instrument },
      earTraining: { difficulty: ear.difficulty, intervalPlaybackMode: ear.intervalPlaybackMode },
      drills: {
        activeDeckId: drillsStore.activeDeckId,
        fretboardNaturalsOnly: drillsStore.fretboardNaturalsOnly,
        noteIdLevel: drillsStore.noteIdLevel,
        noteIdNaturalsOnly: drillsStore.noteIdNaturalsOnly,
      },
    };
  },
  apply: (pinia, data) => {
    if (data.locale) {
      applyLocale(data.locale);
    }
    if (data.theme) {
      useThemeStore(pinia).mode = data.theme;
    }

    const audio = useAudioSettingsStore(pinia);
    if (data.audio?.masterVolume !== undefined) audio.masterVolume = data.audio.masterVolume;
    if (data.audio?.instrument) audio.instrument = data.audio.instrument;

    const ear = useEarTrainingStore(pinia);
    if (data.earTraining?.difficulty) ear.difficulty = data.earTraining.difficulty;
    if (data.earTraining?.intervalPlaybackMode)
      ear.intervalPlaybackMode = data.earTraining.intervalPlaybackMode;

    const drillsStore = useDrillsStore(pinia);
    if (data.drills?.activeDeckId) drillsStore.activeDeckId = data.drills.activeDeckId;
    if (data.drills?.fretboardNaturalsOnly !== undefined)
      drillsStore.fretboardNaturalsOnly = data.drills.fretboardNaturalsOnly;
    if (data.drills?.noteIdLevel) drillsStore.noteIdLevel = data.drills.noteIdLevel;
    if (data.drills?.noteIdNaturalsOnly !== undefined)
      drillsStore.noteIdNaturalsOnly = data.drills.noteIdNaturalsOnly;
  },
});

/** Devolve `value` se for um id de nível válido do exercício; senão, o padrão do store. */
function validLevel<T extends string>(ids: readonly T[], value: string, fallback: T): T {
  return ids.find((id) => id === value) ?? fallback;
}

const reading = defineAggregate<ReadingSnapshot>({
  key: "reading",
  slug: "reading",
  schema: readingSnapshotSchema,
  read: (pinia) => {
    const store = useReadingStore(pinia);
    return {
      noteLevel: store.noteLevel,
      noteStats: store.noteStats,
      noteScore: store.noteScore,
      noteStreak: store.noteStreak,
      noteBestStreak: store.noteBestStreak,
      rhythmLevel: store.rhythmLevel,
      rhythmBpm: store.rhythmBpm,
      rhythmBest: store.rhythmBest as Record<string, number>,
      dictationLevel: store.dictationLevel,
      dictationScore: store.dictationScore,
      dictationStreak: store.dictationStreak,
      keyLevel: store.keyLevel,
      keyStats: store.keyStats,
      keyScore: store.keyScore,
    };
  },
  apply: (pinia, data) => {
    const store = useReadingStore(pinia);
    store.noteLevel = validLevel(NOTE_READING_LEVEL_IDS, data.noteLevel, "treble-staff");
    store.noteStats = data.noteStats;
    store.noteScore = data.noteScore;
    store.noteStreak = data.noteStreak;
    store.noteBestStreak = data.noteBestStreak;
    store.rhythmLevel = validLevel(RHYTHM_LEVEL_IDS, data.rhythmLevel, "quarters");
    store.rhythmBpm = data.rhythmBpm;
    // Descarta melhores marcas de níveis que este cliente não conhece.
    store.rhythmBest = Object.fromEntries(
      Object.entries(data.rhythmBest).filter(([id]) => RHYTHM_LEVEL_IDS.some((level) => level === id)),
    ) as Partial<Record<RhythmLevelId, number>>;
    store.dictationLevel = validLevel(DICTATION_LEVEL_IDS, data.dictationLevel, "steps");
    store.dictationScore = data.dictationScore;
    store.dictationStreak = data.dictationStreak;
    store.keyLevel = validLevel(KEY_SIGNATURE_LEVEL_IDS, data.keyLevel, "up-to-2");
    store.keyStats = data.keyStats;
    store.keyScore = data.keyScore;
  },
});

export const AGGREGATES: Aggregate<unknown>[] = [learn, drills, earTraining, preferences, reading];
