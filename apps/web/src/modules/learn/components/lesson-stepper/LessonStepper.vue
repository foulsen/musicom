<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { LessonStep } from "../../application/curriculum";

defineProps<{
  steps: LessonStep[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const { t } = useI18n();

function dotClass(index: number, currentIndex: number): string {
  if (index === currentIndex) return "bg-brand";
  if (index < currentIndex) return "bg-brand/50 hover:bg-brand/80";
  return "bg-border";
}
</script>

<template>
  <ol class="flex items-center gap-2" role="list">
    <li v-for="(step, index) in steps" :key="index" class="flex items-center gap-2">
      <button
        v-if="index < currentIndex"
        type="button"
        class="size-2.5 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        :class="dotClass(index, currentIndex)"
        :aria-label="t('learn.stepperGoTo', { kind: t(`learn.stepKind.${step.kind}`), step: index + 1 })"
        @click="emit('select', index)"
      />
      <span
        v-else
        class="size-2.5 rounded-full transition-colors"
        :class="dotClass(index, currentIndex)"
        :aria-current="index === currentIndex ? 'step' : undefined"
        :aria-label="t('learn.stepperStep', { kind: t(`learn.stepKind.${step.kind}`), step: index + 1, total: steps.length })"
      />
      <span v-if="index < steps.length - 1" class="h-px w-6 bg-border" aria-hidden="true" />
    </li>
  </ol>
</template>
