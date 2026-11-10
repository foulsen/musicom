<script setup lang="ts">
import type { Passage } from "@music-workspace/music-theory";
import { useMutationObserver, useResizeObserver } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";

import { loadVexflow, renderStaff, type StaffColors } from "@/modules/shared/application/notation/render-staff";
import { toVexflowSpec } from "@/modules/shared/application/notation/vexflow-spec";

import type { StaffHighlight } from "./index";

const props = withDefaults(
  defineProps<{
    passage: Passage;
    ariaLabel: string;
    highlights?: Record<string, StaffHighlight>;
    showTimeSignature?: boolean;
    compact?: boolean;
  }>(),
  { highlights: () => ({}), showTimeSignature: true, compact: false },
);

const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLElement | null>(null);
const inkProbe = ref<HTMLElement | null>(null);
const activeProbe = ref<HTMLElement | null>(null);
const correctProbe = ref<HTMLElement | null>(null);
const wrongProbe = ref<HTMLElement | null>(null);
const width = ref(0);
const ready = ref(false);

function readColors(): StaffColors | null {
  const probes = [inkProbe.value, activeProbe.value, correctProbe.value, wrongProbe.value];
  if (probes.some((probe) => probe === null)) return null;

  const [ink, active, correct, wrong] = probes.map((probe) => getComputedStyle(probe as HTMLElement).color);

  return { ink, active, correct, wrong };
}

let renderToken = 0;

/** Redesenha tudo; o token descarta renderizações antigas quando a VexFlow ainda estava carregando. */
async function draw() {
  const target = canvas.value;
  if (!target || width.value <= 0) return;

  const token = ++renderToken;
  const vexflow = await loadVexflow();
  const colors = readColors();

  if (token !== renderToken || !colors || canvas.value !== target) return;

  renderStaff(
    target,
    toVexflowSpec(props.passage, { showTimeSignature: props.showTimeSignature }),
    { width: width.value, colors, highlights: props.highlights, compact: props.compact, ariaLabel: props.ariaLabel },
    vexflow,
  );
  ready.value = true;
}

useResizeObserver(container, (entries) => {
  const next = Math.floor(entries[0]?.contentRect.width ?? 0);

  if (next !== width.value) width.value = next;
});

// Troca de tema (classe `dark` no <html>) muda as cores resolvidas.
if (typeof document !== "undefined") {
  useMutationObserver(document.documentElement, () => void draw(), { attributes: true, attributeFilter: ["class"] });
}

onMounted(() => {
  width.value = Math.floor(container.value?.clientWidth ?? 0);
  void draw();
});

watch(
  () => [props.passage, props.highlights, props.showTimeSignature, props.compact, props.ariaLabel, width.value],
  () => void draw(),
);
</script>

<template>
  <div ref="container" class="text-foreground" :class="compact ? 'min-h-20' : 'min-h-36'">
    <div ref="canvas" :aria-busy="!ready" />

    <span ref="inkProbe" class="hidden text-foreground" aria-hidden="true" />
    <span ref="activeProbe" class="hidden text-brand" aria-hidden="true" />
    <span ref="correctProbe" class="hidden text-brand" aria-hidden="true" />
    <span ref="wrongProbe" class="hidden text-destructive" aria-hidden="true" />
  </div>
</template>
