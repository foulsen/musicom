<script setup lang="ts">
import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { RootNoteSelector } from "../components/root-note-selector";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { ScaleNotes } from "../components/scale-notes";
import { HarmonicField } from "../components/harmonic-field";

const {
  selectedRoot,
  selectedPattern,
  availablePatterns,
  degrees,
  triads,
} = useScaleExplorerViewModel();
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

    <scale-notes :degrees="degrees" />

    <section>
      <!-- Fretboard (milestone futuro) -->
    </section>

    <harmonic-field :chords="triads" />
  </section>
</template>
