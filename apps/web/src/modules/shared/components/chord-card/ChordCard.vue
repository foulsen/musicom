<script setup lang="ts">
import { computed } from "vue";

import type { Pitch } from "@music-workspace/music-theory";

import type { ChordShape } from "../../types/chord-shape";
import { ChordVoicingDiagram } from "../chord-voicing-diagram";

const props = withDefaults(
  defineProps<{
    name: string;
    shapes: ChordShape[];
    /** Máximo de variações exibidas; ajustável por chamada. */
    maxVariations?: number;
  }>(),
  { maxVariations: 3 },
);

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
}>();

const visibleShapes = computed(() => props.shapes.slice(0, props.maxVariations));
</script>

<template>
  <figure class="space-y-4 rounded-3xl bg-transparent p-4">
    <figcaption class="text-center text-3xl font-medium text-muted-foreground">
      {{ name }}
    </figcaption>

    <div class="flex items-start justify-center gap-6">
      <chord-voicing-diagram
        v-for="(shape, index) in visibleShapes"
        :key="index"
        :shape="shape"
        class="max-w-45 flex-1"
        @note-play="emit('notePlay', $event)"
      />
    </div>
  </figure>
</template>
