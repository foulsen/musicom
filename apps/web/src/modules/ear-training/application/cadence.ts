import type { Pitch } from "@music-workspace/music-theory";

import type { TimedPitch } from "@/modules/shared/application/use-note-audio";

/**
 * I–IV–V–I em voicing fechado (baixo + tríade perto da tônica), em semitons a partir da tônica.
 * As vozes andam pouco entre os acordes, então o ouvido fixa a tonalidade e não o registro.
 */
const CADENCE_VOICINGS: readonly (readonly number[])[] = [
  [-12, 0, 4, 7], // I
  [-7, 0, 5, 9], // IV (6/4)
  [-5, -1, 2, 7], // V
  [-12, 0, 4, 7], // I
];

const CHORD_STEP_SECONDS = 0.8;
const CHORD_DURATION_SECONDS = 0.75;
/** Respiro entre a cadência e a nota-alvo: separa "contexto" de "pergunta". */
const TARGET_GAP_SECONDS = 0.5;
const TARGET_DURATION_SECONDS = 1.2;

export function cadenceChords(tonic: Pitch): Pitch[][] {
  return CADENCE_VOICINGS.map((voicing) => voicing.map((offset) => tonic.transpose(offset)));
}

/** Linha do tempo: cadência que estabelece o tom e, depois de uma pausa, as notas-alvo. */
export function cadenceTimeline(tonic: Pitch, targets: readonly Pitch[]): TimedPitch[] {
  const chords = cadenceChords(tonic).flatMap((chord, index) =>
    chord.map((pitch) => ({
      pitch,
      offsetSeconds: index * CHORD_STEP_SECONDS,
      durationSeconds: CHORD_DURATION_SECONDS,
    })),
  );

  const targetStart = CADENCE_VOICINGS.length * CHORD_STEP_SECONDS + TARGET_GAP_SECONDS;
  const notes = targets.map((pitch, index) => ({
    pitch,
    offsetSeconds: targetStart + index * TARGET_DURATION_SECONDS,
    durationSeconds: TARGET_DURATION_SECONDS,
  }));

  return [...chords, ...notes];
}

/** Fim da linha do tempo, em ms — para o estado "tocando" do botão Play. */
export function timelineDurationMs(timeline: readonly TimedPitch[]): number {
  const end = Math.max(0, ...timeline.map((note) => note.offsetSeconds + note.durationSeconds));

  return Math.round(end * 1000);
}
