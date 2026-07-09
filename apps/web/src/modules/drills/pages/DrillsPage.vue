<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import { useFlashcardDrill } from "../application/use-flashcard-drill";
import { useFretboardDrill } from "../application/use-fretboard-drill";
import { DrillFretboard } from "../components/drill-fretboard";
import { Flashcard } from "../components/flashcard";
import { EmptyState } from "@/modules/shared/components/empty-state";

const { t } = useI18n();

const section = ref<"fretboard" | "flashcards">("fretboard");

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

const { deckSize, dueCount, current, isSessionComplete, isRevealed, reveal, grade } = useFlashcardDrill();

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

    <toggle-group-root
      v-model="section"
      type="single"
      :aria-label="t('drills.title')"
      class="inline-flex w-fit gap-1 rounded-lg border border-border bg-card/40 p-1"
    >
      <toggle-group-item
        value="fretboard"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        {{ t("drills.sections.fretboard") }}
      </toggle-group-item>
      <toggle-group-item
        value="flashcards"
        class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        {{ t("drills.sections.flashcards") }}
      </toggle-group-item>
    </toggle-group-root>

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
            {{ isActive ? t("drills.fretboard.restart") : t("drills.fretboard.start") }}
          </button>
        </div>
      </div>

      <p v-if="isActive" class="text-sm font-mono text-muted-foreground">
        {{ formatMs(elapsedMs) }}
      </p>

      <drill-fretboard :positions="positions" :found-keys="foundKeys" :wrong-key="wrongKey" @guess="guess" />
    </section>

    <section v-else class="space-y-4">
      <p class="text-sm text-muted-foreground">
        {{ t("drills.flashcards.due", { due: dueCount, total: deckSize }) }}
      </p>

      <flashcard
        v-if="current"
        :key="current.id"
        :prompt="current.prompt"
        :answer="current.answer"
        :revealed="isRevealed"
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
