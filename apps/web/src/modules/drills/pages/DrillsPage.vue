<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { useFlashcardDrill } from "../application/use-flashcard-drill";
import { useFretboardDrill } from "../application/use-fretboard-drill";
import type { DeckId } from "../application/flashcard-decks";
import { DrillFretboard } from "../components/drill-fretboard";
import { Flashcard } from "../components/flashcard";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { EmptyState } from "@/modules/shared/components/empty-state";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

type Section = "fretboard" | "flashcards";

/** Aba ativa reflete `route.query.tab`: sobrevive à navegação e é linkável. */
const section = computed<Section>(() => (route.query.tab === "flashcards" ? "flashcards" : "fretboard"));

function setSection(value: unknown) {
  const next = Array.isArray(value) ? value[0] : value;
  if (typeof next !== "string" || !next) return;

  router.replace({ query: { ...route.query, tab: next } });
}

const {
  positions,
  targetNote,
  foundKeys,
  wrongKey,
  isActive,
  isComplete,
  elapsedMs,
  totalTargets,
  bestMs,
  naturalsOnly,
  setNaturalsOnly,
  start,
  guess,
} = useFretboardDrill();

const progressAnnounce = computed(() =>
  isActive.value ? t("drills.fretboard.progressAnnounce", { found: foundKeys.value.size, total: totalTargets.value }) : "",
);

const {
  deckIds,
  activeDeckId,
  selectDeck,
  deckSize,
  dueCount,
  current,
  isSessionComplete,
  isFreePractice,
  isRevealed,
  reveal,
  grade,
  currentBox,
  boxCount,
  sessionPosition,
  sessionSize,
} = useFlashcardDrill();

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("drills.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("drills.subtitle") }}
      </p>
    </header>

    <chip-toggle-group
      :model-value="section"
      type="single"
      :aria-label="t('drills.title')"
      class="w-fit"
      @update:model-value="setSection"
    >
      <chip-toggle-item value="fretboard" class="px-3 py-1.5 text-sm">
        {{ t("drills.sections.fretboard") }}
      </chip-toggle-item>
      <chip-toggle-item value="flashcards" class="px-3 py-1.5 text-sm">
        {{ t("drills.sections.flashcards") }}
      </chip-toggle-item>
    </chip-toggle-group>

    <section v-if="section === 'fretboard'" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-foreground">
          <template v-if="isActive">
            {{ t("drills.fretboard.findAll", { note: targetNote.toString() }) }}
            <span class="text-muted-foreground">({{ foundKeys.size }}/{{ totalTargets }})</span>
          </template>
          <template v-else-if="isComplete">
            {{ t("drills.fretboard.complete", { time: formatMs(elapsedMs) }) }}
          </template>
          <template v-else>
            {{ t("drills.fretboard.intro") }}
          </template>
        </p>

        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded-md border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="naturalsOnly
              ? 'border-brand-soft bg-brand-soft text-brand-soft-foreground'
              : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'"
            :aria-pressed="naturalsOnly"
            @click="setNaturalsOnly(!naturalsOnly)"
          >
            {{ t("drills.fretboard.naturalsOnly") }}
          </button>

          <p v-if="bestMs > 0" class="text-xs text-muted-foreground">
            {{ t("drills.fretboard.best", { time: formatMs(bestMs) }) }}
          </p>

          <button
            type="button"
            class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="start"
          >
            {{ isActive ? t("drills.fretboard.restart") : (isComplete ? t("drills.fretboard.playAgain") : t("drills.fretboard.start")) }}
          </button>
        </div>
      </div>

      <!-- Slot de largura reservada: o cronômetro não desloca o layout ao aparecer/sumir. -->
      <p class="text-sm font-mono tabular-nums text-muted-foreground" :style="{ visibility: isActive ? 'visible' : 'hidden' }">
        {{ formatMs(elapsedMs) }}
      </p>

      <p aria-live="polite" class="sr-only">
        {{ progressAnnounce }}
      </p>

      <drill-fretboard :positions="positions" :found-keys="foundKeys" :wrong-key="wrongKey" :active="isActive || isComplete" @guess="guess" />

      <div
        v-if="isComplete"
        class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-soft bg-brand-soft/30 p-4"
      >
        <div>
          <p class="text-sm font-medium text-foreground">
            {{ t("drills.fretboard.complete", { time: formatMs(elapsedMs) }) }}
          </p>
          <p v-if="bestMs > 0" class="text-xs text-muted-foreground">
            {{ t("drills.fretboard.best", { time: formatMs(bestMs) }) }}
          </p>
        </div>

        <button
          type="button"
          class="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="start"
        >
          {{ t("drills.fretboard.playAgain") }}
        </button>
      </div>
    </section>

    <section v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <chip-toggle-group
          :model-value="activeDeckId"
          type="single"
          wrap
          :aria-label="t('drills.flashcards.deck')"
          @update:model-value="(value) => value && selectDeck(value as DeckId)"
        >
          <chip-toggle-item
            v-for="id in deckIds"
            :key="id"
            :value="id"
            class="px-3 py-1 text-xs"
          >
            {{ t(`drills.flashcards.decks.${id}`) }}
          </chip-toggle-item>
        </chip-toggle-group>

        <p class="text-sm text-muted-foreground">
          {{ t("drills.flashcards.due", { due: dueCount, total: deckSize }) }}
        </p>
      </div>

      <p v-if="isFreePractice && current" class="w-fit rounded-md bg-brand-soft px-3 py-1 text-xs font-medium text-brand-soft-foreground">
        {{ t("drills.flashcards.freePractice") }}
      </p>

      <flashcard
        v-if="current"
        :key="current.id"
        :prompt="current.prompt"
        :answer="current.answer"
        :revealed="isRevealed"
        :box="currentBox"
        :box-count="boxCount"
        :position="sessionPosition"
        :total="sessionSize"
        @reveal="reveal"
        @grade="grade"
      />

      <empty-state
        v-else-if="isSessionComplete"
        :title="t('drills.flashcards.done')"
        :description="t('drills.flashcards.doneDescription')"
      />
    </section>
  </section>
</template>
