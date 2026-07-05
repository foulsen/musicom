<script setup lang="ts">
import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { useNoteAudio } from "../application/use-note-audio";
import { RootNoteSelector } from "../components/root-note-selector";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { ScaleNotes } from "../components/scale-notes";
import { HarmonicField } from "../components/harmonic-field";
import { FretboardDiagram } from "../components/fretboard-diagram";
import { ChordDiagram } from "../components/chord-diagram";
import { TuningSelector } from "../components/tuning-selector";

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
  chordPositions,
  selectChord,
} = useScaleExplorerViewModel();

const { play } = useNoteAudio();
</script>

<template>
  <section class="flex h-full flex-col gap-8 overflow-auto p-8">
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

      <chord-diagram
        :positions="chordPositions"
        :caption="selectedChord.name"
        class="min-w-0 max-w-xl lg:flex-1"
        @note-play="play"
      />
    </div>
  </section>
</template>
