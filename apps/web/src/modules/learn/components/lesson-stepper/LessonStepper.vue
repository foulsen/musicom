<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { LessonStep } from "../../application/curriculum";

defineProps<{
  steps: LessonStep[];
  currentIndex: number;
}>();

const { t } = useI18n();

function dotClass(index: number, currentIndex: number): string {
  if (index === currentIndex) return "bg-brand";
  if (index < currentIndex) return "bg-brand/50";
  return "bg-border";
}
</script>

<template>
  <ol class="flex items-center gap-2" role="list">
    <li v-for="(step, index) in steps" :key="index" class="flex items-center gap-2">
      <span
        class="size-2.5 rounded-full transition-colors"
        :class="dotClass(index, currentIndex)"
        :aria-current="index === currentIndex ? 'step' : undefined"
        :aria-label="t(`learn.stepKind.${step.kind}`)"
      />
      <span v-if="index < steps.length - 1" class="h-px w-6 bg-border" aria-hidden="true" />
    </li>
  </ol>
</template>
