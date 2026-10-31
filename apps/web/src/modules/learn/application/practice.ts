import type { RouteLocationRaw } from "vue-router";

import { buildDrillsTabLink, buildFlashcardsLink } from "@/modules/drills/application/drills-link";
import type { DeckId } from "@/modules/drills/application/flashcard-decks";
import { buildEarTrainingLink } from "@/modules/ear-training/application/ear-training-link";
import type { Difficulty, QuizKind } from "@/modules/ear-training/application/question-generators";

/** Prática sugerida ao fim de uma lição — cada variante aponta para um exercício já existente no app. */
export type PracticeTarget =
  | { kind: "ear-training"; quiz: QuizKind; difficulty?: Difficulty }
  | { kind: "flashcards"; deck: DeckId }
  | { kind: "note-id" }
  | { kind: "fretboard" };

/** Máximo de atalhos de prática mostrados no painel de conclusão. */
export const MAX_PRACTICE_LINKS = 3;

/** Rota (com deep-link) para o exercício sugerido. */
export function practiceLink(target: PracticeTarget): RouteLocationRaw {
  switch (target.kind) {
    case "ear-training":
      return buildEarTrainingLink(target.quiz, target.difficulty);
    case "flashcards":
      return buildFlashcardsLink(target.deck);
    case "note-id":
      return buildDrillsTabLink("noteId");
    case "fretboard":
      return buildDrillsTabLink("fretboard");
  }
}

/**
 * Chave i18n do rótulo do botão; para flashcards, também a chave do nome do baralho,
 * interpolado no rótulo ("Flashcards: {deck}").
 */
export function practiceLabel(target: PracticeTarget): { key: string; deckKey?: string } {
  switch (target.kind) {
    case "ear-training":
      return { key: `learn.practice.earTraining.${target.quiz}` };
    case "flashcards":
      return { key: "learn.practice.flashcards", deckKey: `drills.flashcards.decks.${target.deck}` };
    case "note-id":
      return { key: "learn.practice.noteId" };
    case "fretboard":
      return { key: "learn.practice.fretboard" };
  }
}
