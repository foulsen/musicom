<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { Metronome, Play, SkipForward, Volume2 } from "@lucide/vue";

import { RHYTHM_LEVEL_IDS, type RhythmLevelId } from "../../application/reading-types";
import { useRhythmReading } from "../../application/use-rhythm-reading";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { StaffNotation } from "@/modules/shared/components/staff-notation";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

const {
  passage,
  level,
  bpm,
  metronome,
  phase,
  isBusy,
  highlights,
  tapCount,
  result,
  best,
  start,
  listen,
  next,
  tap,
  selectLevel,
} = useRhythmReading();

const { t } = useI18n();

const percent = (value: number) => Math.round(value * 100);
const bestPercent = computed(() => (best.value === undefined ? null : percent(best.value)));

/** Atalhos: Espaço bate (durante a execução) ou começa, L ouve, Enter passa para o próximo ritmo. */
function handleKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === " ") {
    event.preventDefault();
    if (event.repeat) return;

    if (phase.value === "running") tap();
    else start();
    return;
  }

  // Enter em um botão focado já o ativa nativamente — não avança duas vezes.
  if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    next();
    return;
  }

  if (event.key.toLowerCase() === "l") listen();
}

useTypingGuardedKeydown(handleKeydown);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <chip-toggle-group
        :model-value="level"
        type="single"
        :disabled="isBusy"
        :aria-label="t('reading.level')"
        wrap
        @update:model-value="(value) => value && selectLevel(value as RhythmLevelId)"
      >
        <chip-toggle-item v-for="id in RHYTHM_LEVEL_IDS" :key="id" :value="id" class="px-3 py-1 text-xs">
          {{ t(`reading.rhythm.levels.${id}`) }}
        </chip-toggle-item>
      </chip-toggle-group>

      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {{ t("reading.rhythm.bpm") }}
          <input
            v-model.number="bpm"
            type="range"
            min="40"
            max="140"
            step="5"
            :disabled="isBusy"
            :aria-valuetext="t('reading.rhythm.bpmValue', { bpm })"
            class="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-muted accent-brand disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span class="w-16 tabular-nums text-foreground">{{ t("reading.rhythm.bpmValue", { bpm }) }}</span>
        </label>

        <button
          type="button"
          role="switch"
          :aria-checked="metronome"
          :disabled="isBusy"
          class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          :class="metronome ? 'border-brand bg-brand/10 text-foreground' : 'border-border text-muted-foreground hover:bg-accent/40'"
          @click="metronome = !metronome"
        >
          <metronome class="size-3.5" />
          {{ t("reading.rhythm.metronome") }}
        </button>
      </div>
    </div>

    <section class="space-y-5 rounded-xl border border-border bg-card/40 p-6">
      <staff-notation
        :passage="passage"
        :ariaLabel="t('reading.rhythm.staffLabel', { time: passage.time.toString() })"
        :highlights="highlights"
      />

      <p class="text-center text-sm text-muted-foreground" aria-live="polite">
        <template v-if="phase === 'running'">{{ t("reading.rhythm.runningHint") }}</template>
        <template v-else-if="phase === 'listening'">{{ t("reading.rhythm.listeningHint") }}</template>
        <template v-else-if="phase === 'idle'">{{ t("reading.rhythm.tapHint") }}</template>
      </p>

      <div class="flex flex-col items-center gap-4">
        <button
          type="button"
          :disabled="phase !== 'running'"
          class="flex h-28 w-full max-w-sm touch-none select-none flex-col items-center justify-center gap-1 rounded-2xl border-2 text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-brand active:text-brand-foreground"
          :class="
            phase === 'running'
              ? 'border-brand bg-brand/10 text-foreground'
              : 'cursor-not-allowed border-border text-muted-foreground opacity-60'
          "
          @pointerdown.prevent="tap"
          @keydown.space.prevent
        >
          {{ t("reading.rhythm.tap") }}
          <span v-if="phase === 'running'" class="text-xs font-normal text-muted-foreground">
            {{ t("reading.rhythm.tapCount", { count: tapCount }) }}
          </span>
        </button>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            :disabled="isBusy"
            class="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            @click="start"
          >
            <play class="size-4" />
            {{ t("reading.rhythm.start") }}
          </button>
          <button
            type="button"
            :disabled="isBusy"
            class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            @click="listen"
          >
            <volume-2 class="size-4" :class="{ 'animate-pulse': phase === 'listening' }" />
            {{ t("reading.rhythm.listen") }}
          </button>
          <button
            type="button"
            :disabled="isBusy"
            class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            @click="next"
          >
            <skip-forward class="size-4" />
            {{ t("reading.rhythm.next") }}
          </button>
        </div>
      </div>

      <div v-if="result" role="status" aria-live="polite" class="space-y-1 text-center">
        <p class="text-base font-medium" :class="result.accuracy >= 0.8 ? 'text-brand' : 'text-foreground'">
          {{ t("reading.rhythm.result.accuracy", { percent: percent(result.accuracy) }) }}
          <span v-if="result.isNewBest" class="ml-1 text-sm text-brand">· {{ t("reading.rhythm.result.newBest") }}</span>
        </p>
        <p class="text-sm text-muted-foreground">
          {{
            t("reading.rhythm.result.summary", {
              hits: result.hits,
              total: result.expectedCount,
              extra: result.extraTaps,
            })
          }}
        </p>
        <p class="text-xs text-muted-foreground">{{ t("reading.rhythm.result.legend") }}</p>
      </div>

      <p v-if="bestPercent !== null" class="text-center text-xs text-muted-foreground">
        {{ t("reading.rhythm.result.best", { percent: bestPercent }) }}
      </p>

      <p class="text-center text-xs text-muted-foreground">
        {{ t("reading.rhythm.shortcutHint") }}
      </p>
    </section>
  </div>
</template>
