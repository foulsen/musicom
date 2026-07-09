<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { HarmonicField } from "../components/harmonic-field";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { FretRangeSelector } from "@/modules/shared/components/fret-range-selector";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";

const {
  selectedRoot,
  selectedPattern,
  availablePatterns,
  notes,
  degrees,
  triads,
  fretboardPositions,
  fretCount,
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
} = useScaleExplorerViewModel();

const { play } = useNoteAudio();
const { t } = useI18n();
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("scaleExplorer.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("scaleExplorer.subtitle") }}
      </p>
    </header>

    <root-note-selector v-model="selectedRoot" />

    <scale-pattern-selector v-model="selectedPattern" :patterns="availablePatterns" />

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

      <div class="min-w-0 space-y-4 lg:flex-1 flex-1">
        <div class="flex justify-end">
          <fret-range-selector v-model="fretCount" />
        </div>

        <fretboard-diagram :positions="fretboardPositions" context="scale" class="max-w-3xl mx-auto"
          @note-play="play" />
      </div>

      <chromatic-wheel :root="selectedRoot" :highlighted-notes="notes" class="lg:w-72 lg:shrink-0"
        @note-play="play" />
    </div>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field :chords="triads" :selected-index="selectedTriadIndex" class="lg:w-56 lg:shrink-0"
        @select="selectChord" />

      <div class="flex-1">
        <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
          class="min-w-0 lg:flex-1" @note-play="play" />

        <empty-state v-else :title="t('scaleExplorer.emptyShapes.title')"
          :description="t('scaleExplorer.emptyShapes.description', { chord: selectedChord.name })"
          class="lg:flex-1" />
      </div>
    </div>
  </section>
</template>
