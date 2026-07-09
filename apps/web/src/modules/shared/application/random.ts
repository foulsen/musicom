export function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomChoice<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/** Amostra `count` itens distintos de `pool`, excluindo os que satisfazem `exclude`. */
export function sampleDistinct<T>(pool: readonly T[], count: number, exclude: (item: T) => boolean): T[] {
  return shuffle(pool.filter((item) => !exclude(item))).slice(0, count);
}
