import { defineStore } from "pinia";

import type {
  DictationLevelId,
  ItemScore,
  KeySignatureLevelId,
  NoteReadingLevelId,
  RhythmLevelId,
} from "./reading-types";

/** Progresso persistido (localStorage) da prática de leitura de partitura. */
export const useReadingStore = defineStore("reading", {
  state: () => ({
    noteLevel: "treble-staff" as NoteReadingLevelId,
    /** Chave `${clef}:${SpelledPitch}` (ex.: "treble:F#5"); no nível de armaduras, `${clef}:${fifths}:${pitch}`. */
    noteStats: {} as Record<string, ItemScore>,
    noteScore: { correct: 0, total: 0 } as ItemScore,
    noteStreak: 0,
    noteBestStreak: 0,
    rhythmLevel: "quarters" as RhythmLevelId,
    /** Andamento em BPM (40..140). */
    rhythmBpm: 70,
    /** Melhor precisão (0..1) por nível. */
    rhythmBest: {} as Partial<Record<RhythmLevelId, number>>,
    dictationLevel: "steps" as DictationLevelId,
    dictationScore: { correct: 0, total: 0 } as ItemScore,
    dictationStreak: 0,
    keyLevel: "up-to-2" as KeySignatureLevelId,
    /** Chave `${fifths}:${KeyMode}`. */
    keyStats: {} as Record<string, ItemScore>,
    keyScore: { correct: 0, total: 0 } as ItemScore,
  }),
  persist: true,
});
