<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import { ArrowRight, Flame, RotateCcw } from "@lucide/vue";

import { useMusicTerms } from "@/modules/shared/application/music-terms";

import { checkpointPercent } from "../../application/checkpoint-mastery";
import { useTodayPanel } from "../../application/use-today-panel";

const {
  nextLesson,
  hasStartedTrack,
  lessonsToReview,
  dueCount,
  newCount,
  weakEarItems,
  weakNoteIdString,
  streak,
  studiedToday,
} = useTodayPanel();

const { t } = useI18n();
const { label } = useMusicTerms();

const LINK_CLASS =
  "inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";
</script>

<template>
  <section aria-labelledby="today-title" class="space-y-4 rounded-xl border border-border bg-card/40 p-4 sm:p-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-0.5">
        <h2 id="today-title" class="text-lg font-medium tracking-wide">
          {{ t("learn.today.title") }}
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ t("learn.today.subtitle") }}
        </p>
      </div>

      <p
        class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
        :class="streak > 0 ? 'border-brand-soft bg-brand-soft/40 text-foreground' : 'border-border text-muted-foreground'"
      >
        <flame class="size-4 shrink-0" :class="streak > 0 && 'text-brand'" aria-hidden="true" />
        <span v-if="streak > 0" class="font-medium">
          {{ t("learn.today.streak.days", { count: streak }, streak) }}
        </span>
        <span v-else>{{ t("learn.today.streak.empty") }}</span>
        <span v-if="streak > 0 && !studiedToday" class="text-xs text-muted-foreground">
          · {{ t("learn.today.streak.keepAlive") }}
        </span>
      </p>
    </header>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <!-- Próxima lição + lições a revisar -->
      <section aria-labelledby="today-lesson-title" class="space-y-3 rounded-lg border border-border bg-background/40 p-4">
        <h3 id="today-lesson-title" class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("learn.today.lesson.title") }}
        </h3>

        <div v-if="nextLesson" class="space-y-2">
          <p class="text-sm text-muted-foreground">
            {{ hasStartedTrack ? t("learn.today.lesson.continueHint") : t("learn.today.lesson.startHint") }}
          </p>
          <router-link
            :to="`/learn/${nextLesson.id}`"
            class="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-left text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ hasStartedTrack ? t("learn.today.lesson.continue", { lesson: t(nextLesson.titleKey) }) : t("learn.today.lesson.start", { lesson: t(nextLesson.titleKey) }) }}
            <arrow-right class="size-4 shrink-0" aria-hidden="true" />
          </router-link>
        </div>
        <p v-else class="text-sm text-muted-foreground">
          {{ t("learn.today.lesson.allDone") }}
        </p>

        <div v-if="lessonsToReview.length > 0" class="space-y-1.5">
          <h4 class="text-xs font-medium text-muted-foreground">
            {{ t("learn.today.lesson.reviewTitle") }}
          </h4>
          <ul class="space-y-1">
            <li v-for="{ lesson, checkpoint } in lessonsToReview" :key="lesson.id">
              <router-link
                :to="`/learn/${lesson.id}`"
                :class="LINK_CLASS"
                :aria-label="checkpoint
                  ? t('learn.today.lesson.reviewAria', { lesson: t(lesson.titleKey), percent: checkpointPercent(checkpoint) })
                  : t('learn.today.lesson.review', { lesson: t(lesson.titleKey) })"
              >
                <rotate-ccw class="size-3.5 shrink-0" aria-hidden="true" />
                {{ t(lesson.titleKey) }}
                <span v-if="checkpoint" class="text-xs font-normal text-muted-foreground" aria-hidden="true">
                  {{ t("learn.checkpointBadge", { correct: checkpoint.correct, total: checkpoint.total }) }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </section>

      <!-- Revisões de flashcards -->
      <section aria-labelledby="today-flashcards-title" class="space-y-3 rounded-lg border border-border bg-background/40 p-4">
        <h3 id="today-flashcards-title" class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("learn.today.flashcards.title") }}
        </h3>

        <p v-if="dueCount > 0" class="text-sm text-foreground">
          {{ t("learn.today.flashcards.due", { count: dueCount }, dueCount) }}
        </p>
        <p v-else class="text-sm text-muted-foreground">
          {{ newCount > 0 ? t("learn.today.flashcards.noneDueNew", { count: newCount }, newCount) : t("learn.today.flashcards.noneDue") }}
        </p>

        <router-link to="/drills?tab=flashcards" :class="LINK_CLASS">
          {{ dueCount > 0 ? t("learn.today.flashcards.review") : t("learn.today.flashcards.open") }}
          <arrow-right class="size-3.5 shrink-0" aria-hidden="true" />
        </router-link>
      </section>

      <!-- Pontos fracos de ouvido -->
      <section aria-labelledby="today-ear-title" class="space-y-3 rounded-lg border border-border bg-background/40 p-4">
        <h3 id="today-ear-title" class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("learn.today.ear.title") }}
        </h3>

        <ul v-if="weakEarItems.length > 0" class="space-y-1.5">
          <li
            v-for="item in weakEarItems"
            :key="`${item.kind}-${item.id}`"
            class="flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
          >
            <span class="font-medium capitalize text-foreground">
              {{ label(item.label) }}
              <span class="text-xs font-normal normal-case text-muted-foreground">· {{ t(`earTraining.kinds.${item.kind}`) }}</span>
            </span>
            <span class="text-xs text-muted-foreground">
              {{ t("earTraining.weakPoints.accuracy", { percent: Math.round(item.accuracy * 100), correct: item.correct, total: item.total }) }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">
          {{ t("learn.today.ear.empty") }}
        </p>

        <router-link to="/ear-training" :class="LINK_CLASS">
          {{ weakEarItems.length > 0 ? t("learn.today.ear.train") : t("learn.today.ear.start") }}
          <arrow-right class="size-3.5 shrink-0" aria-hidden="true" />
        </router-link>
      </section>

      <!-- Note ID: corda mais fraca -->
      <section aria-labelledby="today-note-id-title" class="space-y-3 rounded-lg border border-border bg-background/40 p-4">
        <h3 id="today-note-id-title" class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {{ t("learn.today.noteId.title") }}
        </h3>

        <p v-if="weakNoteIdString" class="text-sm text-foreground">
          {{ t("drills.noteId.stringAccuracy", {
            string: weakNoteIdString.stringNumber,
            note: weakNoteIdString.openNote,
            percent: weakNoteIdString.percent!,
            total: weakNoteIdString.total,
          }, weakNoteIdString.total) }}
        </p>
        <p v-else class="text-sm text-muted-foreground">
          {{ t("learn.today.noteId.empty") }}
        </p>

        <router-link to="/drills?tab=noteId" :class="LINK_CLASS">
          {{ weakNoteIdString ? t("learn.today.noteId.train") : t("learn.today.noteId.start") }}
          <arrow-right class="size-3.5 shrink-0" aria-hidden="true" />
        </router-link>
      </section>
    </div>
  </section>
</template>
