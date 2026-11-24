/** Batidas válidas mínimas para confiar na estimativa. */
export const CALIBRATION_MIN_TAPS = 6;

/** Distância máxima (s) entre batida e clique para entrarem na conta; além disso é batida perdida. */
const MAX_PAIR_DISTANCE = 0.5;

/** Teto da latência aceita (ms): acima disso a medição quase certamente deu errado. */
export const MAX_EXTRA_LATENCY_MS = 500;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Estima a latência de saída a partir de batidas feitas junto com cliques ouvidos (ambos em
 * segundos, mesma base). Cada batida casa com o clique mais próximo; a mediana dos atrasos
 * ignora batidas fora de hora. Devolve ms (0..`MAX_EXTRA_LATENCY_MS`) ou `null` sem batidas suficientes.
 */
export function estimateExtraLatencyMs(clickTimes: number[], taps: number[]): number | null {
  if (clickTimes.length === 0) return null;

  const deltas: number[] = [];
  for (const tap of taps) {
    const nearest = clickTimes.reduce((best, click) => (Math.abs(tap - click) < Math.abs(tap - best) ? click : best));
    const delta = tap - nearest;
    if (Math.abs(delta) <= MAX_PAIR_DISTANCE) deltas.push(delta);
  }

  if (deltas.length < CALIBRATION_MIN_TAPS) return null;

  const ms = Math.round(median(deltas) * 1000);
  return Math.min(Math.max(ms, 0), MAX_EXTRA_LATENCY_MS);
}
