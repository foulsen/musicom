<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { Play as PlayIcon } from "@lucide/vue";

import { useModeExplorerViewModel } from "../application/use-mode-explorer-view-model";
import { ModeSelector } from "../components/mode-selector";

import { useMusicTerms } from "@/modules/shared/application/music-terms";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { FretRangeSelector } from "@/modules/shared/components/fret-range-selector";
import { HarmonicField } from "@/modules/shared/components/harmonic-field";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { LessonReturnBanner } from "@/modules/shared/components/lesson-return-banner";

const {
  selectedParentRoot,
  modes,
  selectedModeIndex,
  selectedMode,
  brightnessRank,
  brightnessOrder,
  selectModeByPatternName,
  notes,
  degrees,
  triads,
  sevenths,
  harmonicFieldMode,
  scalePitches,
  spelledByPitchClass,
  comparisonOptions,
  comparisonPattern,
  selectComparisonPattern,
  comparisonDegrees,
  differingDegreeIndexes,
  comparisonPitches,
  fretboardPositions,
  fretCount,
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
  returnLessonId,
} = useModeExplorerViewModel();

const { play, playChord, playSequence } = useNoteAudio();
const { t, locale } = useI18n();
const { scaleName } = useMusicTerms();

function listenToMode() {
  playSequence(scalePitches.value);
}

function listenToComparison() {
  playSequence(comparisonPitches.value);
}

/** Grau do modo, formatado por ordinal ("2nd" / "2º") para a frase-resumo do tom-pai. */
const degreeOrdinal = computed(() => {
  const degree = selectedMode.value.degree;

  if (locale.value.startsWith("pt")) return `${degree}º`;

  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = degree % 100;
  return `${degree}${suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0]}`;
});

