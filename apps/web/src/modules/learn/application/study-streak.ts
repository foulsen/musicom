/** Quantos dias de estudo ficam guardados (cobre sequências de até ~1 ano; o contrato aceita até 400). */
export const MAX_STUDY_DAYS = 365;

const MS_PER_DAY = 86_400_000;

/** Data civil **local** como `YYYY-MM-DD` — nunca `toISOString()`, que é UTC e viraria o dia às 21h no Brasil. */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Nº de dias desde a época para uma data `YYYY-MM-DD`; via UTC puro, então horário de verão não desloca a conta. */
function dayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);

  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** Une listas de dias, sem repetição, em ordem cronológica e limitada aos `max` mais recentes. */
export function normalizeStudyDays(days: readonly string[], max = MAX_STUDY_DAYS): string[] {
  return [...new Set(days)].sort().slice(-max);
}

/** Registra `today` na lista (idempotente: o mesmo dia não duplica). Devolve a própria lista se nada mudou. */
export function addStudyDay(days: string[], today: string, max = MAX_STUDY_DAYS): string[] {
  if (days.includes(today)) return days;

  return normalizeStudyDays([...days, today], max);
}

/**
 * Dias seguidos de estudo terminando hoje. Se hoje ainda não teve estudo mas ontem teve, a sequência
 * continua viva (o usuário ainda tem o dia de hoje para mantê-la); com um dia inteiro sem estudo, volta a 0.
 */
export function currentStreak(days: readonly string[], today: string): number {
  const studied = new Set(days.map(dayNumber));
  const todayNumber = dayNumber(today);

  let cursor = studied.has(todayNumber) ? todayNumber : todayNumber - 1;
  let streak = 0;

  while (studied.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}
