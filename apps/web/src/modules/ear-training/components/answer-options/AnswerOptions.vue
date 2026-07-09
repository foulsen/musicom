<script setup lang="ts">
import type { QuizOption } from "../../application/question-generators";

defineProps<{
  options: QuizOption[];
  correctId: string;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

function stateClass(option: QuizOption, correctId: string, selectedId: string | null): string {
  if (!selectedId) {
    return "border-border bg-card/40 text-foreground hover:bg-accent/40";
  }

  if (option.id === correctId) {
    return "border-brand bg-brand-soft text-brand-soft-foreground";
  }

  if (option.id === selectedId) {
    return "border-destructive bg-destructive/10 text-destructive";
  }

  return "border-border bg-card/20 text-muted-foreground opacity-60";
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      :disabled="selectedId !== null"
      class="rounded-lg border px-4 py-3 text-left text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
      :class="stateClass(option, correctId, selectedId)"
      @click="emit('select', option.id)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
