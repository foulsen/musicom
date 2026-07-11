<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Pitch } from "@music-workspace/music-theory";

import type { ChordShape } from "../../types/chord-shape";
import { ChordVoicingDiagram } from "../chord-voicing-diagram";

const props = withDefaults(
  defineProps<{
    name: string;
    shapes: ChordShape[];
    showTitle?: boolean;
    /** Máximo de variações exibidas por padrão; ajustável por chamada. */
    maxVariations?: number;
  }>(),
  { maxVariations: 3, showTitle: true },
);

const emit = defineEmits<{
  notePlay: [pitch: Pitch];
  chordPlay: [pitches: Pitch[]];
}>();

const { t } = useI18n();

const expanded = ref(false);

const hiddenCount = computed(() => Math.max(0, props.shapes.length - props.maxVariations));

const visibleShapes = computed(() =>
  expanded.value ? props.shapes : props.shapes.slice(0, props.maxVariations),
);
</script>

<template>
  <figure class="space-y-4 rounded-xl border border-border bg-card/40 py-4 px-16 w-fit">
    <figcaption v-if="props.showTitle" class="text-center text-3xl font-medium text-foreground">
      {{ props.name }}
    </figcaption>

    <div class="flex flex-wrap items-start justify-center gap-6" :class="{'pt-3': !props.showTitle}">
      <chord-voicing-diagram
        v-for="(shape, index) in visibleShapes"
        :key="index"
        :shape="shape"
        class="max-w-45 flex-1"
        @note-play="emit('notePlay', $event)"
        @chord-play="emit('chordPlay', $event)"
      />
    </div>

    <button
      v-if="hiddenCount > 0"
      type="button"
      class="mx-auto block rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="expanded = !expanded"
    >
      {{ expanded ? t("common.showFewerVoicings") : t("common.showMoreVoicings", { count: hiddenCount }) }}
    </button>
  </figure>
</template>
