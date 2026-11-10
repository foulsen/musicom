import { storeToRefs } from "pinia";
import { computed, getCurrentScope, onScopeDispose, ref, watch } from "vue";

import { eventKey, rest, SpelledPitch, type Passage } from "@music-workspace/music-theory";

import { buildPassageTimeline } from "@/modules/shared/application/notation/passage-playback";
import { usePassagePlayback, type PlaybackHandle } from "@/modules/shared/application/notation/use-passage-playback";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";
import type { StaffHighlight } from "@/modules/shared/components/staff-notation";

import type { RhythmLevelId } from "./reading-types";
import { generateRhythm } from "./rhythm-generator";
import { RHYTHM_TOLERANCE, scoreRhythmTaps, type RhythmScore } from "./rhythm-scoring";
import { useReadingStore } from "./use-reading-store";

/** Folga depois do fim da passagem para a última batida chegar antes de corrigir. */
const SCORING_GRACE_SECONDS = 0.4;

const LISTEN_PITCH = SpelledPitch.parse("C5");

export type RhythmPhase = "idle" | "running" | "listening" | "scored";

export interface RhythmResult extends RhythmScore {
  hits: number;
  expectedCount: number;
  isNewBest: boolean;
}

/** Mesma passagem com as notas trocadas por pausas: toca só a contagem e o metrônomo, sem entregar o ritmo. */
function silenced(passage: Passage): Passage {
  return {
    ...passage,
    measures: passage.measures.map((measure) => ({ events: measure.events.map((event) => rest(event.duration)) })),
  };
}

/** Estado e ações do exercício de leitura rítmica com batidas. */
export function useRhythmReading() {
  const store = useReadingStore();
  const { rhythmLevel, rhythmBpm, rhythmBest } = storeToRefs(store);
  const { perceivedAudioTime } = useNoteAudio();
  const playback = usePassagePlayback();

  const passage = ref<Passage>(generateRhythm(rhythmLevel.value));
  const metronome = ref(true);
  const phase = ref<RhythmPhase>("idle");
  const tapCount = ref(0);
  const result = ref<RhythmResult | null>(null);

  let handle: PlaybackHandle | null = null;
  let taps: number[] = [];
  let scoringTimeout: ReturnType<typeof setTimeout> | undefined;

  const isBusy = computed(() => phase.value === "running" || phase.value === "listening" || playback.isPlaying.value);
  const best = computed(() => rhythmBest.value[rhythmLevel.value]);

  const highlights = computed<Record<string, StaffHighlight>>(() => {
    const marks: Record<string, StaffHighlight> = {};

    if (phase.value === "scored" && result.value) {
      const { attacks } = buildPassageTimeline(passage.value, { bpm: rhythmBpm.value });
      attacks.forEach((attack, index) => {
        marks[eventKey(attack.measureIndex, attack.eventIndex)] = result.value?.results[index] === "hit" ? "correct" : "wrong";
      });
    } else if (phase.value === "listening" && playback.activeEventKey.value) {
      marks[playback.activeEventKey.value] = "active";
    }

    return marks;
  });

  function reset() {
    clearTimeout(scoringTimeout);
    handle = null;
    taps = [];
    tapCount.value = 0;
    result.value = null;
    phase.value = "idle";
  }

  function next() {
    if (isBusy.value) return;

    reset();
    passage.value = generateRhythm(rhythmLevel.value);
  }

  function selectLevel(level: RhythmLevelId) {
    if (isBusy.value) return;

    rhythmLevel.value = level;
  }

  // Cobre também o deep-link, que troca o nível depois da criação do painel.
  watch(rhythmLevel, () => {
    if (!isBusy.value) next();
  });

  function score() {
    if (!handle) return;

    // Tempo dos ataques esperados na mesma base das batidas (segundos desde o tick 0).
    const expected = buildPassageTimeline(passage.value, { bpm: rhythmBpm.value }).attackSeconds;
    const scored = scoreRhythmTaps(expected, taps);
    const level = rhythmLevel.value;
    const bestBefore = rhythmBest.value[level];
    const isNewBest = bestBefore === undefined || scored.accuracy > bestBefore;

    if (isNewBest) rhythmBest.value = { ...rhythmBest.value, [level]: scored.accuracy };

    result.value = {
      ...scored,
      hits: scored.results.filter((value) => value === "hit").length,
      expectedCount: expected.length,
      isNewBest,
    };
    phase.value = "scored";
  }

  /** Conta e metrônomo tocam, mas as notas não: quem lê é que precisa produzir o ritmo. */
  function start() {
    if (isBusy.value) return;

    const played = playback.play(silenced(passage.value), {
      bpm: rhythmBpm.value,
      countIn: true,
      click: metronome.value,
    });
    if (!played) return;

    result.value = null;
    taps = [];
    tapCount.value = 0;
    handle = played;
    phase.value = "running";

    clearTimeout(scoringTimeout);
    scoringTimeout = setTimeout(score, (played.timeline.totalSeconds + SCORING_GRACE_SECONDS) * 1000);
  }

  /** Toca o ritmo escrito como modelo, com contagem e metrônomo. */
  function listen() {
    if (isBusy.value) return;

    const played = playback.play(passage.value, {
      bpm: rhythmBpm.value,
      countIn: true,
      click: true,
      pitchOverride: LISTEN_PITCH,
    });
    if (!played) return;

    result.value = null;
    phase.value = "listening";
  }

  watch(playback.isPlaying, (playing) => {
    if (!playing && phase.value === "listening") phase.value = "idle";
  });

  function tap() {
    if (phase.value !== "running" || !handle) return;

    const time = perceivedAudioTime() - handle.tickZeroTime;
    // Batidas durante a contagem não valem; uma batida levemente adiantada no primeiro ataque ainda vale.
    if (time < -RHYTHM_TOLERANCE) return;

    taps.push(time);
    tapCount.value = taps.length;
  }

  if (getCurrentScope()) onScopeDispose(() => clearTimeout(scoringTimeout));

  return {
    passage,
    level: rhythmLevel,
    bpm: rhythmBpm,
    metronome,
    phase,
    isBusy,
    highlights,
    tapCount,
    result,
    best,
    start,
    listen,
    next,
    tap,
    selectLevel,
  };
}
