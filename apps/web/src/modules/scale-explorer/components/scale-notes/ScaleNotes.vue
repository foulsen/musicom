<script setup lang="ts">
import type { Degree, Note } from "@music-workspace/music-theory";

interface ScaleNote {
  note: Note;
  degree: Degree;
}

defineProps<{
  degrees: ScaleNote[];
}>();
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-sm font-medium text-muted-foreground">
        Notes
      </h2>
    </header>

    <ul class="space-y-3">
      <li
        v-for="item in degrees"
        :key="item.degree.toString()"
        class="leading-tight"
      >
        <p class="text-lg font-semibold text-foreground">
          {{ item.note }}
        </p>

        <p class="text-sm text-muted-foreground">
          {{ item.degree.intervalName() }}
        </p>
      </li>
    </ul>
  </section>
</template>
