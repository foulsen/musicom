<script setup lang="ts">
import type { Degree, Note, SpelledNote } from "@music-workspace/music-theory";

interface ScaleNote {
  note: Note;
  degree: Degree;
  spelled: SpelledNote;
}

defineProps<{
  degrees: ScaleNote[];
}>();
</script>

<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-xl font-medium text-muted-foreground">
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
          {{ item.spelled }}
        </p>

        <p class="text-sm text-muted-foreground">
          {{ item.degree.intervalName() }}
        </p>
      </li>
    </ul>
  </section>
</template>
