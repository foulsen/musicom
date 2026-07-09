<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import { ArrowUpRight } from "@lucide/vue";

import { TRIADS_FAMILY, type Chord } from "@music-workspace/music-theory";

const props = defineProps<{
  chords: Chord[];
  selectedIndex?: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const { t } = useI18n();

/** Encontra a qualidade da tríade selecionada entre os padrões de "Triads" para linkar ao Chord Explorer. */
const selectedChordExplorerQuery = computed(() => {
  const chord = props.chords[props.selectedIndex ?? -1];
  if (!chord) return null;

  const pattern = TRIADS_FAMILY.patterns.find(
    (pattern) => pattern.quality.toString() === chord.quality.toString(),
  );
  if (!pattern) return null;

  return {
    root: chord.root.value,
    family: TRIADS_FAMILY.name,
    quality: pattern.name,
  };
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("scaleExplorer.harmonicField") }}
      </h2>
    </header>

    <ul class="space-y-1">
      <li
        v-for="(chord, index) in chords"
        :key="chord.degree.toString()"
      >
        <button
          type="button"
          class="w-full rounded-md px-3 py-2 text-left leading-tight transition-colors hover:bg-muted"
          :class="index === selectedIndex ? 'bg-brand-soft' : ''"
          :aria-pressed="index === selectedIndex"
          @click="emit('select', index)"
        >
          <p
            class="text-lg font-semibold"
            :class="index === selectedIndex ? 'text-brand-soft-foreground' : 'text-foreground'"
          >
            {{ chord.name }}
          </p>

          <p
            class="text-sm"
            :class="index === selectedIndex ? 'text-brand-soft-foreground/80' : 'text-muted-foreground'"
          >
            {{ chord.degree.position() }} - {{ chord.degree.functionName() }}
          </p>
        </button>
      </li>
    </ul>

    <router-link
      v-if="selectedChordExplorerQuery"
      :to="{ path: '/chords', query: selectedChordExplorerQuery }"
      class="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {{ t("scaleExplorer.openInChordExplorer") }}
      <arrow-up-right class="size-4" />
    </router-link>
  </section>
</template>
