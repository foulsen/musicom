import {
  passageAttacks,
  passageTotalTicks,
  secondsPerTick,
  type Attack,
  type Passage,
  type SpelledPitch,
} from "@music-workspace/music-theory";

import type { TimedClick, TimedPitch } from "../use-note-audio";

/** Fração da duração escrita que a nota soa — deixa um respiro entre notas repetidas. */
const NOTE_LENGTH_RATIO = 0.95;

export interface PassagePlaybackOptions {
  /** Andamento em pulsos por minuto (em compasso composto, o pulso é a figura pontuada). */
  bpm: number;
  /** Um compasso de cliques antes da primeira nota. */
  countIn?: boolean;
  /** Metrônomo durante a passagem. */
  click?: boolean;
  /** Toca este pitch em todos os ataques, ignorando as alturas escritas (exercícios de ritmo). */
  pitchOverride?: SpelledPitch;
}

export interface PassageTimeline {
  notes: TimedPitch[];
  clicks: TimedClick[];
  /** Um compasso de pulsos quando há contagem, senão 0. */
  countInSeconds: number;
  /** Um item por `passageAttacks()`, relativo ao tick 0 (depois da contagem). */
  attackSeconds: number[];
  attacks: Attack[];
  /** Contagem + duração da passagem. */
  totalSeconds: number;
}

/**
 * Converte uma passagem em notas e cliques com tempo absoluto (em segundos).
 * Toda a matemática de tempo da reprodução vive aqui; o composable só agenda.
 */
export function buildPassageTimeline(passage: Passage, options: PassagePlaybackOptions): PassageTimeline {
  const { time } = passage;
  const secondsPerTickValue = secondsPerTick(options.bpm, time);
  const pulseSeconds = time.pulseTicks() * secondsPerTickValue;
  const pulsesPerMeasure = time.pulsesPerMeasure();

  const countInSeconds = options.countIn ? pulsesPerMeasure * pulseSeconds : 0;

  const clicks: TimedClick[] = [];
  if (options.countIn) {
    for (let pulse = 0; pulse < pulsesPerMeasure; pulse++) {
      clicks.push({ offsetSeconds: pulse * pulseSeconds, accent: pulse === 0 });
    }
  }
  if (options.click) {
    const totalPulses = passage.measures.length * pulsesPerMeasure;
    for (let pulse = 0; pulse < totalPulses; pulse++) {
      clicks.push({
        offsetSeconds: countInSeconds + pulse * pulseSeconds,
        accent: pulse % pulsesPerMeasure === 0,
      });
    }
  }

  const attacks = passageAttacks(passage);
  const attackSeconds = attacks.map((attack) => attack.tick * secondsPerTickValue);

  const notes: TimedPitch[] = [];
  attacks.forEach((attack, index) => {
    const pitches = options.pitchOverride ? [options.pitchOverride] : attack.event.pitches;
    for (const pitch of pitches) {
      notes.push({
        pitch: pitch.pitch(),
        offsetSeconds: countInSeconds + attackSeconds[index],
        durationSeconds: attack.durationTicks * secondsPerTickValue * NOTE_LENGTH_RATIO,
      });
    }
  });

  return {
    notes,
    clicks,
    countInSeconds,
    attackSeconds,
    attacks,
    totalSeconds: countInSeconds + passageTotalTicks(passage) * secondsPerTickValue,
  };
}
