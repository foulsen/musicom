import type { LocationQuery, RouteLocationRaw } from "vue-router";

import type { Difficulty, QuizKind } from "./question-generators";

export const QUIZ_KINDS: QuizKind[] = ["interval", "chordQuality", "scale"];
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/** Configuração pedida pela query `?quiz=<tipo>&difficulty=<nível>` — campos ausentes ou inválidos ficam de fora. */
export interface EarTrainingLinkConfig {
  kind?: QuizKind;
  difficulty?: Difficulty;
}

function firstString(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;

  return typeof first === "string" ? first : null;
}

/** Lê o deep-link do Ear Training, descartando valores que não sejam um tipo/nível conhecido. */
export function parseEarTrainingQuery(query: LocationQuery): EarTrainingLinkConfig {
  const quiz = firstString(query.quiz);
  const difficulty = firstString(query.difficulty);
  const config: EarTrainingLinkConfig = {};

  const kind = QUIZ_KINDS.find((item) => item === quiz);
  if (kind) config.kind = kind;

  const level = DIFFICULTIES.find((item) => item === difficulty);
  if (level) config.difficulty = level;

  return config;
}

/** Rota do Ear Training já no quiz (e, opcionalmente, na dificuldade) pedidos. */
export function buildEarTrainingLink(kind: QuizKind, difficulty?: Difficulty): RouteLocationRaw {
  const query: Record<string, string> = { quiz: kind };
  if (difficulty) query.difficulty = difficulty;

  return { path: "/ear-training", query };
}
