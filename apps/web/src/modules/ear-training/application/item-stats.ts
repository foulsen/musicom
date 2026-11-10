import type { QuizKind } from "./question-generators";

// Sorteio ponderado mora em `shared` (3º uso); reexportado aqui para os imports existentes não mudarem.
export {
  MIN_ITEM_WEIGHT,
  itemWeight,
  pickWeighted,
  smoothedErrorRate,
} from "@/modules/shared/application/weighted-sampling";

/** Acertos/total de um item (id estável do domínio: semitons, nome do padrão de acorde/escala). */
export interface ItemScore {
  correct: number;
  total: number;
}

/** `itemStats[tipo][idDoItem]`. */
export type ItemStatsByKind = Partial<Record<QuizKind, Record<string, ItemScore>>>;

/** `confusions[tipo][idCorreto][idEscolhido] = vezes` — só erros. */
export type ConfusionsByKind = Partial<Record<QuizKind, Record<string, Record<string, number>>>>;

/** O recorte do store que o sampling adaptativo e o seletor leem (aceita também o snapshot sincronizado). */
export interface ItemStatsState {
  itemStats?: ItemStatsByKind;
  confusions?: ConfusionsByKind;
}

export interface WeakItem {
  id: string;
  correct: number;
  total: number;
  /** 0..1 */
  accuracy: number;
  /** Id mais frequentemente escolhido no lugar deste item (e quantas vezes), se houve erro registrado. */
  topConfusion: { id: string; count: number } | null;
}

/** Tentativas mínimas de um item para entrar na lista de pontos fracos. */
export const MIN_WEAK_ATTEMPTS = 3;

/** Confusão mais frequente de `correctId` restrita a `allowedIds` (ex.: o pool da dificuldade); empate = primeiro visto. */
export function topConfusionId(
  confusions: Record<string, number> | undefined,
  allowedIds: readonly string[],
  correctId: string,
): string | null {
  let best: string | null = null;
  let bestCount = 0;

  for (const [id, count] of Object.entries(confusions ?? {})) {
    if (id === correctId || !allowedIds.includes(id)) continue;
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }

  return best;
}

/**
 * Itens mais fracos de um tipo de quiz: com ao menos `minAttempts` tentativas e algum erro,
 * ordenados do menor para o maior acerto (empate: mais tentativas primeiro). Puro — também
 * serve ao painel "Hoje".
 */
export function weakestItems(
  state: ItemStatsState,
  kind: QuizKind,
  limit = 3,
  minAttempts = MIN_WEAK_ATTEMPTS,
): WeakItem[] {
  const items = Object.entries(state.itemStats?.[kind] ?? {})
    .filter(([, score]) => score.total >= minAttempts && score.correct < score.total)
    .map(([id, score]): WeakItem => {
      const confusions = state.confusions?.[kind]?.[id];
      const top = topConfusionId(confusions, Object.keys(confusions ?? {}), id);

      return {
        id,
        correct: score.correct,
        total: score.total,
        accuracy: score.correct / score.total,
        topConfusion: top && confusions ? { id: top, count: confusions[top] } : null,
      };
    });

  return items
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** Registra uma resposta (muta `state`, que é o estado reativo do store). Erros também contam a confusão. */
export function recordItemAnswer(
  state: { itemStats: ItemStatsByKind; confusions: ConfusionsByKind },
  kind: QuizKind,
  correctId: string,
  chosenId: string,
): void {
  const kindStats = (state.itemStats[kind] ??= {});
  const score = (kindStats[correctId] ??= { correct: 0, total: 0 });

  score.total += 1;
  if (chosenId === correctId) {
    score.correct += 1;
    return;
  }

  const byCorrect = (state.confusions[kind] ??= {});
  const byChosen = (byCorrect[correctId] ??= {});

  byChosen[chosenId] = (byChosen[chosenId] ?? 0) + 1;
}

/** Zera o histórico por item de um tipo de quiz. */
export function clearItemStats(
  state: { itemStats: ItemStatsByKind; confusions: ConfusionsByKind },
  kind: QuizKind,
): void {
  delete state.itemStats[kind];
  delete state.confusions[kind];
}
