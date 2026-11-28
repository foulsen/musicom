import { MIN_CUSTOM_ITEMS } from "./question-generators";

export interface WeakItemCustomSetInput {
  /** O ponto fraco que o usuário quer treinar. */
  itemId: string;
  /** Com o que ele costuma confundir esse item (se houver). */
  confusionId?: string | null;
  /** Os demais pontos fracos atuais do tipo de quiz. */
  otherWeakIds?: readonly string[];
  /** Pool da dificuldade atual: completa o conjunto até o mínimo. */
  poolIds: readonly string[];
  /** Ids existentes no tipo de quiz; qualquer outro é descartado. */
  validIds: readonly string[];
  min?: number;
}

/**
 * Monta o conjunto personalizado do atalho "Treinar este par": o item, sua confusão e os outros
 * pontos fracos (nessa prioridade), completando com itens do pool da dificuldade até `min` —
 * um par sozinho (2 itens) não gera questões, que precisam de 1 certa + 3 distratores.
 */
export function customSetForWeakItem({
  itemId,
  confusionId,
  otherWeakIds = [],
  poolIds,
  validIds,
  min = MIN_CUSTOM_ITEMS,
}: WeakItemCustomSetInput): string[] {
  const valid = new Set(validIds);
  const selected: string[] = [];

  for (const id of [itemId, confusionId, ...otherWeakIds, ...poolIds]) {
    if (!id || !valid.has(id) || selected.includes(id)) continue;

    // Prioritários entram sempre; o pool só entra enquanto faltar para o mínimo.
    const isPriority = id === itemId || id === confusionId || otherWeakIds.includes(id);
    if (isPriority || selected.length < min) selected.push(id);
  }

  return selected;
}
