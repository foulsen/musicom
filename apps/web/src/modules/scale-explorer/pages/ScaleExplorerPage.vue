<script setup lang="ts">
import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { HarmonicField } from "../components/harmonic-field";
import { TuningSelector } from "../components/tuning-selector";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { ChordCard } from "@/modules/shared/components/chord-card";

const {
  selectedRoot,
  selectedPattern,
  availablePatterns,
  degrees,
  triads,
  fretboardPositions,
  availableTunings,
  selectedTuning,
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
} = useScaleExplorerViewModel();

const { play } = useNoteAudio();
</script>

<template>
  <section class="flex flex-col gap-8 p-8">
    <header>
      <h1 class="text-2xl font-medium tracking-wide uppercase">
        Scale Explorer
      </h1>
    </header>

    <root-note-selector v-model="selectedRoot" />

    <scale-pattern-selector
      v-model="selectedPattern"
      :patterns="availablePatterns"
    />

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="degrees" class="lg:w-44 lg:shrink-0" />

      <div class="min-w-0 space-y-4 lg:flex-1">
        <tuning-selector
          v-model="selectedTuning"
          :tunings="availableTunings"
          class="max-w-xs"
        />

        <fretboard-diagram
          :positions="fretboardPositions"
          class="max-w-3xl"
          @note-play="play"
        />
      </div>
    </div>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field
        :chords="triads"
        :selected-index="selectedTriadIndex"
        class="lg:w-56 lg:shrink-0"
        @select="selectChord"
      />

      <chord-card
        v-if="selectedChordCard"
        :name="selectedChordCard.name"
        :shapes="selectedChordCard.shapes"
        class="min-w-0 max-w-2xl lg:flex-1"
        @note-play="play"
      />

      <p
        v-else
        class="text-sm text-muted-foreground lg:flex-1"
      >
        Sem digitação predefinida para {{ selectedChord.name }}.
      </p>
    </div>
  </section>
</template>
