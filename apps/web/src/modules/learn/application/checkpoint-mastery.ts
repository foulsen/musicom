import type { CheckpointScore } from "./use-learn-store";

/** Fração mínima de acertos para considerar o checkpoint dominado (gate suave: nunca bloqueia a trilha). */
export const CHECKPOINT_MASTERY_THRESHOLD = 0.7;

export function checkpointRatio(score: CheckpointScore): number {
  return score.total === 0 ? 0 : score.correct / score.total;
}

export function checkpointPercent(score: CheckpointScore): number {
  return Math.round(checkpointRatio(score) * 100);
}

/** Verdadeiro se a pontuação atinge o critério de domínio (≥ 70%). */
export function isCheckpointMastered(score: CheckpointScore | null | undefined): boolean {
  return score != null && checkpointRatio(score) >= CHECKPOINT_MASTERY_THRESHOLD;
}

/**
 * Mantém a MELHOR tentativa (maior fração de acertos); em empate fica a mais antiga.
 * Assim o `checkpoint` persistido continua sendo um único `{ correct, total }`.
 */
export function bestCheckpoint(previous: CheckpointScore | undefined, attempt: CheckpointScore): CheckpointScore {
  if (!previous) return attempt;

  return checkpointRatio(attempt) > checkpointRatio(previous) ? attempt : previous;
}
