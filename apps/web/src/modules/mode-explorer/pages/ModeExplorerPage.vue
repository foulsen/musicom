<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";
import { Play as PlayIcon } from "@lucide/vue";

import { useModeExplorerViewModel } from "../application/use-mode-explorer-view-model";
import { ModeSelector } from "../components/mode-selector";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { HarmonicField } from "@/modules/scale-explorer/components/harmonic-field";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";

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
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
} = useModeExplorerViewModel();

const { play, playSequence } = useNoteAudio();
const { t } = useI18n();

function listenToMode() {
  playSequence(scalePitches.value);
}

function listenToComparison() {
  playSequence(comparisonPitches.value);
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("modeExplorer.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("modeExplorer.subtitle") }}
      </p>
    </header>

    <root-note-selector v-model="selectedParentRoot" />

    <mode-selector v-model="selectedModeIndex" :modes="modes" />

    <button
      type="button"
      class="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="listenToMode"
    >
      <play-icon class="size-4" />
      {{ t("modeExplorer.listenToMode", { mode: selectedMode.pattern.name }) }}
    </button>

    <section class="space-y-3">
      <header>
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("modeExplorer.brightness") }}
        </h2>
      </header>

      <ol class="flex flex-wrap items-center gap-2">
        <li v-for="(name, index) in brightnessOrder" :key="name">
          <button
            type="button"
            class="rounded-md border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="
              index === brightnessRank
                ? 'border-brand-soft bg-brand-soft text-brand-soft-foreground font-medium'
                : 'border-border bg-card/40 text-muted-foreground hover:text-foreground'
            "
            @click="selectModeByPatternName(name)"
          >
            {{ name }}
          </button>
        </li>
      </ol>
    </section>

    <section class="space-y-4 rounded-xl border border-border bg-card/40 p-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-sm font-medium text-foreground">
          {{ t("modeExplorer.compare.title", { root: selectedMode.scale.root.toString() }) }}
        </h2>

        <toggle-group-root
          :model-value="comparisonPattern.name"
          type="single"
          :aria-label="t('modeExplorer.compare.title', { root: selectedMode.scale.root.toString() })"
          class="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-card/40 p-1"
          @update:model-value="(value) => value && selectComparisonPattern(value as string)"
        >
          <toggle-group-item
            v-for="pattern in comparisonOptions"
            :key="pattern.name"
            :value="pattern.name"
            class="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
          >
            {{ pattern.name }}
          </toggle-group-item>
        </toggle-group-root>
      </header>

      <div class="grid grid-cols-2 gap-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {{ selectedMode.pattern.name }}
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
              {{ comparisonPattern.name }}
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
    </section>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

      <fretboard-diagram :positions="fretboardPositions" context="scale" class="min-w-0 max-w-3xl mx-auto lg:flex-1"
        @note-play="play" />

      <chromatic-wheel :root="selectedMode.scale.root" :highlighted-notes="notes"
        :label-by-pitch-class="spelledByPitchClass" class="lg:w-72 lg:shrink-0" @note-play="play" />
    </div>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field v-model:mode="harmonicFieldMode" :triads="triads" :sevenths="sevenths"
        :selected-index="selectedTriadIndex" class="lg:w-56 lg:shrink-0" @select="selectChord" />

      <div class="flex-1">
        <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
          class="min-w-0 lg:flex-1" @note-play="play" />

        <empty-state v-else :title="t('modeExplorer.emptyShapes.title')"
          :description="t('modeExplorer.emptyShapes.description', { chord: selectedChord.name })"
          class="lg:flex-1" />
      </div>
    </div>
  </section>
</template>
