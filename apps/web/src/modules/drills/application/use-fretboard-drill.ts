import { computed, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { Fretboard, Note, STANDARD_GUITAR_TUNING, type FretPosition } from "@music-workspace/music-theory";

import { randomChoice } from "@/modules/shared/application/random";

import { useDrillsStore } from "./use-drills-store";

const TARGET_NOTES: Note[] = STANDARD_GUITAR_TUNING.strings
  .map((pitch) => pitch.note)
  .filter((note, index, all) => all.findIndex((other) => other.equals(note)) === index);

function keyFor(position: FretPosition): string {
  return `${position.string}-${position.fret}`;
}

export function useFretboardDrill() {
  const store = useDrillsStore();
  const { fretboardBestMs } = storeToRefs(store);

  const fretboard = new Fretboard(STANDARD_GUITAR_TUNING, 12);
  const positions = fretboard.positions();

  const targetNote = ref<Note>(randomChoice(TARGET_NOTES));
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

  function stopTimer() {
    clearInterval(timer);
    timer = undefined;
  }

  function start() {
    targetNote.value = randomChoice(TARGET_NOTES);
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

    if (fretboardBestMs.value === 0 || elapsedMs.value < fretboardBestMs.value) {
      fretboardBestMs.value = elapsedMs.value;
    }
  }

  function guess(position: FretPosition) {
    if (!isActive.value) return;

    const key = keyFor(position);

    if (position.pitch.note.equals(targetNote.value)) {
      foundKeys.value.add(key);
      wrongKey.value = null;

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
    bestMs: fretboardBestMs,
    start,
    guess,
  };
}
