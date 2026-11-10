<script setup lang="ts">
import type { Letter } from "@music-workspace/music-theory";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { formatSpelledNote, NOTE_READING_LETTERS } from "../../application/note-reading-generator";
import { NOTE_READING_LEVEL_IDS, type NoteReadingLevelId } from "../../application/reading-types";
import { useNoteReading } from "../../application/use-note-reading";
import { ChipToggleGroup, ChipToggleItem } from "@/modules/shared/components/chip-toggle-group";
import { StaffNotation } from "@/modules/shared/components/staff-notation";
import { useTypingGuardedKeydown } from "@/modules/shared/application/use-typing-guarded-keydown";

const { t } = useI18n();
const {
  level,
  score,
  streak,
  bestStreak,
  accuracyPercent,
  question,
  result,
  answered,
  accidental,
  showAccidentals,
  highlights,
  answer,
  next,
  setLevel,
  setAccidental,
} = useNoteReading();

const ACCIDENTAL_OPTIONS = [
  { value: -1, id: "flat", symbol: "♭" },
  { value: 0, id: "natural", symbol: "♮" },
  { value: 1, id: "sharp", symbol: "♯" },
] as const;

const accidentalModel = computed(() => ACCIDENTAL_OPTIONS.find((option) => option.value === accidental.value)?.id ?? "natural");
const staffAria = computed(() => t("reading.notes.staffAria", { clef: t(`reading.notes.clefs.${question.value.passage.clef.name}`) }));
const hintKey = computed(() => {
  if (!showAccidentals.value) return "reading.notes.hint";

  return level.value === "key-signatures" ? "reading.notes.hintKey" : "reading.notes.hintAccidentals";
});
const feedback = computed(() => {
  if (!result.value) return "";

  return t(result.value.correct ? "reading.notes.correct" : "reading.notes.wrong", {
    note: formatSpelledNote(result.value.answer),
  });
});

function onLevelChange(value: unknown) {
  const next = Array.isArray(value) ? value[0] : value;
  if (typeof next === "string" && next) setLevel(next as NoteReadingLevelId);
}

function onAccidentalChange(value: unknown) {
  const next = Array.isArray(value) ? value[0] : value;
  const option = ACCIDENTAL_OPTIONS.find((candidate) => candidate.id === next);
  if (option) setAccidental(option.value);
}

function letterClass(letter: Letter): string {
  const current = result.value;

  if (!current) return "border-border bg-card/40 text-foreground hover:bg-accent/40 cursor-pointer";
  if (letter === current.letter && !current.correct) return "border-destructive bg-destructive/10 text-destructive cursor-default";
  if (letter === current.answer.letter) return "border-brand bg-brand-soft text-brand-soft-foreground cursor-default";

  return "border-border bg-card/20 text-muted-foreground opacity-60 cursor-default";
}

/** Mantém os botões focáveis depois de respondido (`aria-disabled` em vez de `disabled`). */
function onLetterClick(letter: Letter) {
  if (answered.value) return;

  answer(letter);
}

useTypingGuardedKeydown((event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const letter = key.length === 1 ? (key.toUpperCase() as Letter) : null;

  if (letter && NOTE_READING_LETTERS.includes(letter)) {
    if (!answered.value) {
      event.preventDefault();
      answer(letter);
    }
  } else if (key === "1" || key === "2" || key === "3") {
    if (!answered.value) setAccidental(Number(key) - 2);
  } else if ((key === "enter" || key === " ") && answered.value) {
    // O botão "Próxima" já trata o próprio Enter/Espaço; aqui só evita que o clique nativo vaze para a nota nova.
    if (event.target instanceof HTMLElement && event.target.dataset.nextButton !== undefined) return;

    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    next();
  }
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <chip-toggle-group
      :model-value="level"
      type="single"
      wrap
      :aria-label="t('reading.level')"
      class="w-fit max-w-full"
      @update:model-value="onLevelChange"
    >
      <chip-toggle-item
        v-for="levelId in NOTE_READING_LEVEL_IDS"
        :key="levelId"
        :value="levelId"
        class="px-3 py-1.5 text-sm"
      >
        {{ t(`reading.notes.levels.${levelId}`) }}
      </chip-toggle-item>
    </chip-toggle-group>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span>
        {{ t("reading.notes.score") }}: {{ score.correct }}/{{ score.total }}
        <template v-if="accuracyPercent !== null">· {{ t("reading.notes.accuracy", { percent: accuracyPercent }) }}</template>
      </span>
      <span v-if="streak > 1">🔥 {{ t("reading.notes.streak", { count: streak }) }}</span>
      <span v-if="bestStreak > 0" class="text-xs">{{ t("reading.notes.bestStreak", { count: bestStreak }) }}</span>
    </div>

    <div class="flex flex-col gap-4 rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <p class="text-base font-medium">
        {{ t("reading.notes.prompt") }}
      </p>

      <staff-notation
        :passage="question.passage"
        :ariaLabel="staffAria"
        :highlights="highlights"
        :show-time-signature="false"
        class="mx-auto w-full max-w-md"
      />

      <p class="text-xs text-muted-foreground">
        {{ t(hintKey) }}
      </p>

      <chip-toggle-group
        v-if="showAccidentals"
        :model-value="accidentalModel"
        type="single"
        :aria-label="t('reading.notes.accidental.label')"
        class="w-fit"
        @update:model-value="onAccidentalChange"
      >
        <chip-toggle-item
          v-for="option in ACCIDENTAL_OPTIONS"
          :key="option.id"
          :value="option.id"
          :aria-label="t(`reading.notes.accidental.${option.id}`)"
          class="px-3 py-1.5 text-sm"
        >
          {{ option.symbol }}
        </chip-toggle-item>
      </chip-toggle-group>

      <div role="group" :aria-label="t('reading.notes.letters')" class="grid grid-cols-7 gap-2">
        <button
          v-for="letter in NOTE_READING_LETTERS"
          :key="letter"
          type="button"
          :aria-disabled="answered"
          class="rounded-lg border py-3 text-center text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="letterClass(letter)"
          @click="onLetterClick(letter)"
        >
          {{ letter }}
        </button>
      </div>

      <div class="flex min-h-9 flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          class="text-sm font-medium"
          :class="result ? (result.correct ? 'text-brand-soft-foreground' : 'text-destructive') : ''"
        >
          {{ feedback }}
        </p>
        <button
          v-if="answered"
          type="button"
          data-next-button
          class="rounded-lg border border-border bg-card/40 px-4 py-1.5 text-sm font-medium transition-colors outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
          @click="next"
        >
          {{ t("reading.notes.next") }}
        </button>
      </div>
    </div>
  </div>
</template>
