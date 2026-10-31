import { weakestItems, type ItemStatsState } from "@/modules/ear-training/application/item-stats";
import type { QuizKind } from "@/modules/ear-training/application/question-generators";
import type { StringAccuracy } from "@/modules/drills/application/note-id-sampling";

/** Tipos de quiz do Treino de Ouvido, na ordem em que desempatam. */
const EAR_KINDS: readonly QuizKind[] = ["interval", "chordQuality", "scale"];

/** Quantos pontos fracos de ouvido o painel "Hoje" lista. */
export const TODAY_WEAK_EAR_LIMIT = 3;

/** Tentativas mínimas numa corda para o painel apontá-la como a mais fraca do Note ID. */
export const TODAY_NOTE_ID_MIN_ATTEMPTS = 10;

/** Acima disso a corda já está boa o bastante para não ser chamada de "ponto fraco". */
export const TODAY_NOTE_ID_MAX_PERCENT = 85;

export interface WeakEarItem {
  kind: QuizKind;
  id: string;
  correct: number;
  total: number;
  /** 0..1 */
  accuracy: number;
}

/**
 * Pontos fracos de ouvido somando os três tipos de quiz: pior acerto primeiro (empate: mais tentativas,
 * depois a ordem dos tipos). Reaproveita `weakestItems`, então valem as mesmas regras de mínimo de tentativas.
 */
export function weakestEarItems(state: ItemStatsState, limit = TODAY_WEAK_EAR_LIMIT): WeakEarItem[] {
  return EAR_KINDS.flatMap((kind) =>
    weakestItems(state, kind, limit).map(
      ({ id, correct, total, accuracy }): WeakEarItem => ({ kind, id, correct, total, accuracy }),
    ),
  )
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, limit);
}

/** A corda do Note ID com pior acerto, se tiver tentativas suficientes e ainda estiver abaixo do limite "boa". */
export function weakestNoteIdString(
  summary: readonly StringAccuracy[],
  minAttempts = TODAY_NOTE_ID_MIN_ATTEMPTS,
  maxPercent = TODAY_NOTE_ID_MAX_PERCENT,
): StringAccuracy | null {
  let weakest: StringAccuracy | null = null;

  for (const entry of summary) {
    if (entry.percent === null || entry.total < minAttempts || entry.percent > maxPercent) continue;
    if (!weakest || entry.percent < (weakest.percent ?? 100)) weakest = entry;
  }

  return weakest;
}
