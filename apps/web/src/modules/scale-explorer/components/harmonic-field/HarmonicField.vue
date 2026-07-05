<script setup lang="ts">
import type { Chord } from "@music-workspace/music-theory";

defineProps<{
  chords: Chord[];
}>();
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xl font-medium text-muted-foreground">
        Harmonic Field
      </h2>
    </header>

    <ul class="space-y-3">
      <li
        v-for="chord in chords"
        :key="chord.degree.toString()"
        class="leading-tight"
      >
        <p class="text-lg font-semibold text-foreground">
          {{ chord.name }}
        </p>

        <p class="text-sm text-muted-foreground">
          {{ chord.degree.position() }} - {{ chord.degree.functionName() }}
        </p>
      </li>
    </ul>
  </section>
</template>
