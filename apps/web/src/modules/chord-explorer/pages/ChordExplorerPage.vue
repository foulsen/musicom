<script setup lang="ts">
import { useChordExplorerViewModel } from "../application/use-chord-explorer-view-model";
// Reaproveitado do Scale Explorer; candidato a promover para um módulo compartilhado.
import { RootNoteSelector } from "@/modules/scale-explorer/components/root-note-selector";

const { selectedRoot, chord } = useChordExplorerViewModel();
</script>

<template>
  <section class="flex flex-col gap-8 p-8">
    <header>
      <h1 class="text-2xl font-medium tracking-wide uppercase">
        Chord Explorer
      </h1>
    </header>

    <root-note-selector v-model="selectedRoot" />

    <!-- Placeholder da Fase 2: qualidade, fórmula, notas, braço e voicings entram nas próximas fases. -->
    <div class="leading-tight">
      <p class="text-3xl font-semibold text-foreground">
        {{ chord.name }}
      </p>

      <p class="text-sm text-muted-foreground">
        {{ chord.spelledNotes.map((note) => note.toString()).join(" · ") }}
      </p>
    </div>
  </section>
</template>
