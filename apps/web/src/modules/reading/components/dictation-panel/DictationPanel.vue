<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { Play, RotateCcw } from "@lucide/vue";

import { useDictation } from "../../application/use-dictation";
import { DICTATION_LEVEL_IDS, type DictationLevelId } from "../../application/reading-types";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { StaffNotation } from "@/modules/shared/components/staff-notation";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

const {
  level,
  score,
  streak,
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
} = useDictation();

const { t } = useI18n();

const scorePercent = computed(() =>
  score.value.total === 0 ? null : Math.round((score.value.correct / score.value.total) * 100),
);

const nextButton = useTemplateRef<HTMLButtonElement>("nextButton");

// Move o foco para "Next" quando a resposta é revelada (WCAG 4.1.3 — o foco não pode evaporar).
watch(isAnswered, (answered) => {
  if (!answered) return;

  nextTick(() => nextButton.value?.focus());
});

function optionClass(index: number): string {
  if (selectedIndex.value === null) {
    return "border-border bg-card/40 hover:bg-accent/40 cursor-pointer";
  }

  if (index === correctIndex.value) return "border-brand bg-brand-soft cursor-default";
  if (index === selectedIndex.value) return "border-destructive bg-destructive/10 cursor-default";

  return "border-border bg-card/20 opacity-60 cursor-default";
}

/** Atalhos de teclado: 1-3 escolhem a opção, R repete a frase, Enter/Espaço avança. */
function handleKeydown(event: KeyboardEvent) {
  if (event.key >= "1" && event.key <= "3") {
    if (!isAnswered.value) answer(Number(event.key) - 1);
    return;
  }

  if (event.key.toLowerCase() === "r") {
    replay();
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && isAnswered.value) {
    // Foco já no botão Next: deixa a ativação nativa cuidar (senão avançaria duas vezes).
    if (event.target === nextButton.value) return;

    event.preventDefault();
    next();
  }
}

useTypingGuardedKeydown(handleKeydown);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <chip-toggle-group
        :model-value="level"
        type="single"
        :aria-label="t('reading.dictation.levelLabel')"
        wrap
        @update:model-value="(value) => value && setLevel(value as DictationLevelId)"
      >
        <chip-toggle-item
          v-for="levelId in DICTATION_LEVEL_IDS"
          :key="levelId"
          :value="levelId"
          class="px-3 py-1 text-xs"
        >
          {{ t(`reading.dictation.levels.${levelId}`) }}
        </chip-toggle-item>
      </chip-toggle-group>

      <div class="flex items-center gap-3">
        <p class="text-sm text-muted-foreground">
          {{ t("reading.dictation.score", { correct: score.correct, total: score.total }) }}
          <span v-if="scorePercent !== null">· {{ scorePercent }}%</span>
          <span v-if="streak > 1">· 🔥{{ streak }}</span>
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :title="t('reading.dictation.resetScore')"
          :aria-label="t('reading.dictation.resetScore')"
          @click="resetScore"
        >
          <rotate-ccw class="size-3.5" />
        </button>
      </div>
    </div>

    <section class="space-y-5 rounded-xl border border-border bg-card/40 p-6">
      <div class="flex flex-col items-center gap-3 text-center">
        <h2 v-if="hasPlayedFirst" class="text-sm font-medium text-foreground">
          {{ t("reading.dictation.prompt") }}
        </h2>
        <p v-else class="text-sm font-medium text-foreground">
          {{ t("reading.dictation.firstPlayHint") }}
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="replay"
        >
          <play class="size-5" :class="{ 'animate-pulse': isPlaying }" />
          {{ hasPlayedFirst ? t("reading.dictation.replay") : t("reading.dictation.play") }}
        </button>
      </div>

      <div
        role="group"
        :aria-label="t('reading.dictation.optionsLabel')"
        class="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        <button
          v-for="(option, index) in question.options"
          :key="index"
          type="button"
          :aria-disabled="isAnswered"
          :aria-label="t('reading.dictation.optionLabel', { number: index + 1 })"
          class="relative rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="optionClass(index)"
          @click="!isAnswered && answer(index)"
        >
          <span
            aria-hidden="true"
            class="absolute left-2 top-2 inline-flex size-5 items-center justify-center rounded border border-current/30 text-[10px] font-semibold text-muted-foreground"
          >{{ index + 1 }}</span>
          <staff-notation
            :passage="option"
            :ariaLabel="t('reading.dictation.optionLabel', { number: index + 1 })"
            :highlights="isAnswered && index === correctIndex ? highlights : {}"
            :show-time-signature="false"
            compact
          />
        </button>
      </div>

      <p class="text-center text-xs text-muted-foreground">
        {{ t("reading.dictation.shortcutHint") }}
      </p>

      <div class="flex min-h-[52px] flex-wrap items-center justify-between gap-4">
        <p
          v-if="isAnswered"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="text-sm font-medium"
          :class="isCorrect ? 'text-brand' : 'text-destructive'"
        >
          {{ isCorrect ? t("reading.dictation.correct") : t("reading.dictation.incorrect") }}
        </p>

        <button
          v-if="isAnswered"
          ref="nextButton"
          type="button"
          class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="next"
        >
          {{ t("reading.dictation.next") }}
        </button>
      </div>
    </section>
  </div>
</template>
