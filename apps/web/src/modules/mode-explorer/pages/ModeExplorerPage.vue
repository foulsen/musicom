<script setup lang="ts">
import { useI18n } from "vue-i18n";

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
  notes,
  degrees,
  triads,
  fretboardPositions,
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
} = useModeExplorerViewModel();

const { play } = useNoteAudio();
const { t } = useI18n();
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

    <section class="space-y-3">
      <header>
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("modeExplorer.brightness") }}
        </h2>
      </header>

      <ol class="flex flex-wrap items-center gap-2">
        <li
          v-for="(name, index) in brightnessOrder"
          :key="name"
          class="rounded-md border px-3 py-1.5 text-sm transition-colors"
          :class="
            index === brightnessRank
              ? 'border-brand-soft bg-brand-soft text-brand-soft-foreground font-medium'
              : 'border-border bg-card/40 text-muted-foreground'
          "
        >
          {{ name }}
        </li>
      </ol>
    </section>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <scale-notes :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

      <fretboard-diagram :positions="fretboardPositions" context="scale" class="min-w-0 max-w-3xl mx-auto lg:flex-1"
        @note-play="play" />

      <chromatic-wheel :root="selectedMode.scale.root" :highlighted-notes="notes" class="lg:w-72 lg:shrink-0"
        @note-play="play" />
    </div>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field :chords="triads" :selected-index="selectedTriadIndex" class="lg:w-56 lg:shrink-0"
        @select="selectChord" />

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
