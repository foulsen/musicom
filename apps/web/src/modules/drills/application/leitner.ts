/**
 * Sistema de repetição espaçada (Leitner box, 5 caixas): acerto avança uma caixa
 * e adia a revisão; erro volta para a caixa 1 e a torna imediatamente devida.
 * Genérico — não depende de teoria musical, só do domínio de agendamento.
 */
export const LEITNER_BOX_COUNT = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

const BOX_INTERVAL_MS: Record<number, number> = {
  1: 0,
  2: 1 * DAY_MS,
  3: 3 * DAY_MS,
  4: 7 * DAY_MS,
  5: 14 * DAY_MS,
};

export interface LeitnerCardState {
  box: number;
  dueAt: number;
}

export function initialLeitnerState(now: number): LeitnerCardState {
  return { box: 1, dueAt: now };
}

export function isDue(state: LeitnerCardState, now: number): boolean {
  return state.dueAt <= now;
}

export function gradeLeitnerCard(state: LeitnerCardState, correct: boolean, now: number): LeitnerCardState {
  const box = correct ? Math.min(state.box + 1, LEITNER_BOX_COUNT) : 1;

  return { box, dueAt: now + (BOX_INTERVAL_MS[box] ?? 0) };
}
