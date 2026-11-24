<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { Timer } from "@lucide/vue";

import { MAX_EXTRA_LATENCY_MS } from "@/modules/shared/application/latency-calibration";
import { useLatencyCalibration } from "@/modules/shared/application/use-latency-calibration";

withDefaults(defineProps<{ showTitle?: boolean }>(), { showTitle: true });

const { t } = useI18n();
const { phase, tapCount, extraLatencyMs, start, tap } = useLatencyCalibration();
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <span v-if="showTitle" class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <timer class="size-3.5" />
        {{ t("latency.title") }}
      </span>
      <p class="text-xs text-muted-foreground">{{ t("latency.description") }}</p>
    </div>

    <div class="flex items-center justify-between gap-3">
      <span class="text-sm tabular-nums">{{ t("latency.current", { ms: extraLatencyMs }) }}</span>
      <button
        type="button"
        :disabled="phase === 'running'"
        class="rounded-md border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        @click="start"
      >
        {{ t("latency.calibrate") }}
      </button>
    </div>

    <template v-if="phase === 'running'">
      <p class="text-xs text-muted-foreground">{{ t("latency.instructions") }}</p>
      <button
        type="button"
        class="flex h-20 w-full touch-none select-none flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-brand bg-brand/10 font-semibold active:bg-brand active:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @pointerdown.prevent="tap"
      >
        {{ t("latency.tap") }}
        <span class="text-xs font-normal text-muted-foreground">{{ t("latency.tapCount", { count: tapCount }) }}</span>
      </button>
    </template>
    <p v-else-if="phase === 'done'" class="text-xs text-emerald-600 dark:text-emerald-400">
      {{ t("latency.done", { ms: extraLatencyMs }) }}
    </p>
    <p v-else-if="phase === 'failed'" class="text-xs text-destructive">{{ t("latency.failed") }}</p>

    <input
      v-model.number="extraLatencyMs"
      type="range"
      min="0"
      :max="MAX_EXTRA_LATENCY_MS"
      step="5"
      :disabled="phase === 'running'"
      :aria-label="t('latency.adjust')"
      class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-brand disabled:cursor-not-allowed disabled:opacity-50"
    />
    <p class="text-[11px] text-muted-foreground">{{ t("latency.deviceNote") }}</p>
  </div>
</template>
