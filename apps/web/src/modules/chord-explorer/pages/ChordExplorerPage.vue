<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { Play as PlayIcon } from "@lucide/vue";

import { useChordExplorerViewModel } from "../application/use-chord-explorer-view-model";
import { ChordFamilySelector } from "../components/chord-family-selector";
import { ChordQualitySelector } from "../components/chord-quality-selector";

import { useMusicTerms } from "@/modules/shared/application/music-terms";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { chordPitches } from "@/modules/shared/application/chord-pitches";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { FretRangeSelector } from "@/modules/shared/components/fret-range-selector";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { LessonReturnBanner } from "@/modules/shared/components/lesson-return-banner";

const {
  selectedRoot,
  availableFamilies,
  selectedFamily,
  selectedQuality,
  chord,
  chordOptions,
  chordNotes,
  selectedChordCard,
  spelledByPitchClass,
  fretboardPositions,
  fretCount,
  returnLessonId,
} = useChordExplorerViewModel();

const { play, playChord } = useNoteAudio();
const { t } = useI18n();
const { chordDescription, intervalName } = useMusicTerms();

const qualityDescription = computed(() => chordDescription(selectedQuality.value));

/** Fórmula do acorde em graus ("1 – b3 – 5") e, ao lado, o nome de cada intervalo. */
const formulaDegrees = computed(() => selectedQuality.value.degrees.map((degree) => degree.toString()).join(" – "));
const formulaIntervals = computed(() => selectedQuality.value.degrees.map((degree) => intervalName(degree)).join(", "));

function listenToChord() {
  playChord(chordPitches(chord.value), { strum: true });
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <lesson-return-banner v-if="returnLessonId" :lesson-id="returnLessonId" />

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

    <section class="space-y-3 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
      <p v-if="qualityDescription" class="max-w-prose text-sm leading-relaxed text-foreground">
        {{ qualityDescription }}
      </p>

      <div class="space-y-1">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("chordExplorer.formula") }}
        </h2>

        <p class="text-sm">
          <span class="font-semibold tracking-wide text-foreground" aria-hidden="true">{{ formulaDegrees }}</span>
          <span class="text-muted-foreground"><span aria-hidden="true"> · </span>{{ formulaIntervals }}</span>
        </p>
      </div>
    </section>

    <div class="flex flex-col gap-8 lg:gap-16 lg:flex-row lg:items-start">
      <scale-notes :degrees="chordNotes" class="lg:w-44 lg:shrink-0" @note-play="play" />

      <div class="w-full my-auto flex justify-center">
        <chromatic-wheel :root="selectedRoot" :highlighted-notes="chord.notes"
          :label-by-pitch-class="spelledByPitchClass" class="lg:w-72 lg:shrink-0 lg:h-full" @note-play="play" />
      </div>

    </div>
    <section class="space-y-3">
      <header class="flex items-center justify-between gap-4">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("common.shapes") }}
        </h2>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="listenToChord"
        >
          <play-icon class="size-3.5" />
          {{ t("scaleExplorer.playChord", { chord: chord.name }) }}
        </button>
      </header>

      <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
        :show-title="false" class="min-w-0 lg:flex-1" @note-play="play" @chord-play="playChord($event, { strum: true })" />
      <empty-state v-else :title="t('chordExplorer.emptyShapes.title')"
        :description="t('chordExplorer.emptyShapes.description', { chord: chord.name })" class="lg:flex-1" />
    </section>
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
