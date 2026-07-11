<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { AnswerOptions } from "@/modules/shared/components/answer-options";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

import type { CheckpointQuestion } from "../../application/checkpoint-generators";

const props = defineProps<{
  questions: CheckpointQuestion[];
}>();

const emit = defineEmits<{
  complete: [{ correct: number; total: number }];
}>();

const { t } = useI18n();

const index = ref(0);
const selectedOptionId = ref<string | null>(null);
const correctCount = ref(0);

// Reinicia se o conjunto de perguntas mudar (nova visita ao passo).
watch(
  () => props.questions,
  () => {
    index.value = 0;
    selectedOptionId.value = null;
    correctCount.value = 0;
  },
);

const question = computed<CheckpointQuestion | null>(() => props.questions[index.value] ?? null);
const isAnswered = computed(() => selectedOptionId.value !== null);
const isCorrect = computed(() => selectedOptionId.value === question.value?.correctId);
const isLastQuestion = computed(() => index.value === props.questions.length - 1);

function answer(optionId: string) {
  if (isAnswered.value || !question.value) return;

  selectedOptionId.value = optionId;
  if (optionId === question.value.correctId) correctCount.value += 1;
}

function next() {
  if (isLastQuestion.value) {
    emit("complete", { correct: correctCount.value, total: props.questions.length });
    return;
  }

  index.value += 1;
  selectedOptionId.value = null;
}

const nextButton = useTemplateRef<HTMLButtonElement>("nextButton");

// Move o foco para "Próxima"/"Concluir" assim que a resposta é revelada — mesmo padrão do
// Ear Training: os botões de opção deixam de ser o alvo natural (WCAG 4.1.3, foco não evapora).
watch(isAnswered, (answered) => {
  if (!answered) return;

  nextTick(() => nextButton.value?.focus());
});

/** Atalhos: 1-N escolhem a opção, Enter/Espaço avança depois de respondido. */
function handleKeydown(event: KeyboardEvent) {
  if (event.key >= "1" && event.key <= "9") {
    const option = question.value?.options[Number(event.key) - 1];
    if (option && !isAnswered.value) answer(option.id);
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && isAnswered.value) {
    if (event.target === nextButton.value) return;

    event.preventDefault();
    next();
  }
}

useTypingGuardedKeydown(handleKeydown);
</script>

<template>
  <section v-if="question" class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
    <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {{ t("learn.checkpointProgress", { current: index + 1, total: questions.length }) }}
    </p>

    <p class="text-base font-medium text-foreground">
      {{ t(question.promptKey, question.promptParams ?? {}) }}
    </p>

    <answer-options
      :options="question.options"
      :correct-id="question.correctId"
      :selected-id="selectedOptionId"
      @select="answer"
    />

    <p v-if="!isAnswered" class="text-xs text-muted-foreground">
      {{ t("learn.checkpointShortcutHint") }}
    </p>

    <div v-if="isAnswered" role="status" aria-live="polite" class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm font-medium" :class="isCorrect ? 'text-brand' : 'text-destructive'">
        {{ isCorrect ? t("learn.checkpointCorrect") : t("learn.checkpointIncorrect") }}
      </p>

      <button
        ref="nextButton"
        type="button"
        class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="next"
      >
        {{ isLastQuestion ? t("learn.checkpointFinish") : t("learn.checkpointNext") }}
      </button>
    </div>
  </section>
</template>
