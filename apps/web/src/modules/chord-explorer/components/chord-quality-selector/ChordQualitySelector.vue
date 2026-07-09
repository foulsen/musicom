<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { ChordPattern } from "@music-workspace/music-theory";

/** Opção do seletor: a fórmula (padrão) + o nome e a fórmula já formatados. */
export interface ChordOption {
  pattern: ChordPattern;
  name: string;
  formula: string;
}

const props = defineProps<{
  chords: ChordOption[];
}>();

const { t } = useI18n();

const model = defineModel<ChordPattern>({ required: true });

const selectedName = computed<string>({
  get: () => model.value.name,
  set: (name) => {
    const option = props.chords.find((item) => item.pattern.name === name);

    if (option) {
      model.value = option.pattern;
    }
  },
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("chordExplorer.chordQuality") }}
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedName"
      type="single"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <toggle-group-item
        v-for="option in chords"
        :key="option.pattern.name"
        :value="option.pattern.name"
        class="flex flex-col items-start gap-1 rounded-lg border border-border bg-card/40 px-4 py-3 text-left text-muted-foreground transition-colors outline-none hover:bg-accent/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand-soft data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        <span class="text-base font-medium">
          {{ option.name }}
        </span>

        <span class="text-sm opacity-80">
          {{ option.formula }}
        </span>
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
