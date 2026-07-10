/**
 * Presets de timbre: cada instrumento é uma pequena série harmônica aditiva
 * (osciladores senoidais na fundamental e múltiplos dela) somada e passada por
 * um filtro passa-baixas cujo corte "fecha" ao longo do decaimento — é o que
 * dá a sensação de corda/martelo perdendo brilho conforme a nota morre — mais
 * um breve transiente de ruído no ataque (dedo/martelo tocando a corda/palheta).
 */

export type InstrumentId = "piano" | "guitar" | "realistic-guitar";

export interface HarmonicSpec {
  /** Múltiplo da frequência fundamental. */
  ratio: number;
  /** Ganho relativo (1 = mesmo nível da fundamental). */
  gain: number;
}

export interface InstrumentPreset {
  harmonics: HarmonicSpec[];
  /** Duração da subida do envelope de amplitude, em segundos. */
  attack: number;
  /** Constante de tempo (segundos) do decaimento exponencial do fundamental após o ataque. */
  decay: number;
  /**
   * Amortecimento modal: quanto os harmônicos superiores decaem mais rápido que o
   * fundamental — o traço que mais aproxima uma corda dedilhada real (os agudos
   * "abrem" no ataque e somem primeiro, o fundamental sustenta). `0` (ou ausente)
   * faz todos decaírem juntos; `~0.75` dá a queda modal típica de corda de nylon.
   * O decaimento do harmônico `n` é `decay / (1 + (ratio - 1) * harmonicDamping)`.
   */
  harmonicDamping?: number;
  /** Corte do filtro no pico do ataque, em múltiplos da frequência fundamental. */
  filterStart: number;
  /** Corte do filtro ao fim do decaimento, em múltiplos da frequência fundamental. */
  filterEnd: number;
  filterQ: number;
  /**
   * Ressonância do corpo (violão/piano): filtro "peaking" numa frequência FIXA em Hz
   * (não relativa à nota, como o corpo de madeira real) que dá o timbre encorpado e
   * amadeirado. Ausente = sem corpo. `bodyResonanceGain` é em dB.
   */
  bodyResonanceHz?: number;
  bodyResonanceGain?: number;
  bodyResonanceQ?: number;
  /** Intensidade do transiente de ruído do ataque (0 desliga o transiente). */
  noiseAmount: number;
  /** Constante de tempo (segundos) do decaimento do transiente de ruído. */
  noiseDecay: number;
  /** Filtro do transiente — dá o caráter de "thump" (grave) ou "click" (agudo). */
  noiseFilterType: BiquadFilterType;
  noiseFilterFrequency: number;
}

export const INSTRUMENT_PRESETS: Record<InstrumentId, InstrumentPreset> = {
  piano: {
    harmonics: [
      { ratio: 1, gain: 1 },
      { ratio: 2, gain: 0.55 },
      { ratio: 3, gain: 0.25 },
      { ratio: 4, gain: 0.12 },
      { ratio: 5, gain: 0.06 },
      { ratio: 6, gain: 0.03 },
    ],
    attack: 0.005,
    decay: 0.9,
    filterStart: 6,
    filterEnd: 1.5,
    filterQ: 0.7,
    noiseAmount: 0.05,
    noiseDecay: 0.03,
    noiseFilterType: "lowpass",
    noiseFilterFrequency: 800,
  },
  guitar: {
    harmonics: [
      { ratio: 1, gain: 1 },
      { ratio: 2, gain: 0.65 },
      { ratio: 3, gain: 0.45 },
      { ratio: 4, gain: 0.25 },
      { ratio: 5, gain: 0.15 },
      { ratio: 6, gain: 0.08 },
      { ratio: 7, gain: 0.05 },
    ],
    attack: 0.003,
    decay: 0.3,
    filterStart: 8,
    filterEnd: 2,
    filterQ: 0.9,
    noiseAmount: 0.12,
    noiseDecay: 0.015,
    noiseFilterType: "highpass",
    noiseFilterFrequency: 2500,
  },
  /**
   * Violão de nylon (cordas de nylon) tentando um som "médio" realista. Diferente do
   * `guitar` genérico, apoia-se no decaimento modal (harmônicos superiores morrem bem
   * antes do fundamental) e numa ressonância de corpo fixa, que é o que dá o timbre
   * amadeirado e quente do instrumento acústico. Espectro caloroso: fundamental forte
   * e rolloff suave dos agudos (nylon tem menos energia alta que aço). O transiente é
   * o toque macio da polpa/unha do dedo, não a palheta.
   */
  "realistic-guitar": {
    harmonics: [
      { ratio: 1, gain: 1 },
      { ratio: 2, gain: 0.6 },
      { ratio: 3, gain: 0.32 },
      { ratio: 4, gain: 0.2 },
      { ratio: 5, gain: 0.12 },
      { ratio: 6, gain: 0.06 },
      { ratio: 7, gain: 0.04 },
      { ratio: 8, gain: 0.025 },
    ],
    attack: 0.008,
    decay: 0.7,
    harmonicDamping: 0.75,
    filterStart: 6,
    filterEnd: 3,
    filterQ: 0.6,
    bodyResonanceHz: 110,
    bodyResonanceGain: 4,
    bodyResonanceQ: 1.1,
    noiseAmount: 0.05,
    noiseDecay: 0.008,
    noiseFilterType: "lowpass",
    noiseFilterFrequency: 3500,
  },
};

export const INSTRUMENT_IDS = Object.keys(INSTRUMENT_PRESETS) as InstrumentId[];
