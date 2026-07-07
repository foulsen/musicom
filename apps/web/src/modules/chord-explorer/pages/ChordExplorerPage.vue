<script setup lang="ts">
import { useChordExplorerViewModel } from "../application/use-chord-explorer-view-model";
import { ChordFamilySelector } from "../components/chord-family-selector";
import { ChordQualitySelector } from "../components/chord-quality-selector";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";

const {
  selectedRoot,
  availableFamilies,
  selectedFamily,
  selectedQuality,
  chord,
  chordOptions,
  chordNotes,
  selectedChordCard,
  fretboardPositions,
} = useChordExplorerViewModel();

const { play } = useNoteAudio();
</script>

<template>
  <section class="flex flex-col gap-8 p-8">
    <header>
      <h1 class="text-2xl font-medium tracking-wide uppercase">
        Chord Explorer
      </h1>
    </header>

    <root-note-selector v-model="selectedRoot" />

    <chord-family-selector
      v-model="selectedFamily"
      :families="availableFamilies"
    />

    <chord-quality-selector
      v-model="selectedQuality"
      :chords="chordOptions"
    />

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="chordNotes" class="lg:w-44 lg:shrink-0" />

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
        Sem digitação predefinida para {{ chord.name }}.
      </p>
    </div>

    <fretboard-diagram
      :positions="fretboardPositions"
      class="max-w-3xl"
      @note-play="play"
    />
  </section>
</template>
