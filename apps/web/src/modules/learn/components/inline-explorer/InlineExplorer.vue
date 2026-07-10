<script setup lang="ts">
import { computed, ref } from "vue";

import { Note, createScale } from "@music-workspace/music-theory";

import { findScalePattern } from "@/modules/shared/application/scale-patterns";
import { resolveChordCard } from "@/modules/shared/application/chord-cards";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import { ScaleNotes } from "@/modules/shared/components/scale-notes";
import { ChromaticWheel } from "@/modules/shared/components/chromatic-wheel";
import { HarmonicField } from "@/modules/shared/components/harmonic-field";
import { ChordCard } from "@/modules/shared/components/chord-card";

import type { InlineVizKind, LessonContext } from "../../application/curriculum";

const props = withDefaults(
  defineProps<{
    context: LessonContext;
    viz: InlineVizKind[];
    /** Grau (1-based) em destaque no Harmonic Field / usado como acorde do Chord Card. */
    highlightDegree?: number;
  }>(),
  { highlightDegree: undefined },
);

const { play } = useNoteAudio();

const scale = computed(() => createScale(Note.from(props.context.root), findScalePattern(props.context.pattern)));

const notes = computed(() => scale.value.notes());
const degrees = computed(() => scale.value.degrees());
const triads = computed(() => scale.value.triads());
const sevenths = computed(() => scale.value.seventhChords());

const harmonicFieldMode = ref<"triads" | "sevenths">("triads");
const selectedIndex = ref((props.highlightDegree ?? 1) - 1);

const spelledByPitchClass = computed(() => {
  const map = new Map<number, string>();
  scale.value.spelledNotes().forEach((spelled) => map.set(spelled.pitchClass(), spelled.toString()));
  return map;
});

const activeHarmonicFieldChords = computed(() =>
  harmonicFieldMode.value === "triads" ? triads.value : sevenths.value,
);

const selectedChord = computed(() => activeHarmonicFieldChords.value[selectedIndex.value]);

const selectedChordCard = computed(() =>
  selectedChord.value ? resolveChordCard(selectedChord.value.name) : null,
);

function selectChord(index: number) {
  selectedIndex.value = index;
}
</script>

<template>
  <div class="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
    <scale-notes v-if="viz.includes('scale-notes')" :degrees="degrees" class="lg:w-44 lg:shrink-0" @note-play="play" />

    <div v-if="viz.includes('chromatic-wheel')" class="w-full max-w-xs">
      <chromatic-wheel :root="scale.root" :highlighted-notes="notes" :label-by-pitch-class="spelledByPitchClass"
        @note-play="play" />
    </div>

    <harmonic-field v-if="viz.includes('harmonic-field')" v-model:mode="harmonicFieldMode" :triads="triads"
      :sevenths="sevenths" :selected-index="selectedIndex" class="lg:w-64 lg:shrink-0" @select="selectChord" />

    <chord-card v-if="viz.includes('chord-card') && selectedChordCard" :name="selectedChordCard.name"
      :shapes="selectedChordCard.shapes" @note-play="play" />
  </div>
</template>
