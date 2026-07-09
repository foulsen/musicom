import { computed, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import type { Pitch } from "@music-workspace/music-theory";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { generateQuestion, pitchesForOption, type Difficulty, type QuizKind } from "./question-generators";
import { useEarTrainingStore } from "./use-ear-training-store";

/** Duração estimada do playback (ms), já que o composable de áudio não expõe fim/Promise. */
function estimatePlaybackDurationMs(pitchCount: number, asChord: boolean): number {
  return asChord ? 700 : pitchCount * 450 + 200;
}

export function useEarTrainingViewModel() {
  const store = useEarTrainingStore();
  const { scores, streak, bestStreak, difficulty, intervalPlaybackMode } = storeToRefs(store);

  const { playChord, playSequence } = useNoteAudio();

  const kind = ref<QuizKind>("interval");
  const question = ref(generateQuestion(kind.value, difficulty.value));
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

  function asChordPlayback() {
    return question.value.playback === "chord" ||
      (question.value.kind === "interval" && intervalPlaybackMode.value === "harmonic");
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

  onUnmounted(() => {
    if (playingTimeout) clearTimeout(playingTimeout);
  });

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
    isPlaying,
    hasPlayedFirst,

    replay,
    newQuestion,
    selectKind,
    selectDifficulty,
    selectIntervalPlaybackMode,
    answer,
    resetScore,
    playYourAnswer,
    playCorrectAnswer,
  };
}
