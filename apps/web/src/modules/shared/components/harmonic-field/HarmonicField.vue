<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import { ArrowUpRight } from "@lucide/vue";

import { SEVENTH_FAMILY, TRIADS_FAMILY, type Chord } from "@music-workspace/music-theory";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";

const props = defineProps<{
  triads: Chord[];
  sevenths: Chord[];
  selectedIndex?: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const { t } = useI18n();

/** Tríades ou sétimas do mesmo grau (índice preservado — ambas derivam de `scale.degrees()`). */
const mode = defineModel<"triads" | "sevenths">("mode", { default: "triads" });

const chords = computed(() => (mode.value === "triads" ? props.triads : props.sevenths));

/** Encontra a qualidade do acorde selecionado na família ativa, para linkar ao Chord Explorer. */
const selectedChordExplorerQuery = computed(() => {
  const chord = chords.value[props.selectedIndex ?? -1];
  if (!chord) return null;

  const family = mode.value === "triads" ? TRIADS_FAMILY : SEVENTH_FAMILY;
  const pattern = family.patterns.find(
    (pattern) => pattern.quality.toString() === chord.quality.toString(),
  );
  if (!pattern) return null;

  return {
    root: chord.root.value,
    family: family.name,
    quality: pattern.name,
  };
});
</script>

<template>
  <section class="space-y-3">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("scaleExplorer.harmonicField") }}
      </h2>

      <chip-toggle-group
        v-model="mode"
        type="single"
        :aria-label="t('scaleExplorer.chordSet')"
      >
        <chip-toggle-item value="triads" class="px-2.5 py-1 text-xs">
          {{ t("scaleExplorer.triads") }}
        </chip-toggle-item>
        <chip-toggle-item value="sevenths" class="px-2.5 py-1 text-xs">
          {{ t("scaleExplorer.sevenths") }}
        </chip-toggle-item>
      </chip-toggle-group>
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
