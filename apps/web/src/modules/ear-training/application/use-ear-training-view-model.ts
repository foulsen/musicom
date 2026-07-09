import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { generateQuestion, type Difficulty, type QuizKind } from "./question-generators";
import { useEarTrainingStore } from "./use-ear-training-store";

export function useEarTrainingViewModel() {
  const store = useEarTrainingStore();
  const { scores, streak, bestStreak, difficulty, intervalPlaybackMode } = storeToRefs(store);

  const { playChord, playSequence } = useNoteAudio();

  const kind = ref<QuizKind>("interval");
  const question = ref(generateQuestion(kind.value, difficulty.value));
  const selectedOptionId = ref<string | null>(null);

  const isAnswered = computed(() => selectedOptionId.value !== null);
  const isCorrect = computed(() => selectedOptionId.value === question.value.correctId);

  /** Placar do tipo de quiz ativo (cada tipo persiste o seu, não um total global). */
  const score = computed(() => scores.value[kind.value]);

  /** Intervalo tocado junto (harmônico) quando o usuário escolhe esse modo; o resto segue o playback da questão. */
  function replay() {
    const asChord = question.value.playback === "chord" ||
      (question.value.kind === "interval" && intervalPlaybackMode.value === "harmonic");

    if (asChord) {
      playChord(question.value.pitches, { strum: true });
    } else {
      playSequence(question.value.pitches);
    }
  }

  function newQuestion() {
    question.value = generateQuestion(kind.value, difficulty.value);
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
    score.value.total += 1;

    if (optionId === question.value.correctId) {
      score.value.correct += 1;
      streak.value += 1;
      bestStreak.value = Math.max(bestStreak.value, streak.value);
    } else {
      streak.value = 0;
    }
  }

  /** Zera o placar (acertos/total) só do tipo de quiz ativo. */
  function resetScore() {
    score.value.correct = 0;
    score.value.total = 0;
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

    replay,
    newQuestion,
    selectKind,
    selectDifficulty,
    selectIntervalPlaybackMode,
    answer,
    resetScore,
  };
}
