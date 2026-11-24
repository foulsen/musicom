import { storeToRefs } from "pinia";
import { getCurrentScope, onScopeDispose, ref } from "vue";

import { estimateExtraLatencyMs } from "./latency-calibration";
import { useAudioLatencyStore } from "./use-audio-latency-store";
import { useNoteAudio, type TimedClick } from "./use-note-audio";

const CALIBRATION_BPM = 90;
const CALIBRATION_CLICKS = 16;
/** Folga depois do último clique para a última batida chegar. */
const GRACE_SECONDS = 0.6;

export type CalibrationPhase = "idle" | "running" | "done" | "failed";

/** Mede a latência da saída: o usuário bate junto com cliques e a mediana do atraso vira a compensação. */
export function useLatencyCalibration() {
  const { playTimeline, perceivedAudioTime } = useNoteAudio();
  const { extraLatencyMs } = storeToRefs(useAudioLatencyStore());

  const phase = ref<CalibrationPhase>("idle");
  const tapCount = ref(0);

  const pulse = 60 / CALIBRATION_BPM;
  const clicks: TimedClick[] = Array.from({ length: CALIBRATION_CLICKS }, (_, i) => ({
    offsetSeconds: i * pulse,
    accent: i % 4 === 0,
  }));
  const clickTimes = clicks.map((click) => click.offsetSeconds);

  let startTime = 0;
  let taps: number[] = [];
  let finishTimeout: ReturnType<typeof setTimeout> | undefined;

  async function start() {
    if (phase.value === "running") return;

    phase.value = "running";
    taps = [];
    tapCount.value = 0;

    const played = await playTimeline([], clicks);
    startTime = played.startTime;

    clearTimeout(finishTimeout);
    const totalSeconds = played.leadSeconds + clickTimes[clickTimes.length - 1] + GRACE_SECONDS;
    finishTimeout = setTimeout(finish, totalSeconds * 1000);
  }

  function tap() {
    if (phase.value !== "running" || startTime === 0) return;

    taps.push(perceivedAudioTime({ includeCalibration: false }) - startTime);
    tapCount.value = taps.length;
  }

  function finish() {
    const measured = estimateExtraLatencyMs(clickTimes, taps);
    startTime = 0;

    if (measured === null) {
      phase.value = "failed";
      return;
    }

    extraLatencyMs.value = measured;
    phase.value = "done";
  }

  if (getCurrentScope()) onScopeDispose(() => clearTimeout(finishTimeout));

  return { phase, tapCount, extraLatencyMs, start, tap };
}
