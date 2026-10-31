/**
 * Sistema de repetição espaçada (Leitner box, 5 caixas): acerto avança uma caixa
 * e adia a revisão; "difícil" (acertou, mas custou) fica na mesma caixa e repete o
 * intervalo dela; erro volta para a caixa 1 e a torna imediatamente devida.
 * Genérico — não depende de teoria musical, só do domínio de agendamento.
 */
export const LEITNER_BOX_COUNT = 5;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const BOX_INTERVAL_MS: Record<number, number> = {
  1: 0,
  2: 1 * DAY_MS,
  3: 3 * DAY_MS,
  4: 7 * DAY_MS,
  5: 14 * DAY_MS,
};

/** Na caixa 1 o intervalo é 0 (devido já); "difícil" ali ganha um respiro curto em vez de voltar na hora. */
export const HARD_BOX_1_INTERVAL_MS = 10 * MINUTE_MS;

/** again = errei · hard = acertei com esforço · good = acertei com facilidade. */
export type LeitnerGrade = "again" | "hard" | "good";

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

/** `boolean` é mantido por compatibilidade: `true` = "good", `false` = "again". */
export function gradeLeitnerCard(
  state: LeitnerCardState,
  grade: LeitnerGrade | boolean,
  now: number,
): LeitnerCardState {
  const normalized: LeitnerGrade = typeof grade === "boolean" ? (grade ? "good" : "again") : grade;

  if (normalized === "hard") {
    const interval = state.box <= 1 ? HARD_BOX_1_INTERVAL_MS : (BOX_INTERVAL_MS[state.box] ?? 0);

    return { box: state.box, dueAt: now + interval };
  }

  const box = normalized === "good" ? Math.min(state.box + 1, LEITNER_BOX_COUNT) : 1;

  return { box, dueAt: now + (BOX_INTERVAL_MS[box] ?? 0) };
}
