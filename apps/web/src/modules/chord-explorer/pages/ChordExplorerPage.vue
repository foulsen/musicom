<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { useChordExplorerViewModel } from "../application/use-chord-explorer-view-model";
import { ChordFamilySelector } from "../components/chord-family-selector";
import { ChordQualitySelector } from "../components/chord-quality-selector";

import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { FretRangeSelector } from "@/modules/shared/components/fret-range-selector";
import { EmptyState } from "@/modules/shared/components/empty-state";

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
  fretCount,
} = useChordExplorerViewModel();

const { play } = useNoteAudio();
const { t } = useI18n();
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("chordExplorer.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("chordExplorer.subtitle") }}
      </p>
    </header>

    <root-note-selector v-model="selectedRoot" />

    <chord-family-selector v-model="selectedFamily" :families="availableFamilies" />

    <chord-quality-selector v-model="selectedQuality" :chords="chordOptions" />

    <div class="flex flex-col gap-8 lg:gap-16 lg:flex-row lg:items-start">
      <scale-notes :degrees="chordNotes" class="lg:w-44 lg:shrink-0" @note-play="play" />
      <section class="space-y-3">
        <header>
          <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {{ t("common.shapes") }}
          </h2>
        </header>

        <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
          :show-title="false" class="min-w-0 lg:flex-1" @note-play="play" />
        <empty-state v-else :title="t('chordExplorer.emptyShapes.title')"
          :description="t('chordExplorer.emptyShapes.description', { chord: chord.name })" class="lg:flex-1" />
      </section>
    </div>
    <section class="space-y-3">
      <header class="flex items-center justify-between gap-4">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("chordExplorer.fretboardWithChordNotes") }}
        </h2>
        <fret-range-selector v-model="fretCount" />
      </header>

      <fretboard-diagram :positions="fretboardPositions" context="chord" class="max-w-3xl flex-1 mx-auto"
        @note-play="play" />
    </section>

  </section>
</template>
