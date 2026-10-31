import type { FretPosition } from "@music-workspace/music-theory";

import type { DrillScore } from "./use-drills-store";

/** Placar por posição do braço, indexado por `positionKey` — esparso: posição nunca respondida não tem entrada. */
export type NoteIdStats = Record<string, DrillScore>;

/** Peso mínimo de qualquer posição: mesmo a mais dominada continua aparecendo de vez em quando. */
export const WEIGHT_FLOOR = 0.15;

export function positionKey(position: Pick<FretPosition, "string" | "fret">): string {
  return `${position.string}-${position.fret}`;
}

/**
 * Peso de amostragem de uma posição: taxa de erro suavizada (Laplace, `(erros + 1) / (tentativas + 2)`)
 * reescalada para [piso, 1]. Posição inédita pesa ~0,58 (entra cedo, sem dominar); quem erra sempre
 * tende a 1; quem acerta sempre decai até o piso, nunca a zero.
 */
export function positionWeight(stat: DrillScore | undefined): number {
  const total = stat?.total ?? 0;
  const wrong = total - (stat?.correct ?? 0);
  const errorRate = (wrong + 1) / (total + 2);

  return WEIGHT_FLOOR + (1 - WEIGHT_FLOOR) * errorRate;
}

/**
 * Sorteia uma posição do `pool` com probabilidade proporcional ao `positionWeight`.
 * `previousKey` (a posição da rodada anterior) é excluída quando há alternativa — sem repetição imediata.
 * `random` é injetável (0 <= r < 1) para testar de forma determinística.
 */
export function chooseNoteIdPosition(
  pool: readonly FretPosition[],
  stats: NoteIdStats,
  random: () => number = Math.random,
  previousKey?: string,
): FretPosition {
  const candidates = pool.length > 1 ? pool.filter((position) => positionKey(position) !== previousKey) : pool;
  const weights = candidates.map((position) => positionWeight(stats[positionKey(position)]));
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  let threshold = random() * total;
  for (let index = 0; index < candidates.length; index++) {
    threshold -= weights[index];
    if (threshold < 0) return candidates[index];
  }

  return candidates[candidates.length - 1];
}

export interface StringAccuracy {
  /** Índice da corda (0 = mais grave). */
  string: number;
  correct: number;
  total: number;
  /** 0–100 arredondado; `null` quando a corda ainda não tem respostas. */
  percent: number | null;
}

/** Acerto por corda, somando as posições do `pool` (ex.: só as casas do nível ativo). Ordem: da mais grave à mais aguda. */
export function summarizeByString(pool: readonly FretPosition[], stats: NoteIdStats): StringAccuracy[] {
  const byString = new Map<number, DrillScore>();

  for (const position of pool) {
    const tally = byString.get(position.string) ?? { correct: 0, total: 0 };
    const stat = stats[positionKey(position)];

    tally.correct += stat?.correct ?? 0;
    tally.total += stat?.total ?? 0;
    byString.set(position.string, tally);
  }

  return [...byString.entries()]
    .sort(([a], [b]) => a - b)
    .map(([string, { correct, total }]) => ({
      string,
      correct,
      total,
      percent: total === 0 ? null : Math.round((correct / total) * 100),
    }));
}

/** Registra uma resposta no placar da posição (imutável — devolve um novo mapa para o store reagir). */
export function recordAnswer(stats: NoteIdStats, position: Pick<FretPosition, "string" | "fret">, correct: boolean): NoteIdStats {
  const key = positionKey(position);
  const previous = stats[key] ?? { correct: 0, total: 0 };

  return { ...stats, [key]: { correct: previous.correct + (correct ? 1 : 0), total: previous.total + 1 } };
}
