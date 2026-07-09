import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { buildFlashcardDeck, type Flashcard } from "./flashcard-decks";
import { gradeLeitnerCard, initialLeitnerState, isDue, type LeitnerCardState } from "./leitner";
import { useDrillsStore } from "./use-drills-store";

export function useFlashcardDrill() {
  const store = useDrillsStore();
  const { cardStates } = storeToRefs(store);

  const deck = buildFlashcardDeck();

  function stateFor(id: string): LeitnerCardState {
    return cardStates.value[id] ?? initialLeitnerState(Date.now());
  }

  /** Só para exibição ("X de Y devidos") — reage a `cardStates` durante a sessão. */
  const dueCount = computed(
    () => deck.filter((card) => isDue(stateFor(card.id), Date.now())).length,
  );

  /**
   * Fila da sessão: um snapshot tirado **uma vez** ao abrir a página, não recomputada a
   * cada `grade()`. Antes, `activeQueue` era um `computed` sobre `dueCards` (que reordena
   * por `dueAt` conforme os cartões são graduados) e `current` indexava nele por
   * `currentIndex % length` — a fila mudava de tamanho/ordem debaixo do índice, pulando
   * ou repetindo cartões. Agora é uma fila de verdade: consome do topo, erros voltam
   * para o fim (revisão imediata dentro da mesma sessão).
   */
  const due = deck
    .filter((card) => isDue(stateFor(card.id), Date.now()))
    .sort((a, b) => stateFor(a.id).dueAt - stateFor(b.id).dueAt);

  const queue = ref<Flashcard[]>(due.length > 0 ? due : [...deck]);
  const isRevealed = ref(false);

  const current = computed(() => queue.value[0] ?? null);
  const isSessionComplete = computed(() => queue.value.length === 0);

  function reveal() {
    isRevealed.value = true;
  }

  function grade(correct: boolean) {
    const card = current.value;
    if (!card) return;

    cardStates.value[card.id] = gradeLeitnerCard(stateFor(card.id), correct, Date.now());

    queue.value = queue.value.slice(1);
    if (!correct) queue.value.push(card);

    isRevealed.value = false;
  }

  return {
    deckSize: deck.length,
    dueCount,
    remaining: computed(() => queue.value.length),
    current,
    isSessionComplete,
    isRevealed,
    reveal,
    grade,
  };
}
