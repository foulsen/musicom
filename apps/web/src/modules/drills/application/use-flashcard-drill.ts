import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { buildDeck, DECK_IDS, type DeckId, type Flashcard } from "./flashcard-decks";
import { gradeLeitnerCard, initialLeitnerState, isDue, LEITNER_BOX_COUNT, type LeitnerCardState } from "./leitner";
import { useDrillsStore } from "./use-drills-store";

/** Recalcula o placar "devidos" a cada tanto, para o badge não ficar parado enquanto o tempo passa. */
const DUE_COUNT_REFRESH_MS = 30_000;

export function useFlashcardDrill() {
  const store = useDrillsStore();
  const { cardStates, activeDeckId } = storeToRefs(store);

  const deck = ref<Flashcard[]>([]);
  const queue = ref<Flashcard[]>([]);
  const isRevealed = ref(false);
  const now = ref(Date.now());
  /** Tamanho da fila no início da sessão (para "cartão X de Y") — não recomputado a cada grade(). */
  const sessionSize = ref(0);
  /** true quando a sessão começou sem nada devido — a fila caiu pro baralho inteiro. */
  const isFreePractice = ref(false);

  /**
   * `at` é sempre passado por quem chama (nunca `Date.now()` interno): uma carta nunca
   * vista cai no fallback `initialLeitnerState`, e se esse fallback tirasse seu próprio
   * `Date.now()` — um instante depois do `now` usado na comparação de `isDue` — a carta
   * pareceria "ainda não devida" por uma questão de microssegundos.
   */
  function stateFor(id: string, at: number): LeitnerCardState {
    return cardStates.value[id] ?? initialLeitnerState(at);
  }

  /**
   * (Re)carrega a sessão do baralho ativo: um snapshot tirado **uma vez**, não recomputado
   * a cada `grade()`. Antes, a fila era um `computed` sobre os cartões devidos (que se
   * reordenam por `dueAt` conforme são graduados) e `current` indexava nela por
   * `currentIndex % length` — a fila mudava de tamanho/ordem debaixo do índice, pulando
   * ou repetindo cartões. Agora é uma fila de verdade: consome do topo, erros voltam
   * para o fim (revisão imediata dentro da mesma sessão).
   */
  function loadSession() {
    deck.value = buildDeck(activeDeckId.value);

    const at = Date.now();
    const due = deck.value
      .filter((card) => isDue(stateFor(card.id, at), at))
      .sort((a, b) => stateFor(a.id, at).dueAt - stateFor(b.id, at).dueAt);

    isFreePractice.value = due.length === 0 && deck.value.length > 0;
    queue.value = due.length > 0 ? due : [...deck.value];
    sessionSize.value = queue.value.length;
    isRevealed.value = false;
  }

  loadSession();

  function selectDeck(id: DeckId) {
    if (activeDeckId.value === id) return;

    activeDeckId.value = id;
    loadSession();
  }

  /** Só para exibição ("X de Y devidos") — reage ao relógio (`now`) e a `cardStates`. */
  const dueCount = computed(
    () => deck.value.filter((card) => isDue(stateFor(card.id, now.value), now.value)).length,
  );

  const current = computed(() => queue.value[0] ?? null);
  const isSessionComplete = computed(() => queue.value.length === 0);

  /** Caixa Leitner (1-5) do cartão atual, para o indicador de progresso. */
  const currentBox = computed(() => {
    const card = current.value;
    if (!card) return 1;
    return stateFor(card.id, now.value).box;
  });

  /** Cartões únicos já respondidos corretamente nesta sessão — não conta reinserções por erro. */
  const clearedIds = ref<Set<string>>(new Set());
  const sessionPosition = computed(() => Math.min(clearedIds.value.size + 1, Math.max(sessionSize.value, 1)));

  function reveal() {
    isRevealed.value = true;
  }

  function grade(correct: boolean) {
    const card = current.value;
    if (!card) return;

    const at = Date.now();
    cardStates.value[card.id] = gradeLeitnerCard(stateFor(card.id, at), correct, at);

    queue.value = queue.value.slice(1);
    if (!correct) {
      queue.value.push(card);
    } else {
      clearedIds.value.add(card.id);
    }

    isRevealed.value = false;
  }

  let ticker: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    ticker = setInterval(() => {
      now.value = Date.now();
    }, DUE_COUNT_REFRESH_MS);
  });
  onUnmounted(() => clearInterval(ticker));

  return {
    deckIds: DECK_IDS,
    activeDeckId,
    selectDeck,
    deckSize: computed(() => deck.value.length),
    dueCount,
    remaining: computed(() => queue.value.length),
    current,
    isSessionComplete,
    isFreePractice,
    isRevealed,
    reveal,
    grade,
    currentBox,
    boxCount: LEITNER_BOX_COUNT,
    sessionPosition,
    sessionSize,
  };
}
