<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { Play as PlayIcon } from "@lucide/vue";
import { Pitch, scalePatternSteps } from "@music-workspace/music-theory";

import { useScaleExplorerViewModel } from "../application/use-scale-explorer-view-model";
import { ScalePatternSelector } from "../components/scale-pattern-selector";
import { TuningSelector } from "../components/tuning-selector";

import { useMusicTerms } from "@/modules/shared/application/music-terms";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { RootNoteSelector } from "@/modules/shared/components/root-note-selector";
import { StepPattern } from "@/modules/shared/components/step-pattern";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { HarmonicField } from "@/modules/shared/components/harmonic-field";
import { FretboardDiagram } from "@/modules/shared/components/fretboard-diagram";
import { ChordCard } from "@/modules/shared/components/chord-card";
import { FretRangeSelector } from "@/modules/shared/components/fret-range-selector";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { LessonReturnBanner } from "@/modules/shared/components/lesson-return-banner";

const {
  selectedRoot,
  selectedPattern,
  availablePatterns,
  notes,
  degrees,
  triads,
  sevenths,
  harmonicFieldMode,
  spelledByPitchClass,
  fretboardPositions,
  fretCount,
  selectedTriadIndex,
  selectedChord,
  selectedChordCard,
  selectChord,
  returnLessonId,
  availableTunings,
  selectedTuning,
} = useScaleExplorerViewModel();

const { play, playChord, playSequence } = useNoteAudio();
const { t } = useI18n();
const { scaleDescription } = useMusicTerms();

const patternDescription = computed(() => scaleDescription(selectedPattern.value));
const patternSteps = computed(() => scalePatternSteps(selectedPattern.value));
const patternDegreeLabels = computed(() => selectedPattern.value.degrees.map((degree) => degree.toString()));

/** Escala ascendente, fechando na tônica uma oitava acima (via Pitch.transpose, nunca cai de registro). */
function listenToScale() {
  const rootPitch = Pitch.from(selectedRoot.value.value, 4);
  const pitches = degrees.value.map((item) => rootPitch.transpose(item.degree.semitones()));

  playSequence([...pitches, rootPitch.transpose(12)]);
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <lesson-return-banner v-if="returnLessonId" :lesson-id="returnLessonId" />

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

    <section class="space-y-4 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
      <p v-if="patternDescription" class="max-w-prose text-sm leading-relaxed text-foreground">
        {{ patternDescription }}
      </p>

      <div class="max-w-xl space-y-2">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("stepPattern.title") }}
        </h2>

        <step-pattern :steps="patternSteps" :degree-labels="patternDegreeLabels" legend />
      </div>
    </section>

    <tuning-selector v-model="selectedTuning" :tunings="availableTunings" class="max-w-xs" />

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div class="space-y-3 lg:w-44 lg:shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="listenToScale"
        >
          <play-icon class="size-3.5" />
          {{ t("scaleExplorer.listenToScale") }}
        </button>

        <scale-notes :degrees="degrees" @note-play="play" />
      </div>

      <div class="w-full my-auto flex justify-center">
        <chromatic-wheel :root="selectedRoot" :highlighted-notes="notes" :label-by-pitch-class="spelledByPitchClass"
          class="lg:w-72 lg:shrink-0 lg:h-full" @note-play="play" />
      </div>
    </div>
    <section class="min-w-0 space-y-3 lg:flex-1 flex-1">
      <header class="flex items-center justify-between gap-4">
        <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("common.fretboard") }}
        </h2>
        <fret-range-selector v-model="fretCount" />
      </header>

      <fretboard-diagram :positions="fretboardPositions" context="scale" class="lg:max-w-full lg:p-16" @note-play="play" />
    </section>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <harmonic-field v-model:mode="harmonicFieldMode" :triads="triads" :sevenths="sevenths"
        :selected-index="selectedTriadIndex" class="lg:w-56 lg:shrink-0" @select="selectChord"
        @chord-play="playChord($event, { strum: true })" />

      <div class="flex-1">
        <chord-card v-if="selectedChordCard" :name="selectedChordCard.name" :shapes="selectedChordCard.shapes"
          class="min-w-0 lg:flex-1" @note-play="play" @chord-play="playChord($event, { strum: true })" />

        <empty-state v-else :title="t('scaleExplorer.emptyShapes.title')"
          :description="t('scaleExplorer.emptyShapes.description', { chord: selectedChord.name })" class="lg:flex-1" />
      </div>
    </div>
  </section>
</template>
