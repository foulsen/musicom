<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { Play, RotateCcw } from "@lucide/vue";

import { MIN_WEAK_ATTEMPTS } from "../application/item-stats";
import { useEarTrainingViewModel } from "../application/use-ear-training-view-model";
import type { Difficulty, QuizKind } from "../application/question-generators";
import { AnswerOptions } from "@/modules/shared/components/answer-options";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { useMusicTerms } from "@/modules/shared/application/music-terms";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

const {
  kind,
  question,
  selectedOptionId,
  isAnswered,
  isCorrect,
  score,
  streak,
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
} = useEarTrainingViewModel();

const { t } = useI18n();
const { label } = useMusicTerms();

const KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const scorePercent = computed(() =>
  score.value.total === 0 ? null : Math.round((score.value.correct / score.value.total) * 100),
);

const nextButton = useTemplateRef<HTMLButtonElement>("nextButton");

// Move o foco para o botão "Next" assim que a resposta é revelada, já que os
// botões de opção deixam de ser o alvo natural (WCAG 4.1.3 — foco não pode evaporar).
watch(isAnswered, (answered) => {
  if (!answered) return;

  nextTick(() => nextButton.value?.focus());
});

/** Atalhos de teclado: 1-4 escolhem a opção, R repete o áudio, Enter/Espaço avança. */
function handleKeydown(event: KeyboardEvent) {
  if (event.key >= "1" && event.key <= "4") {
    const option = question.value.options[Number(event.key) - 1];
    if (option && !isAnswered.value) answer(option.id);
    return;
  }

  if (event.key.toLowerCase() === "r") {
    replay();
    return;
  }

  if ((event.key === "Enter" || event.key === " ") && isAnswered.value) {
    // Se o foco já está no botão Next, deixa a ativação nativa cuidar disso
    // (senão a questão avançaria duas vezes: uma pelo handler, outra pelo clique nativo).
    if (event.target === nextButton.value) return;

    event.preventDefault();
    newQuestion();
  }
}

