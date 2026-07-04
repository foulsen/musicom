<script setup lang="ts">
import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { useNoteAudio } from "../application/use-note-audio";
import { RootNoteSelector } from "../components/root-note-selector";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { ScaleNotes } from "../components/scale-notes";
import { HarmonicField } from "../components/harmonic-field";
import { FretboardDiagram } from "../components/fretboard-diagram";

const {
  selectedRoot,
  selectedPattern,
  availablePatterns,
  degrees,
  triads,
  fretboardPositions,
} = useScaleExplorerViewModel();

const { play } = useNoteAudio();
</script>

<template>
  <section class="flex h-full flex-col gap-8 p-8">
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

      <div class="min-w-0 lg:flex-1">
        <fretboard-diagram
          :positions="fretboardPositions"
          class="max-w-3xl"
          @note-click="play"
        />
      </div>
    </div>

    <harmonic-field :chords="triads" />
  </section>
</template>
