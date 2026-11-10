import type { LocationQuery, RouteLocationRaw } from "vue-router";

import { READING_EXERCISES, READING_LEVEL_IDS, type ReadingExercise } from "./reading-types";

/** Configuração pedida pela query `?tab=<exercício>&level=<nível>` — campos ausentes ou inválidos ficam de fora. */
export interface ReadingLinkConfig {
  tab?: ReadingExercise;
  level?: string;
}

function firstString(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;

  return typeof first === "string" ? first : null;
}

/** Lê o deep-link da leitura; o nível só vale se pertencer à aba pedida. */
export function parseReadingQuery(query: LocationQuery): ReadingLinkConfig {
  const tab = firstString(query.tab);
  const level = firstString(query.level);
  const config: ReadingLinkConfig = {};

  const exercise = READING_EXERCISES.find((item) => item === tab);
  if (!exercise) return config;
  config.tab = exercise;

  if (level && READING_LEVEL_IDS[exercise].includes(level)) config.level = level;

  return config;
}

/** Rota da leitura na aba do exercício, opcionalmente com o nível já selecionado. */
export function buildReadingLink(exercise: ReadingExercise, level?: string): RouteLocationRaw {
  return { path: "/reading", query: level ? { tab: exercise, level } : { tab: exercise } };
}
