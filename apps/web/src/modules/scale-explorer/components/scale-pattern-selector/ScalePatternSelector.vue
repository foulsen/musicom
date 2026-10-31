<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui";

import type { Interval, ScalePattern } from "@music-workspace/music-theory";

import { useMusicTerms } from "@/modules/shared/application/music-terms";

interface Props {
  patterns: ScalePattern[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const { scaleName } = useMusicTerms();

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
      return t("intervals.half");
    case 2:
      return t("intervals.whole");
    case 3:
      return t("intervals.wholeHalf");
    default:
      return `${interval.semitones}st`;
  }
}
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {{ t("scaleExplorer.scaleType") }}
      </h2>
    </header>

    <toggle-group-root
      v-model="selectedName"
      type="single"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      <toggle-group-item
        v-for="pattern in patterns"
        :key="pattern.name"
        :value="pattern.name"
        class="flex flex-col items-start gap-1 rounded-lg border border-border bg-card/40 px-4 py-3 text-left text-muted-foreground transition-colors outline-none hover:bg-accent/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=on]:border-brand-soft data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground"
      >
        <span class="text-base font-medium">
          {{ scaleName(pattern) }}
        </span>

        <span class="text-sm opacity-80">
          {{ formatIntervals(pattern) }}
        </span>
      </toggle-group-item>
    </toggle-group-root>
  </section>
</template>
