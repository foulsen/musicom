import { CHORD_PATTERNS, Degree, Note, createChord, type SingleNote } from "@music-workspace/music-theory";

import {
  chordQualityLabel,
  intervalLabel,
  withSemitonesLabel,
  type TermLabel,
} from "@/modules/shared/application/music-terms";

/** `prompt`/`answer` são rótulos ainda não resolvidos: a página os traduz (`useMusicTerms().label`) ao exibir. */
export interface Flashcard {
  id: string;
  prompt: TermLabel;
  answer: TermLabel;
}

const INTERVAL_DEGREES = ["b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"].map(
  (value) => new Degree(value),
);

/** Grau -> nome + semitons (ex.: "b3" -> "minor third — 3 semitones" / "terça menor — 3 semitons"). */
function buildIntervalDeck(): Flashcard[] {
  return INTERVAL_DEGREES.map((degree) => ({
    id: `interval-${degree.toString()}`,
    prompt: degree.toString(),
    answer: withSemitonesLabel(intervalLabel(degree), degree.semitones()),
  }));
}

/** Inverso do baralho de intervalos: nome -> grau + semitons. */
function buildIntervalNameDeck(): Flashcard[] {
  return INTERVAL_DEGREES.map((degree) => ({
    id: `interval-name-${degree.toString()}`,
    prompt: intervalLabel(degree),
    answer: withSemitonesLabel(degree.toString(), degree.semitones()),
  }));
}

function buildChordFormulaDeck(): Flashcard[] {
  return CHORD_PATTERNS.map((pattern) => ({
    id: `chord-${pattern.name}`,
    prompt: chordQualityLabel(pattern.name),
    answer: pattern.degrees.map((degree) => degree.toString()).join(" - "),
  }));
}

/** Uma raiz por padrão (rotativa entre naturais), para variar sem multiplicar o baralho por 7. */
const SPELLING_ROOTS: SingleNote[] = ["C", "G", "D", "A", "E", "B", "F"];

/** Nome do acorde -> grafia das notas (ex.: "C7" -> "C - E - G - Bb"). */
function buildChordSpellingDeck(): Flashcard[] {
  return CHORD_PATTERNS.map((pattern, index) => {
    const root = Note.from(SPELLING_ROOTS[index % SPELLING_ROOTS.length]);
    const chord = createChord(root, pattern);

    return {
      id: `chord-spelling-${chord.name}`,
      prompt: chord.name,
      answer: chord.spelledNotes.join(" - "),
    };
  });
}

export type DeckId = "intervals" | "intervalNames" | "chordFormulas" | "chordSpelling";

export const DECK_IDS: DeckId[] = ["intervals", "intervalNames", "chordFormulas", "chordSpelling"];

const DECK_BUILDERS: Record<DeckId, () => Flashcard[]> = {
  intervals: buildIntervalDeck,
  intervalNames: buildIntervalNameDeck,
  chordFormulas: buildChordFormulaDeck,
  chordSpelling: buildChordSpellingDeck,
};

export function buildDeck(id: DeckId): Flashcard[] {
  return DECK_BUILDERS[id]();
}
