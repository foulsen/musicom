import { addStudyDay, toLocalIsoDate } from "./study-streak";
import { useLearnStore } from "./use-learn-store";

/**
 * Registro de dias de estudo (base da sequência diária do painel "Hoje").
 * `recordActivity` é chamado por qualquer resposta do usuário — checkpoint, flashcard, treino de ouvido, Note ID.
 */
export function useStudyActivity() {
  const store = useLearnStore();

  /** Marca o dia local de `now` como estudado; chamar várias vezes no mesmo dia não escreve de novo. */
  function recordActivity(now: Date = new Date()) {
    const next = addStudyDay(store.studyDays, toLocalIsoDate(now));

    if (next !== store.studyDays) store.studyDays = next;
  }

  return { recordActivity };
}
