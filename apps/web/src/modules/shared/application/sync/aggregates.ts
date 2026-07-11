import {
  drillsSnapshotSchema,
  earTrainingSnapshotSchema,
  learnSnapshotSchema,
  preferencesSnapshotSchema,
  type DrillsSnapshot,
  type EarTrainingSnapshot,
  type LearnSnapshot,
  type PreferencesSnapshot,
} from "@music-workspace/shared-types";
import type { Pinia } from "pinia";

import { i18n, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type AppLocale } from "@/i18n";
import { useDrillsStore } from "@/modules/drills/application/use-drills-store";
import { useEarTrainingStore } from "@/modules/ear-training/application/use-ear-training-store";
import { useLearnStore } from "@/modules/learn/application/use-learn-store";
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
    return { progress: store.progress, lastVisitedLessonId: store.lastVisitedLessonId };
  },
  apply: (pinia, data) => {
    const store = useLearnStore(pinia);
    store.progress = data.progress;
    store.lastVisitedLessonId = data.lastVisitedLessonId;
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
    };
  },
  apply: (pinia, data) => {
    const store = useDrillsStore(pinia);
    store.cardStates = data.cardStates;
    store.fretboardBestMsByNote = data.fretboardBestMsByNote;
    store.noteIdScore = data.noteIdScore;
    store.noteIdStreak = data.noteIdStreak;
    store.noteIdBestStreak = data.noteIdBestStreak;
  },
});

const earTraining = defineAggregate<EarTrainingSnapshot>({
  key: "earTraining",
  slug: "ear-training",
  schema: earTrainingSnapshotSchema,
  read: (pinia) => {
    const store = useEarTrainingStore(pinia);
    return { scores: store.scores, streak: store.streak, bestStreak: store.bestStreak };
  },
  apply: (pinia, data) => {
    const store = useEarTrainingStore(pinia);
    if (data.scores) {
      store.scores = { ...store.scores, ...data.scores };
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
  },
});

export const AGGREGATES: Aggregate<unknown>[] = [learn, drills, earTraining, preferences];
