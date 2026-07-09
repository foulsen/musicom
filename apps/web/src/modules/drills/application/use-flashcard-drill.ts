import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { buildFlashcardDeck } from "./flashcard-decks";
import { gradeLeitnerCard, initialLeitnerState, isDue, type LeitnerCardState } from "./leitner";
import { useDrillsStore } from "./use-drills-store";

export function useFlashcardDrill() {
  const store = useDrillsStore();
  const { cardStates } = storeToRefs(store);

  const deck = buildFlashcardDeck();

  function stateFor(id: string): LeitnerCardState {
    return cardStates.value[id] ?? initialLeitnerState(Date.now());
  }

  const dueCards = computed(() =>
    deck
      .map((card) => ({ card, state: stateFor(card.id) }))
      .filter(({ state }) => isDue(state, Date.now()))
      .sort((a, b) => a.state.dueAt - b.state.dueAt),
  );

  /** Se nada está devido, mantém o baralho inteiro disponível para prática livre. */
  const activeQueue = computed(() =>
    dueCards.value.length > 0 ? dueCards.value : deck.map((card) => ({ card, state: stateFor(card.id) })),
  );

  const currentIndex = ref(0);
  const isRevealed = ref(false);

  const current = computed(() => activeQueue.value[currentIndex.value % activeQueue.value.length] ?? null);

  function reveal() {
    isRevealed.value = true;
  }

  function grade(correct: boolean) {
    if (!current.value) return;

    cardStates.value[current.value.card.id] = gradeLeitnerCard(current.value.state, correct, Date.now());

    isRevealed.value = false;
    currentIndex.value += 1;
  }

  return {
    deckSize: deck.length,
    dueCount: computed(() => dueCards.value.length),
    current,
    isRevealed,
    reveal,
    grade,
  };
}
