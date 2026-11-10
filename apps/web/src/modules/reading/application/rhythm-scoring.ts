/** Janela (s) em que uma batida conta como acerto de um ataque esperado. */
export const RHYTHM_TOLERANCE = 0.12;

export interface RhythmScore {
  /** Um item por ataque esperado. */
  results: ("hit" | "miss")[];
  /** Batidas que não casaram com nenhum ataque. */
  extraTaps: number;
  /** acertos / (ataques esperados + batidas extras), 0..1. */
  accuracy: number;
}

/**
 * Compara as batidas com os ataques esperados (ambos em segundos a partir do tick 0).
 * Guloso em ordem de tempo: cada batida casa com o primeiro ataque ainda livre dentro da tolerância.
 */
export function scoreRhythmTaps(expected: number[], taps: number[], tolerance = RHYTHM_TOLERANCE): RhythmScore {
  const matched = expected.map(() => false);
  let extraTaps = 0;

  // Folga mínima contra imprecisão de ponto flutuante na borda da janela.
  const limit = tolerance + 1e-9;

  for (const tap of [...taps].sort((a, b) => a - b)) {
    const index = expected.findIndex((time, i) => !matched[i] && Math.abs(tap - time) <= limit);

    if (index === -1) extraTaps++;
    else matched[index] = true;
  }

  const hits = matched.filter(Boolean).length;
  const total = expected.length + extraTaps;

  return {
    results: matched.map((hit) => (hit ? "hit" : "miss")),
    extraTaps,
    accuracy: total === 0 ? 0 : hits / total,
  };
}
