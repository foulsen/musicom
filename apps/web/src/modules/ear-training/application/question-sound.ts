import { INSTRUMENT_IDS, type InstrumentId } from "@/modules/shared/application/instrument-presets";

/**
 * Som sorteado de uma questão ("Variar som"): timbre e andamento. Fica guardado na própria
 * questão para que repetir, "ouvir sua resposta" e "ouvir a correta" soem igual ao original.
 */
export interface QuestionSound {
  instrument: InstrumentId;
  /** Fator de velocidade: 1 = andamento normal; > 1 mais rápido. */
  tempo: number;
}

/** Fatores de andamento sorteáveis (mais lento, normal, mais rápido). */
export const TEMPO_FACTORS: readonly number[] = [0.8, 1, 1.25];

/** Intervalo entre notas de uma sequência no andamento normal (s). */
const SEQUENCE_GAP_SECONDS = 0.45;

/** Sorteia timbre e andamento; `random` (0 ≤ x < 1) é injetável para testar sem acaso. */
export function pickQuestionSound(random: () => number = Math.random): QuestionSound {
  return {
    instrument: INSTRUMENT_IDS[Math.floor(random() * INSTRUMENT_IDS.length)],
    tempo: TEMPO_FACTORS[Math.floor(random() * TEMPO_FACTORS.length)],
  };
}

/** Intervalo entre notas de uma sequência no andamento `tempo` (mais rápido = intervalo menor). */
export function sequenceGapSeconds(tempo = 1): number {
  return SEQUENCE_GAP_SECONDS / tempo;
}
