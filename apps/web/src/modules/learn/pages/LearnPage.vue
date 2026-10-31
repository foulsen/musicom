<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { PlayCircle } from "@lucide/vue";

import { useLearnViewModel } from "../application/use-learn-view-model";
import { GlossaryList } from "../components/glossary-list";
import { TodayPanel } from "../components/today-panel";
import { TrackMap } from "../components/track-map";

const { track, lessonsWithStatus, trackProgressPercent, continueLesson } = useLearnViewModel();

const router = useRouter();
const { t } = useI18n();

function continueTrack() {
  if (continueLesson.value) router.push(`/learn/${continueLesson.value.id}`);
}
</script>

<template>
  <section class="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-medium tracking-wide">
        {{ t("learn.title") }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t("learn.subtitle") }}
      </p>
    </header>

    <today-panel />

    <section class="space-y-3">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {{ t(track.titleKey) }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ t("learn.trackProgress", { percent: trackProgressPercent }) }}
          </p>
        </div>

        <button
          v-if="continueLesson"
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="continueTrack"
        >
          <play-circle class="size-4" />
          {{ t("learn.continue") }}
        </button>
      </header>

      <track-map :lessons="lessonsWithStatus" />
    </section>

    <glossary-list />
  </section>
</template>
