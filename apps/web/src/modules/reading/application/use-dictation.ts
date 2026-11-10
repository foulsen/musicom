import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { passageSignature } from "@music-workspace/music-theory";

import { useStudyActivity } from "@/modules/learn/application/use-study-activity";
import { usePassagePlayback } from "@/modules/shared/application/notation/use-passage-playback";
import type { StaffHighlight } from "@/modules/shared/components/staff-notation";

import { DICTATION_BPM, generateDictation, type DictationQuestion } from "./dictation-generator";
import type { DictationLevelId } from "./reading-types";
import { useReadingStore } from "./use-reading-store";

/** Estado e ações do ditado melódico: ouve uma frase e escolhe, entre 3 partituras, a que foi tocada. */
export function useDictation() {
  const store = useReadingStore();
  const { dictationLevel, dictationScore, dictationStreak } = storeToRefs(store);

  const { recordActivity } = useStudyActivity();
  const { isPlaying, activeEventKey, play } = usePassagePlayback();

  const question = ref<DictationQuestion>(generateDictation(dictationLevel.value));
  const selectedIndex = ref<number | null>(null);
  /** O navegador só libera o áudio depois de um gesto: a 1ª frase espera o clique em Play. */
  const hasPlayedFirst = ref(false);

  const correctIndex = computed(() => {
    const signature = passageSignature(question.value.answer);

    return question.value.options.findIndex((option) => passageSignature(option) === signature);
  });
  const isAnswered = computed(() => selectedIndex.value !== null);
  const isCorrect = computed(() => selectedIndex.value === correctIndex.value);

  /** Depois de responder, a frase tocada acende na partitura certa, evento a evento. */
  const highlights = computed<Record<string, StaffHighlight>>(() => {
    const key = activeEventKey.value;

    return key !== null && isAnswered.value ? { [key]: "active" } : {};
  });

  function replay() {
    hasPlayedFirst.value = true;
    play(question.value.answer, { bpm: DICTATION_BPM, countIn: true, click: false });
  }

  function next() {
    question.value = generateDictation(dictationLevel.value);
    selectedIndex.value = null;

    // Só toca sozinho depois de o usuário já ter interagido com o áudio.
    if (hasPlayedFirst.value) replay();
  }

  function setLevel(levelId: DictationLevelId) {
    dictationLevel.value = levelId;
  }

  // Vale também para o nível vindo do deep-link (aplicado pela página depois de montar o painel).
  watch(dictationLevel, next);

  function answer(index: number) {
    if (isAnswered.value || index < 0 || index >= question.value.options.length) return;

    selectedIndex.value = index;
    recordActivity();

    const correct = index === correctIndex.value;
    dictationScore.value = {
      correct: dictationScore.value.correct + (correct ? 1 : 0),
      total: dictationScore.value.total + 1,
    };
    dictationStreak.value = correct ? dictationStreak.value + 1 : 0;
  }

  function resetScore() {
    dictationScore.value = { correct: 0, total: 0 };
    dictationStreak.value = 0;
  }

  return {
    level: dictationLevel,
    score: dictationScore,
    streak: dictationStreak,
    question,
    selectedIndex,
    correctIndex,
    isAnswered,
    isCorrect,
    isPlaying,
    hasPlayedFirst,
    highlights,
    replay,
    next,
    setLevel,
    answer,
    resetScore,
  };
}