/** Matiz de fundo sutil para cada pílula do eixo de brilho: quente (brilhante) -> frio (escuro). */
function brightnessHue(index: number): number {
  const ratio = index / Math.max(brightnessOrder.length - 1, 1);
  return 45 + (230 - 45) * ratio;
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <lesson-return-banner v-if="returnLessonId" :lesson-id="returnLessonId" />

    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("modeExplorer.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("modeExplorer.subtitle") }}
      </p>
    </header>

    <root-note-selector v-model="selectedParentRoot" :title="t('modeExplorer.parentKeyTitle')" />

    <mode-selector v-model="selectedModeIndex" :modes="modes" />

    <p class="text-sm text-muted-foreground">
      {{
        t("modeExplorer.relationSummary", {
          mode: `${selectedMode.scale.root.toString()} ${scaleName(selectedMode.pattern)}`,
          parentRoot: selectedParentRoot.toString(),
          degreeOrdinal,
        })
      }}
    </p>

    <p class="text-xs text-muted-foreground italic">
      {{ t("modeExplorer.notesUnchangedCaption") }}
    </p>

    <button
      type="button"
      class="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="listenToMode"
    >
      <play-icon class="size-4" />
      {{ t("modeExplorer.listenToMode", { mode: scaleName(selectedMode.pattern) }) }}
    </button>

    <section class="space-y-3">
      <header>
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("modeExplorer.brightness") }}
        </h2>
      </header>

      <ol class="flex flex-wrap items-center gap-x-2 gap-y-3">
        <li v-for="(name, index) in brightnessOrder" :key="name" class="relative">
          <button
            type="button"
            class="rounded-md border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="
              index === brightnessRank
                ? 'border-brand bg-brand-soft text-brand-soft-foreground font-semibold shadow-sm'
                : 'brightness-pill border-border text-muted-foreground hover:text-foreground'
            "
            :style="index === brightnessRank ? undefined : { '--brightness-hue': brightnessHue(index) }"
            @click="selectModeByPatternName(name)"
          >
            {{ scaleName(name) }}
          </button>

          <span
            v-if="index === brightnessRank"
            class="absolute top-full left-1/2 mt-0.5 -translate-x-1/2 text-xs leading-none text-brand"
            aria-hidden="true"
          >
            ▲
          </span>
        </li>
      </ol>

      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ t("modeExplorer.brightnessBrightest") }}</span>
        <span>{{ t("modeExplorer.brightnessDarkest") }}</span>
      </div>
    </section>

    <section class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-sm font-medium text-foreground">
          {{ t("modeExplorer.compare.title", { root: selectedMode.scale.root.toString() }) }}
        </h2>

        <chip-toggle-group
          :model-value="comparisonPattern.name"
          type="single"
          wrap
          :aria-label="t('modeExplorer.compare.title', { root: selectedMode.scale.root.toString() })"
          @update:model-value="(value) => value && selectComparisonPattern(value as string)"
        >
          <chip-toggle-item
            v-for="pattern in comparisonOptions"
            :key="pattern.name"
            :value="pattern.name"
            class="px-2.5 py-1 text-xs"
          >
            {{ scaleName(pattern) }}
          </chip-toggle-item>
        </chip-toggle-group>
      </header>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {{ scaleName(selectedMode.pattern) }}
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="listenToMode"
            >
              <play-icon class="size-3.5" />
            </button>
          </div>

          <ul class="space-y-1">
            <li
              v-for="(item, index) in degrees"
              :key="index"
              class="rounded-md px-2 py-1 text-sm"
              :class="differingDegreeIndexes.has(index) ? 'bg-brand-soft text-brand-soft-foreground font-medium' : 'text-foreground'"
            >
              {{ item.spelled }}
            </li>
          </ul>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {{ scaleName(comparisonPattern) }}
            </p>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="listenToComparison"
            >
              <play-icon class="size-3.5" />
            </button>
          </div>

          <ul class="space-y-1">
            <li
              v-for="(item, index) in comparisonDegrees"
              :key="index"
              class="rounded-md px-2 py-1 text-sm"
              :class="differingDegreeIndexes.has(index) ? 'bg-brand-soft text-brand-soft-foreground font-medium' : 'text-foreground'"
            >
              {{ item.spelled }}
            </li>
          </ul>
        </div>
      </div>

      <p class="text-xs text-muted-foreground italic">
        {{ t("modeExplorer.compare.caption") }}
      </p>
    </section>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

      
      <div class="w-full my-auto flex justify-center">
        <chromatic-wheel :root="selectedMode.scale.root" :highlighted-notes="notes" :label-by-pitch-class="spelledByPitchClass"
        class="lg:w-72 lg:shrink-0 lg:h-full" @note-play="play" />
      </div>
    </div>

    <section class="min-w-0 space-y-3 lg:flex-1 flex-1">
      <header class="flex items-center justify-between gap-4">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("common.fretboard") }}
        </h2>
        <fret-range-selector v-model="fretCount" />
      </header>

      <fretboard-diagram :positions="fretboardPositions" context="scale" :pulse-trigger="selectedModeIndex"
        class="lg:max-w-full lg:p-16" @note-play="play" />
    </section>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field v-model:mode="harmonicFieldMode" :triads="triads" :sevenths="sevenths"
        :selected-index="selectedTriadIndex" class="lg:w-56 lg:shrink-0" @select="selectChord"
        @chord-play="playChord($event, { strum: true })" />

      <div class="flex-1">
        <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
          class="min-w-0 lg:flex-1" @note-play="play" @chord-play="playChord($event, { strum: true })" />

        <empty-state v-else :title="t('modeExplorer.emptyShapes.title')"
          :description="t('modeExplorer.emptyShapes.description', { chord: selectedChord.name })"
          class="lg:flex-1" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tint por matiz (quente→frio) com alfa/luminosidade por tema — 0.16/55% some no tema claro. */
.brightness-pill {
  background-color: hsl(var(--brightness-hue) 70% 45% / 0.3);
}

.dark .brightness-pill {
  background-color: hsl(var(--brightness-hue) 70% 55% / 0.16);
}
</style>
