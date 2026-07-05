<script setup lang="ts">
import type { Chord } from "@music-workspace/music-theory";

defineProps<{
  chords: Chord[];
  selectedIndex?: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xl font-medium text-muted-foreground">
        Harmonic Field
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
            :class="index === selectedIndex ? 'text-brand-foreground' : 'text-foreground'"
          >
            {{ chord.name }}
          </p>

          <p
            class="text-sm"
            :class="index === selectedIndex ? 'text-brand-foreground/80' : 'text-muted-foreground'"
          >
            {{ chord.degree.position() }} - {{ chord.degree.functionName() }}
          </p>
        </button>
      </li>
    </ul>
  </section>
</template>
