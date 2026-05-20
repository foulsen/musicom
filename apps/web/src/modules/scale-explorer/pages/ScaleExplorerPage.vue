<script setup lang="ts">
import { useScaleExplorer } from '../application/use-scale-explorer'

const {
  chromaticScale,
  availablePatterns,

  selectedRoot,
  selectedPattern,

  scale,

  selectRoot,
  selectPattern
} = useScaleExplorer()
</script>

<template>
  <main>
    <h1>Scale Explorer</h1>

    <hr />

    <section>
      <h2>Root</h2>

      <button v-for="note in chromaticScale" :key="note" @click="selectRoot(note)">
        {{ note }}
      </button>
    </section>

    <hr />

    <section>
      <h2>Scale Type</h2>

      <button v-for="pattern in availablePatterns" :key="pattern.name" @click="selectPattern(pattern.name)">
        {{ pattern.name }}
      </button>
    </section>

    <hr />

    <section>
      <h2>
        {{ selectedRoot }}
        {{ selectedPattern.name }}
      </h2>

      <ul>
        <li v-for="item in scale.degrees()" :key="item.note.toString()">
          {{ item.degree.toString() }}
          —
          {{ item.note.toString() }}
        </li>
      </ul>
    </section>

    <section>
      <h2>Harmonic Field</h2>

      <ul>
        <li v-for="chord in scale.triads()" :key="chord.name()">
          {{ chord.degree.toString() }}
          —
          {{ chord.name() }}
        </li>
      </ul>
    </section>

    <section>
      <h2>Seventh Chords</h2>

      <ul>
        <li v-for="chord in scale.seventhChords()" :key="chord.name()">
          {{ chord.degree.toString() }}
          —
          {{ chord.name() }}
        </li>
      </ul>
    </section>
  </main>
</template>