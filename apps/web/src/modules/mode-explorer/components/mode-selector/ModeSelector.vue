<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { Mode } from "@music-workspace/music-theory";

const props = defineProps<{
  modes: Mode[];
}>();

const { t } = useI18n();

const model = defineModel<number>({ required: true });

const selectedDegree = computed<string>({
  get: () => props.modes[model.value]?.degree.toString() ?? "1",
  set: (value) => {
    const index = props.modes.findIndex((mode) => mode.degree.toString() === value);
    if (index >= 0) model.value = index;
  },
});
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("modeExplorer.mode") }}
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedDegree"
      type="single"
      class="flex flex-wrap gap-2"
    >
      <toggle-group-item
        v-for="mode in modes"
        :key="mode.degree"
        :value="mode.degree.toString()"
        :aria-label="`${mode.pattern.name} · ${t('modeExplorer.degree', { degree: mode.degree })}`"
        class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand-soft data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        <span class="font-medium">
          {{ mode.pattern.name }}
        </span>

        <span
          class="rounded-full bg-foreground/10 px-1.5 text-xs leading-5 opacity-80 data-[state=on]:bg-brand-soft-foreground/15"
        >
          {{ mode.degree }}
        </span>
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
