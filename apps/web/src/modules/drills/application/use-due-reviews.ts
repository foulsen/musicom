import { computed, getCurrentScope, onScopeDispose, ref } from "vue";
import { storeToRefs } from "pinia";

import { allCardIds } from "./flashcard-decks";
import { isDue, type LeitnerCardState } from "./leitner";
import { useDrillsStore } from "./use-drills-store";

/** Recalcula o "agora" a cada tanto, para a contagem não ficar parada enquanto o tempo passa. */
const REFRESH_MS = 30_000;

export interface DueSummary {
  /** Cartões já estudados cuja revisão venceu. */
  dueCount: number;
  /** Cartões nunca estudados (ainda sem estado) — não são "revisões", mas ficam prontos para começar. */
  newCount: number;
}

/** Puro: classifica os cartões em "revisão vencida" e "novos"; ids em `states` que não estão em `cardIds` são ignorados. */
export function summarizeDueReviews(
  cardIds: readonly string[],
  states: Record<string, LeitnerCardState>,
  now: number,
): DueSummary {
  let dueCount = 0;
  let newCount = 0;

  for (const id of cardIds) {
    const state = states[id];

    if (!state) newCount += 1;
    else if (isDue(state, now)) dueCount += 1;
  }

  return { dueCount, newCount };
}

// Relógio compartilhado entre todos os consumidores (sidebar desktop + drawer + painéis): um único timer,
// ligado enquanto houver pelo menos um escopo ativo usando o composable.
const now = ref(Date.now());
let subscribers = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe() {
  if (subscribers++ === 0) {
    now.value = Date.now();
    timer = setInterval(() => {
      now.value = Date.now();
    }, REFRESH_MS);
  }
}

function unsubscribe() {
  if (--subscribers === 0) {
    clearInterval(timer);
    timer = undefined;
  }
}

/**
 * Revisões pendentes somadas em **todos** os baralhos (para badge da navegação, painel "Hoje"…).
 * Reativo ao tempo (revisões vencem sozinhas) e ao progresso persistido. `dueCount` conta só cartões
 * já estudados; os nunca vistos vêm separados em `newCount`, para um usuário novo não ver "70 pendentes".
 */
export function useDueReviews() {
  const { cardStates } = storeToRefs(useDrillsStore());

  if (getCurrentScope()) {
    subscribe();
    onScopeDispose(unsubscribe);
  }

  const summary = computed(() => summarizeDueReviews(allCardIds(), cardStates.value, now.value));

  return {
    dueCount: computed(() => summary.value.dueCount),
    newCount: computed(() => summary.value.newCount),
  };
}
