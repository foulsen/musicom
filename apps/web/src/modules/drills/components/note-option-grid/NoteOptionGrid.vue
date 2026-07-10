<script setup lang="ts">
import type { SingleNote } from "@music-workspace/music-theory";

const props = defineProps<{
  options: SingleNote[];
  correct: SingleNote;
  selected: SingleNote | null;
}>();

const emit = defineEmits<{
  select: [note: SingleNote];
}>();

function stateClass(note: SingleNote): string {
  if (!props.selected) {
    return "border-border bg-card/40 text-foreground hover:bg-accent/40 cursor-pointer";
  }

  if (note === props.correct) {
    return "border-brand bg-brand-soft text-brand-soft-foreground cursor-default";
  }

  if (note === props.selected) {
    return "border-destructive bg-destructive/10 text-destructive cursor-default";
  }

  return "border-border bg-card/20 text-muted-foreground opacity-60 cursor-default";
}

/**
 * Mantém os botões focáveis (leitor de tela/teclado) mesmo depois de respondido;
 * usa `aria-disabled` + ignora o clique, em vez de `disabled` real (WCAG 4.1.3).
 */
function handleClick(note: SingleNote) {
  if (props.selected !== null) return;

  emit("select", note);
}
</script>

<template>
  <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
    <button
      v-for="note in options"
      :key="note"
      type="button"
      :aria-disabled="selected !== null"
      class="rounded-lg border py-3 text-center text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :class="stateClass(note)"
      @click="handleClick(note)"
    >
      {{ note }}
    </button>
  </div>
</template>
