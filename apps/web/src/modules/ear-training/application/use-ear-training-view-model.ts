import { computed, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { Pitch } from "@music-workspace/music-theory";

import { useStudyActivity } from "@/modules/learn/application/use-study-activity";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import type { TermLabel } from "@/modules/shared/application/music-terms";

import { clearItemStats, recordItemAnswer, weakestItems } from "./item-stats";
import {
  generateQuestion,
  labelForItem,
  pitchesForItem,
  pitchesForOption,
  type Difficulty,
  type QuizKind,
} from "./question-generators";
import { useEarTrainingStore } from "./use-ear-training-store";

/** Duração estimada do playback (ms), já que o composable de áudio não expõe fim/Promise. */
function estimatePlaybackDurationMs(pitchCount: number, asChord: boolean): number {
  return asChord ? 700 : pitchCount * 450 + 200;
}

/** Fundamental fixa do painel de pontos fracos: ouvir o item "puro", sem sorteio de tom. */
const WEAK_ITEM_ROOT = () => Pitch.from("C", 4);

/** Quantos pontos fracos o painel lista. */
const WEAK_ITEMS_LIMIT = 3;

export interface WeakItemView {
  id: string;
  label: TermLabel;
  /** 0..100 */
  accuracyPercent: number;
  correct: number;
  total: number;
  confusion: { id: string; label: TermLabel; count: number } | null;
}

export function useEarTrainingViewModel() {
  const store = useEarTrainingStore();
  const { scores, streak, bestStreak, difficulty, intervalPlaybackMode } = storeToRefs(store);

  const { playChord, playSequence } = useNoteAudio();
  const { recordActivity } = useStudyActivity();

  const kind = ref<QuizKind>("interval");
  const question = ref(generateQuestion(kind.value, difficulty.value, { stats: store }));
  const selectedOptionId = ref<string | null>(null);

  /** Liga durante o playback (estimado) para animar o botão Play; nunca tocou = estado inicial silencioso. */
  const isPlaying = ref(false);
  const hasPlayedFirst = ref(false);
  let playingTimeout: ReturnType<typeof setTimeout> | null = null;

  const isAnswered = computed(() => selectedOptionId.value !== null);
  const isCorrect = computed(() => selectedOptionId.value === question.value.correctId);

  /** Placar do tipo de quiz ativo (cada tipo persiste o seu, não um total global). */
  const score = computed(() => scores.value[kind.value]);

  function playPitches(pitches: Pitch[], asChord: boolean) {
    if (playingTimeout) clearTimeout(playingTimeout);

    isPlaying.value = true;
    hasPlayedFirst.value = true;

    if (asChord) {
      playChord(pitches, { strum: true });
    } else {
      playSequence(pitches);
    }

    playingTimeout = setTimeout(() => {
      isPlaying.value = false;
    }, estimatePlaybackDurationMs(pitches.length, asChord));
  }

  function isChordPlayback(playedKind: QuizKind, playback: "chord" | "sequence") {
    return playback === "chord" || (playedKind === "interval" && intervalPlaybackMode.value === "harmonic");
  }

  function asChordPlayback() {
    return isChordPlayback(question.value.kind, question.value.playback);
  }

  /** Intervalo tocado junto (harmônico) quando o usuário escolhe esse modo; o resto segue o playback da questão. */
  function replay() {
    playPitches(question.value.pitches, asChordPlayback());
  }

  /** Reouve a opção escolhida ou a correta, para comparar após errar (não altera o placar). */
  function playOption(optionId: string) {
    playPitches(pitchesForOption(question.value, optionId), asChordPlayback());
  }

  function playYourAnswer() {
    if (selectedOptionId.value) playOption(selectedOptionId.value);
  }

  function playCorrectAnswer() {
    playOption(question.value.correctId);
  }

  /** Pontos fracos do tipo de quiz ativo (mín. de tentativas e ordenação em `weakestItems`). */
  const weakItems = computed<WeakItemView[]>(() => {
    const activeKind = kind.value;

    return weakestItems(store, activeKind, WEAK_ITEMS_LIMIT).map((item) => ({
      id: item.id,
      label: labelForItem(activeKind, item.id),
      accuracyPercent: Math.round(item.accuracy * 100),
      correct: item.correct,
      total: item.total,
      confusion: item.topConfusion
        ? { ...item.topConfusion, label: labelForItem(activeKind, item.topConfusion.id) }
        : null,
    }));
  });

  /** Toca um item (ou sua confusão) isolado, numa fundamental fixa — para comparar de ouvido. */
  function playItem(itemId: string) {
    const pitches = pitchesForItem(kind.value, itemId, WEAK_ITEM_ROOT());
    if (!pitches) return;

    playPitches(pitches, isChordPlayback(kind.value, kind.value === "chordQuality" ? "chord" : "sequence"));
  }

  onUnmounted(() => {
    if (playingTimeout) clearTimeout(playingTimeout);
  });

  function newQuestion() {
    question.value = generateQuestion(kind.value, difficulty.value, { stats: store });
    selectedOptionId.value = null;
    replay();
  }

  function selectKind(next: QuizKind) {
    if (kind.value === next) return;

    kind.value = next;
    newQuestion();
  }

  function selectDifficulty(next: Difficulty) {
    if (difficulty.value === next) return;

    difficulty.value = next;
    newQuestion();
  }

  function selectIntervalPlaybackMode(next: "harmonic" | "melodic") {
    intervalPlaybackMode.value = next;
  }

  function answer(optionId: string) {
    if (isAnswered.value) return;

    selectedOptionId.value = optionId;
    recordActivity();
    score.value.total += 1;
    recordItemAnswer(store, kind.value, question.value.correctId, optionId);

    if (optionId === question.value.correctId) {
      score.value.correct += 1;
      streak.value += 1;
      bestStreak.value = Math.max(bestStreak.value, streak.value);
    } else {
      streak.value = 0;
    }
  }

  /** Zera o placar (acertos/total) e o histórico por item só do tipo de quiz ativo. */
  function resetScore() {
    score.value.correct = 0;
    score.value.total = 0;
    clearItemStats(store, kind.value);
  }

  return {
    kind,
    question,
    selectedOptionId,
    isAnswered,
    isCorrect,
    score,
    streak,
    bestStreak,
    difficulty,
    intervalPlaybackMode,
    isPlaying,
    hasPlayedFirst,
    weakItems,

    replay,
    newQuestion,
    selectKind,
    selectDifficulty,
    selectIntervalPlaybackMode,
    answer,
    resetScore,
    playYourAnswer,
    playCorrectAnswer,
    playItem,
  };
}
