import { getCurrentScope, onScopeDispose, ref } from "vue";

import { eventKey, type Passage } from "@music-workspace/music-theory";

import { useNoteAudio } from "../use-note-audio";
import {
  buildPassageTimeline,
  type PassagePlaybackOptions,
  type PassageTimeline,
} from "./passage-playback";

export interface PlaybackHandle {
  /** Tempo do `AudioContext` em que o tick 0 (depois da contagem) toca. */
  tickZeroTime: number;
  timeline: PassageTimeline;
}

/** Toca uma passagem com contagem e metrônomo, expondo o evento que soa agora. */
export function usePassagePlayback() {
  const { playTimeline } = useNoteAudio();

  const isPlaying = ref(false);
  const activeEventKey = ref<string | null>(null);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  function clearTimeouts() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function play(passage: Passage, options: PassagePlaybackOptions): PlaybackHandle | null {
    if (isPlaying.value) return null;

    const timeline = buildPassageTimeline(passage, options);
    const { startTime } = playTimeline(timeline.notes, timeline.clicks);

    isPlaying.value = true;
    timeline.attacks.forEach((attack, index) => {
      const delayMs = (timeline.countInSeconds + timeline.attackSeconds[index]) * 1000;
      timeouts.push(
        setTimeout(() => {
          activeEventKey.value = eventKey(attack.measureIndex, attack.eventIndex);
        }, delayMs),
      );
    });
    timeouts.push(
      setTimeout(() => {
        isPlaying.value = false;
        activeEventKey.value = null;
        timeouts = [];
      }, timeline.totalSeconds * 1000),
    );

    return { tickZeroTime: startTime + timeline.countInSeconds, timeline };
  }

  if (getCurrentScope()) onScopeDispose(clearTimeouts);

  return { isPlaying, activeEventKey, play };
}
