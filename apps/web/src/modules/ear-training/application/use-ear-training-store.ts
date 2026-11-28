import { defineStore } from "pinia";

import type { ConfusionsByKind, ItemStatsByKind } from "./item-stats";
import type { ChordVoicing, Difficulty, IntervalDirection, QuizKind, ScaleDirection } from "./question-generators";

export type IntervalPlaybackMode = "harmonic" | "melodic";

export interface QuizScore {
  correct: number;
  total: number;
}

function emptyScore(): QuizScore {
  return { correct: 0, total: 0 };
}

/** Placar persistido (localStorage) do Ear Training Studio, por tipo de quiz. */
export const useEarTrainingStore = defineStore("ear-training", {
  state: () => ({
    scores: {
      interval: emptyScore(),
      chordQuality: emptyScore(),
      scale: emptyScore(),
      scaleDegree: emptyScore(),
      progression: emptyScore(),
    } as Record<QuizKind, QuizScore>,
    /** Acertos por item (`itemStats[tipo][id]`) — base do sampling adaptativo e dos pontos fracos. */
    itemStats: {} as ItemStatsByKind,
    /** Erros por confusão (`confusions[tipo][idCorreto][idEscolhido]`); limitado ao tamanho dos pools. */
    confusions: {} as ConfusionsByKind,
    streak: 0,
    bestStreak: 0,
    difficulty: "medium" as Difficulty,
    /** Só se aplica ao quiz de intervalo: tocar as duas notas juntas ou em sequência. */
    intervalPlaybackMode: "melodic" as IntervalPlaybackMode,
    /** Só no intervalo melódico: subindo, descendo ou sorteado por questão. */
    intervalDirection: "ascending" as IntervalDirection,
    /** Só se aplica ao quiz de escala: tocar subindo, descendo ou os dois. */
    scaleDirection: "ascending" as ScaleDirection,
    /** Só se aplica ao quiz de qualidade de acorde: sempre fundamental ou com inversões sorteadas. */
    chordVoicing: "root" as ChordVoicing,
    /** Sorteia timbre e andamento a cada questão, para o ouvido não ancorar num som só. */
    varySound: false,
    /** "Personalizar": ids escolhidos por tipo de quiz (mantidos mesmo com o modo desligado). */
    customItems: {} as Partial<Record<QuizKind, string[]>>,
    /** "Personalizar" ligado por tipo de quiz: o conjunto escolhido substitui o pool da dificuldade. */
    customActive: {} as Partial<Record<QuizKind, boolean>>,
  }),
  persist: true,
});