useTypingGuardedKeydown(handleKeydown);
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("earTraining.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("earTraining.subtitle") }}
      </p>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <chip-toggle-group
        :model-value="kind"
        type="single"
        :aria-label="t('earTraining.quizType')"
        @update:model-value="(value) => value && selectKind(value as QuizKind)"
      >
        <chip-toggle-item
          v-for="option in KINDS"
          :key="option"
          :value="option"
          class="px-3 py-1.5 text-sm"
        >
          {{ t(`earTraining.kinds.${option}`) }}
        </chip-toggle-item>
      </chip-toggle-group>

      <div class="flex items-center gap-3">
        <p class="text-sm text-muted-foreground">
          {{ t("earTraining.scoreByKind", { kind: t(`earTraining.kinds.${kind}`), correct: score.correct, total: score.total }) }}
          <span v-if="scorePercent !== null">· {{ scorePercent }}%</span>
          <span v-if="streak > 1">· 🔥{{ streak }}</span>
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :title="t('earTraining.resetScore')"
          @click="resetScore"
        >
          <rotate-ccw class="size-3.5" />
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <chip-toggle-group
        :model-value="difficulty"
        type="single"
        :aria-label="t('earTraining.difficulty')"
        @update:model-value="(value) => value && selectDifficulty(value as Difficulty)"
      >
        <chip-toggle-item
          v-for="option in DIFFICULTIES"
          :key="option"
          :value="option"
          class="px-3 py-1 text-xs"
        >
          {{ t(`earTraining.difficulties.${option}`) }}
        </chip-toggle-item>
      </chip-toggle-group>

      <chip-toggle-group
        v-if="kind === 'interval'"
        :model-value="intervalPlaybackMode"
        type="single"
        :aria-label="t('earTraining.intervalPlaybackMode')"
        @update:model-value="(value) => value && selectIntervalPlaybackMode(value as 'harmonic' | 'melodic')"
      >
        <chip-toggle-item value="melodic" class="px-3 py-1 text-xs">
          {{ t("earTraining.melodic") }}
        </chip-toggle-item>
        <chip-toggle-item value="harmonic" class="px-3 py-1 text-xs">
          {{ t("earTraining.harmonic") }}
        </chip-toggle-item>
      </chip-toggle-group>
    </div>

    <section class="space-y-5 rounded-xl border border-border bg-card/40 p-6">
      <div class="flex flex-col items-center gap-3 text-center">
        <h2 v-if="hasPlayedFirst" class="text-sm font-medium text-foreground">
          {{ t(`earTraining.prompts.${question.kind}`) }}
        </h2>
        <p v-else class="text-sm font-medium text-foreground">
          {{ t("earTraining.firstPlayHint") }}
        </p>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="replay"
        >
          <play class="size-5" :class="{ 'animate-pulse': isPlaying }" />
          {{ hasPlayedFirst ? t("earTraining.playAgain") : t("earTraining.play") }}
        </button>

        <p v-if="hasPlayedFirst && !isAnswered" class="text-xs text-muted-foreground">
          {{ t("earTraining.clickPlayHint") }}
        </p>
      </div>

      <answer-options
        :options="question.options"
        :correct-id="question.correctId"
        :selected-id="selectedOptionId"
        @select="answer"
      />

      <p class="text-center text-xs text-muted-foreground">
        {{ t("earTraining.shortcutHint") }}
      </p>

      <div class="flex min-h-[52px] flex-wrap items-center justify-between gap-4">
        <div v-if="isAnswered" role="status" aria-live="polite" aria-atomic="true" class="flex flex-wrap items-center gap-3">
          <p class="text-sm font-medium" :class="isCorrect ? 'text-brand' : 'text-destructive'">
            {{ isCorrect ? t("earTraining.correct") : t("earTraining.incorrect") }}
          </p>

          <template v-if="!isCorrect">
            <button
              type="button"
              class="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="playYourAnswer"
            >
              {{ t("earTraining.listenYourAnswer") }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="playCorrectAnswer"
            >
              {{ t("earTraining.listenCorrectAnswer") }}
            </button>
          </template>
        </div>

        <button
          v-if="isAnswered"
          ref="nextButton"
          type="button"
          class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="newQuestion"
        >
          {{ t("earTraining.next") }}
        </button>
      </div>
    </section>

    <section aria-labelledby="weak-points-title" class="space-y-3 rounded-xl border border-border bg-card/40 p-6">
      <div class="space-y-1">
        <h2 id="weak-points-title" class="text-sm font-medium text-foreground">
          {{ t("earTraining.weakPoints.title") }}
          <span class="font-normal text-muted-foreground">· {{ t(`earTraining.kinds.${kind}`) }}</span>
        </h2>
        <p v-if="weakItems.length > 0" class="text-xs text-muted-foreground">
          {{ t("earTraining.weakPoints.hint") }}
        </p>
      </div>

      <p v-if="weakItems.length === 0" class="text-sm text-muted-foreground">
        {{ t("earTraining.weakPoints.empty", { min: MIN_WEAK_ATTEMPTS }) }}
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="item in weakItems"
          :key="item.id"
          class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border px-4 py-3"
        >
          <div class="space-y-0.5">
            <p class="text-sm font-medium capitalize text-foreground">
              {{ label(item.label) }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t("earTraining.weakPoints.accuracy", { percent: item.accuracyPercent, correct: item.correct, total: item.total }) }}
              <template v-if="item.confusion">
                · {{ t("earTraining.weakPoints.confuses", { item: label(item.confusion.label) }) }}
              </template>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium capitalize text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :aria-label="t('earTraining.weakPoints.listen', { item: label(item.label) })"
              @click="playItem(item.id)"
            >
              <play class="size-3.5" />
              {{ label(item.label) }}
            </button>
            <button
              v-if="item.confusion"
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium capitalize text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :aria-label="t('earTraining.weakPoints.listen', { item: label(item.confusion.label) })"
              @click="playItem(item.confusion.id)"
            >
              <play class="size-3.5" />
              {{ label(item.confusion.label) }}
            </button>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>
