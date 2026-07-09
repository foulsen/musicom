import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { generateQuestion, type QuizKind } from "./question-generators";
import { useEarTrainingStore } from "./use-ear-training-store";

export function useEarTrainingViewModel() {
  const store = useEarTrainingStore();
  const { correct, total } = storeToRefs(store);

  const { playChord, playSequence } = useNoteAudio();

  const kind = ref<QuizKind>("interval");
  const question = ref(generateQuestion(kind.value));
  const selectedOptionId = ref<string | null>(null);

  const isAnswered = computed(() => selectedOptionId.value !== null);
  const isCorrect = computed(() => selectedOptionId.value === question.value.correctId);

  function replay() {
    if (question.value.playback === "chord") {
      playChord(question.value.pitches, { strum: true });
    } else {
      playSequence(question.value.pitches);
    }
  }

  function newQuestion() {
    question.value = generateQuestion(kind.value);
    selectedOptionId.value = null;
    replay();
  }

  function selectKind(next: QuizKind) {
    if (kind.value === next) return;

    kind.value = next;
    newQuestion();
  }

  function answer(optionId: string) {
    if (isAnswered.value) return;

    selectedOptionId.value = optionId;
    total.value += 1;

    if (optionId === question.value.correctId) {
      correct.value += 1;
    }
  }

  function resetScore() {
    correct.value = 0;
    total.value = 0;
  }

  return {
    kind,
    question,
    selectedOptionId,
    isAnswered,
    isCorrect,
    correct,
    total,

    replay,
    newQuestion,
    selectKind,
    answer,
    resetScore,
  };
}
