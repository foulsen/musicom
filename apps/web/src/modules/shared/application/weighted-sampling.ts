/** Sorteio adaptativo ponderado por erro, compartilhado pelos módulos de prática (ear-training, leitura). */

/** Peso mínimo no sorteio: todo item do pool continua aparecendo, mesmo os que o usuário domina. */
export const MIN_ITEM_WEIGHT = 0.15;

/**
 * Taxa de erro suavizada (prior de 1 erro em 2 tentativas): item nunca visto vale 0,5 e a taxa só
 * converge para 0 ou 1 com bastante evidência — poucas tentativas não derrubam nem inflam o peso.
 */
export function smoothedErrorRate(score: { correct: number; total: number } | undefined): number {
  const correct = score?.correct ?? 0;
  const total = score?.total ?? 0;

  return (total - correct + 1) / (total + 2);
}

/** Peso de sorteio do item correto: proporcional à taxa de erro suavizada, com piso. */
export function itemWeight(score: { correct: number; total: number } | undefined): number {
  return Math.max(MIN_ITEM_WEIGHT, smoothedErrorRate(score));
}

/** Escolha ponderada. `random` devolve [0, 1) e é injetável para testes determinísticos. */
export function pickWeighted<T>(
  items: readonly T[],
  weights: readonly number[],
  random: () => number = Math.random,
): T {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let threshold = random() * total;

  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i];
    if (threshold < 0) return items[i];
  }

  return items[items.length - 1];
}
