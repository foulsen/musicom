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

/**
 * Linha do tempo: cadência que estabelece o tom e, depois de uma pausa, as notas-alvo.
 * `tempo` é um fator de velocidade (1 = normal; > 1 mais rápido): divide todos os offsets e durações.
 */
export function cadenceTimeline(tonic: Pitch, targets: readonly Pitch[], tempo = 1): TimedPitch[] {
  const chords = cadenceChords(tonic).flatMap((chord, index) =>
    chord.map((pitch) => ({
      pitch,
      offsetSeconds: (index * CHORD_STEP_SECONDS) / tempo,
      durationSeconds: CHORD_DURATION_SECONDS / tempo,
    })),
  );

  const targetStart = CADENCE_VOICINGS.length * CHORD_STEP_SECONDS + TARGET_GAP_SECONDS;

  return [...chords, ...targetNotes(targets, targetStart, tempo)];
}

/** Notas-alvo em sequência a partir de `startSeconds` (no andamento normal), cada uma TARGET_DURATION_SECONDS depois da anterior. */
function targetNotes(targets: readonly Pitch[], startSeconds: number, tempo: number): TimedPitch[] {
  return targets.map((pitch, index) => ({
    pitch,
    offsetSeconds: (startSeconds + index * TARGET_DURATION_SECONDS) / tempo,
    durationSeconds: TARGET_DURATION_SECONDS / tempo,
  }));
}

/** Só a melodia, sem a cadência — mesmo espaçamento de `cadenceTimeline`, para reouvir depois de o tom já estar claro. */
export function melodyTimeline(notes: readonly Pitch[], tempo = 1): TimedPitch[] {
  return targetNotes(notes, 0, tempo);
}

/** Fim da linha do tempo, em ms — para o estado "tocando" do botão Play. */
export function timelineDurationMs(timeline: readonly TimedPitch[]): number {
  const end = Math.max(0, ...timeline.map((note) => note.offsetSeconds + note.durationSeconds));

  return Math.round(end * 1000);
}
