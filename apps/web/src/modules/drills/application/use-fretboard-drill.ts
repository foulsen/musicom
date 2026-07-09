import { computed, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import {
  CHROMATIC_SCALE,
  Fretboard,
  Note,
  STANDARD_GUITAR_TUNING,
  type FretPosition,
} from "@music-workspace/music-theory";

import { randomChoice } from "@/modules/shared/application/random";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { useDrillsStore } from "./use-drills-store";

const ALL_TARGET_NOTES: Note[] = CHROMATIC_SCALE.map((value) => Note.from(value));
const NATURAL_TARGET_NOTES: Note[] = ALL_TARGET_NOTES.filter((note) => !note.value.includes("#"));

function keyFor(position: FretPosition): string {
  return `${position.string}-${position.fret}`;
}

export function useFretboardDrill() {
  const store = useDrillsStore();
  const { fretboardBestMsByNote, fretboardNaturalsOnly } = storeToRefs(store);
  const { play } = useNoteAudio();

  const fretboard = new Fretboard(STANDARD_GUITAR_TUNING, 12);
  const positions = fretboard.positions();

  /** As 12 notas cromáticas (com toggle "só naturais"); antes só as 5 cordas soltas. */
  const targetNotes = computed(() => (fretboardNaturalsOnly.value ? NATURAL_TARGET_NOTES : ALL_TARGET_NOTES));

  const targetNote = ref<Note>(randomChoice(targetNotes.value));
  const foundKeys = ref<Set<string>>(new Set());
  const wrongKey = ref<string | null>(null);
  const isActive = ref(false);
  const isComplete = ref(false);
  const elapsedMs = ref(0);

  let startedAt = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const totalTargets = computed(
    () => positions.flat().filter((position) => position.pitch.note.equals(targetNote.value)).length,
  );

  /** Recorde da nota-alvo atual (não um recorde global — a dificuldade varia por nota). */
  const bestMs = computed(() => fretboardBestMsByNote.value[targetNote.value.value] ?? 0);

  function stopTimer() {
    clearInterval(timer);
    timer = undefined;
  }

  function start() {
    targetNote.value = randomChoice(targetNotes.value);
    foundKeys.value = new Set();
    wrongKey.value = null;
    isActive.value = true;
    isComplete.value = false;
    elapsedMs.value = 0;
    startedAt = Date.now();

    stopTimer();
    timer = setInterval(() => {
      elapsedMs.value = Date.now() - startedAt;
    }, 100);
  }

  function finish() {
    isActive.value = false;
    isComplete.value = true;
    stopTimer();

    const note = targetNote.value.value;
    const previousBest = fretboardBestMsByNote.value[note];

    if (previousBest === undefined || elapsedMs.value < previousBest) {
      fretboardBestMsByNote.value[note] = elapsedMs.value;
    }
  }

  function setNaturalsOnly(value: boolean) {
    fretboardNaturalsOnly.value = value;
  }

  function guess(position: FretPosition) {
    if (!isActive.value) return;

    const key = keyFor(position);

    if (position.pitch.note.equals(targetNote.value)) {
      foundKeys.value.add(key);
      wrongKey.value = null;
      play(position.pitch);

      if (foundKeys.value.size >= totalTargets.value) {
        finish();
      }
    } else {
      wrongKey.value = key;
    }
  }

  onUnmounted(stopTimer);

  return {
    positions,
    targetNote,
    foundKeys,
    wrongKey,
    isActive,
    isComplete,
    elapsedMs,
    totalTargets,
    bestMs,
    naturalsOnly: fretboardNaturalsOnly,
    setNaturalsOnly,
    start,
    guess,
  };
}
