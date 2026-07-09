import { CHORD_PATTERNS, Degree } from "@music-workspace/music-theory";

export interface Flashcard {
  id: string;
  prompt: string;
  answer: string;
}

const INTERVAL_DEGREES = ["b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"].map(
  (value) => new Degree(value),
);

function buildIntervalDeck(): Flashcard[] {
  return INTERVAL_DEGREES.map((degree) => ({
    id: `interval-${degree.toString()}`,
    prompt: degree.toString(),
    answer: `${degree.intervalName()} — ${degree.semitones()} semitones`,
  }));
}

function buildChordFormulaDeck(): Flashcard[] {
  return CHORD_PATTERNS.map((pattern) => ({
    id: `chord-${pattern.name}`,
    prompt: pattern.name,
    answer: pattern.degrees.map((degree) => degree.toString()).join(" - "),
  }));
}

/** Baralho combinado (intervalos + fórmulas de acorde), gerado a partir do domínio. */
export function buildFlashcardDeck(): Flashcard[] {
  return [...buildIntervalDeck(), ...buildChordFormulaDeck()];
}
