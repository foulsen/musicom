<script setup lang="ts">
import { computed } from "vue";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { Interval, ScalePattern } from "@music-workspace/music-theory";

interface Props {
  patterns: ScalePattern[];
}

const props = defineProps<Props>();

const model = defineModel<ScalePattern>({ required: true });

const selectedName = computed<string>({
  get: () => model.value.name,
  set: (name) => {
    const pattern = props.patterns.find((pattern) => pattern.name === name);

    if (pattern) {
      model.value = pattern;
    }
  },
});

function formatIntervals(pattern: ScalePattern): string {
  return pattern.intervals.map(intervalLabel).join(" - ");
}

function intervalLabel(interval: Interval): string {
  switch (interval.semitones) {
    case 1:
      return "ST";
    case 2:
      return "T";
    case 3:
      return "T½";
    default:
      return `${interval.semitones}st`;
  }
}
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xl font-medium text-muted-foreground">
        Scale Type
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedName"
      type="single"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <toggle-group-item
        v-for="pattern in patterns"
        :key="pattern.name"
        :value="pattern.name"
        class="flex flex-col items-start gap-1 rounded-lg border border-border bg-card/40 px-4 py-3 text-left text-muted-foreground transition-colors outline-none hover:bg-accent/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand data-[state=on]:bg-brand/10 data-[state=on]:text-foreground"
      >
        <span class="text-base font-medium">
          {{ pattern.name }}
        </span>

        <span class="text-sm opacity-80">
          {{ formatIntervals(pattern) }}
        </span>
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
