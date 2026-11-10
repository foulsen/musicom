import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

import { useStudyActivity } from "@/modules/learn/application/use-study-activity";
import type { QuizOption } from "@/modules/shared/application/quiz";

import { generateKeySignatureQuestion, keySignaturePassage, keyTonicName } from "./key-signature-quiz";
import type { KeySignatureLevelId } from "./reading-types";
import { useReadingStore } from "./use-reading-store";

export function useKeySignatureQuiz() {
  const { t } = useI18n();
  const store = useReadingStore();
  const { keyLevel, keyStats, keyScore } = storeToRefs(store);
  const { recordActivity } = useStudyActivity();

  const question = ref(generateKeySignatureQuestion(keyLevel.value, keyStats.value));
  const selectedId = ref<string | null>(null);

  const correctId = computed(() => String(question.value.correctFifths));
  const isAnswered = computed(() => selectedId.value !== null);
  const isCorrect = computed(() => selectedId.value === correctId.value);

  function keyName(fifths: number, mode: "major" | "minor"): string {
    return t(`reading.keys.${mode}`, { tonic: keyTonicName(fifths, mode) });
  }

  /** "3 sustenidos" / "2 bemóis" / "nenhum sustenido ou bemol" — usado no feedback e no rótulo acessível das pautas. */
  function signatureText(fifths: number): string {
    if (fifths === 0) return t("reading.keys.noAccidentals");

    const count = Math.abs(fifths);

    return fifths > 0 ? t("reading.keys.sharps", { count }, count) : t("reading.keys.flats", { count }, count);
  }

  /** Alvo da pergunta, quando a pergunta dá o tom ("Sol maior"). */
  const promptKey = computed(() => keyName(question.value.correctFifths, question.value.mode));

  /** Opções de texto (pergunta "name"): o tom de cada armadura, no modo sorteado. */
  const textOptions = computed<QuizOption[]>(() =>
    question.value.optionFifths.map((fifths) => ({ id: String(fifths), label: keyName(fifths, question.value.mode) })),
  );

  /** Pauta da pergunta "name": só a armadura correta. */
  const questionPassage = computed(() => keySignaturePassage(question.value.correctFifths));

  /** Opções de pauta (pergunta "signature"): uma pauta compacta por armadura, com rótulo acessível. */
  const staffOptions = computed(() =>
    question.value.optionFifths.map((fifths) => ({
      id: String(fifths),
      passage: keySignaturePassage(fifths),
      ariaLabel: t("reading.keys.staffLabel", { signature: signatureText(fifths) }),
    })),
  );

  /** "N sustenidos → X maior / Y menor" para a armadura correta. */
  const feedbackText = computed(() => {
    const fifths = question.value.correctFifths;

    return t("reading.keys.feedback", {
      signature: signatureText(fifths),
      major: keyName(fifths, "major"),
      minor: keyName(fifths, "minor"),
    });
  });

  const scorePercent = computed(() =>
    keyScore.value.total === 0 ? null : Math.round((keyScore.value.correct / keyScore.value.total) * 100),
  );

  function newQuestion() {
    question.value = generateKeySignatureQuestion(keyLevel.value, keyStats.value);
    selectedId.value = null;
  }

  function selectLevel(next: KeySignatureLevelId) {
    if (keyLevel.value === next) return;

    keyLevel.value = next;
    newQuestion();
  }

  function answer(optionId: string) {
    if (isAnswered.value) return;

    selectedId.value = optionId;
    recordActivity();

    const correct = optionId === correctId.value;
    const itemKey = question.value.itemKey;
    const previous = keyStats.value[itemKey] ?? { correct: 0, total: 0 };

    keyStats.value[itemKey] = { correct: previous.correct + (correct ? 1 : 0), total: previous.total + 1 };
    keyScore.value.total += 1;
    if (correct) keyScore.value.correct += 1;
  }

  /** Zera o placar e o histórico por tom (só desta aba). */
  function resetScore() {
    keyScore.value.correct = 0;
    keyScore.value.total = 0;
    keyStats.value = {};
  }

  return {
    keyLevel,
    keyScore,
    scorePercent,
    question,
    selectedId,
    correctId,
    isAnswered,
    isCorrect,
    promptKey,
    questionPassage,
    textOptions,
    staffOptions,
    feedbackText,
    newQuestion,
    selectLevel,
    answer,
    resetScore,
  };
}
