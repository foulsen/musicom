<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { RotateCcw } from "@lucide/vue";

import { KEY_SIGNATURE_LEVEL_IDS, type KeySignatureLevelId } from "../../application/reading-types";
import { useKeySignatureQuiz } from "../../application/use-key-signature-quiz";
import { AnswerOptions } from "@/modules/shared/components/answer-options";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { StaffNotation } from "@/modules/shared/components/staff-notation";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

const { t } = useI18n();

const {
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
} = useKeySignatureQuiz();

const nextButton = useTemplateRef<HTMLButtonElement>("nextButton");

// Foco no "Next" assim que a resposta é revelada (os botões de opção deixam de ser o alvo natural).
watch(isAnswered, (answered) => {
  if (!answered) return;

  nextTick(() => nextButton.value?.focus());
});

function staffOptionClass(optionId: string): string {
  if (!isAnswered.value) {
    return "border-border bg-card/40 text-foreground hover:bg-accent/40 cursor-pointer";
  }

  if (optionId === correctId.value) {
    return "border-brand bg-brand-soft text-brand-soft-foreground cursor-default";
  }

  if (optionId === selectedId.value) {
    return "border-destructive bg-destructive/10 text-destructive cursor-default";
  }

  return "border-border bg-card/20 text-muted-foreground opacity-60 cursor-default";
}

/** Atalhos: 1-4 escolhem a opção, Enter/Espaço avança. */
function handleKeydown(event: KeyboardEvent) {
  if (event.key >= "1" && event.key <= "4") {
    const option = question.value.optionFifths[Number(event.key) - 1];
    if (option !== undefined && !isAnswered.value) answer(String(option));
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && isAnswered.value) {
    // Foco já no botão Next: a ativação nativa avança (senão avançaria duas vezes).
    if (event.target === nextButton.value) return;

    event.preventDefault();
    newQuestion();
  }
}

useTypingGuardedKeydown(handleKeydown);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <chip-toggle-group
        :model-value="keyLevel"
        type="single"
        :aria-label="t('reading.level')"
        @update:model-value="(value) => value && selectLevel(value as KeySignatureLevelId)"
      >
        <chip-toggle-item
          v-for="levelId in KEY_SIGNATURE_LEVEL_IDS"
          :key="levelId"
          :value="levelId"
          class="px-3 py-1 text-xs"
        >
          {{ t(`reading.keys.levels.${levelId}`) }}
        </chip-toggle-item>
      </chip-toggle-group>

      <div class="flex items-center gap-3">
        <p class="text-sm text-muted-foreground">
          {{ t("reading.keys.score", { correct: keyScore.correct, total: keyScore.total }) }}
          <span v-if="scorePercent !== null">· {{ scorePercent }}%</span>
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :title="t('reading.keys.resetScore')"
          :aria-label="t('reading.keys.resetScore')"
          @click="resetScore"
        >
          <rotate-ccw class="size-3.5" />
        </button>
      </div>
    </div>

    <section class="space-y-5 rounded-xl border border-border bg-card/40 p-6">
      <div class="flex flex-col items-center gap-4 text-center">
        <template v-if="question.kind === 'name'">
          <h2 class="text-sm font-medium text-foreground">
            {{ t(`reading.keys.promptName.${question.mode}`) }}
          </h2>
          <staff-notation
            class="w-full max-w-xs"
            :passage="questionPassage"
            :ariaLabel="t('reading.keys.questionStaffLabel')"
            :show-time-signature="false"
            compact
          />
        </template>

        <h2 v-else class="text-sm font-medium text-foreground">
          {{ t("reading.keys.promptSignature", { key: promptKey }) }}
        </h2>
      </div>

      <answer-options
        v-if="question.kind === 'name'"
        :options="textOptions"
        :correct-id="correctId"
        :selected-id="selectedId"
        @select="answer"
      />

      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          v-for="(option, index) in staffOptions"
          :key="option.id"
          type="button"
          :aria-disabled="isAnswered"
          :aria-label="option.ariaLabel"
          class="relative rounded-lg border px-4 py-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="staffOptionClass(option.id)"
          @click="answer(option.id)"
        >
          <span
            aria-hidden="true"
            class="absolute left-2 top-2 inline-flex size-5 items-center justify-center rounded border border-current/30 text-[10px] font-semibold opacity-70"
          >{{ index + 1 }}</span>
          <staff-notation
            class="pointer-events-none"
            :passage="option.passage"
            :ariaLabel="option.ariaLabel"
            :show-time-signature="false"
            compact
          />
        </button>
      </div>

      <p class="text-center text-xs text-muted-foreground">
        {{ t("reading.keys.shortcutHint") }}
      </p>

      <div class="flex min-h-[52px] flex-wrap items-center justify-between gap-4">
        <div v-if="isAnswered" role="status" aria-live="polite" aria-atomic="true" class="space-y-0.5">
          <p class="text-sm font-medium" :class="isCorrect ? 'text-brand' : 'text-destructive'">
            {{ isCorrect ? t("reading.keys.correct") : t("reading.keys.incorrect") }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ feedbackText }}
          </p>
        </div>

        <button
          v-if="isAnswered"
          ref="nextButton"
          type="button"
          class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="newQuestion"
        >
          {{ t("reading.keys.next") }}
        </button>
      </div>
    </section>
  </div>
</template>
