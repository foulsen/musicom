import { CHORD_PATTERNS, Degree, Note, createChord, type SingleNote } from "@music-workspace/music-theory";

export interface Flashcard {
  id: string;
  prompt: string;
  answer: string;
}

const INTERVAL_DEGREES = ["b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"].map(
  (value) => new Degree(value),
);

/** Grau -> nome + semitons (ex.: "b3" -> "minor third — 3 semitones"). */
function buildIntervalDeck(): Flashcard[] {
  return INTERVAL_DEGREES.map((degree) => ({
    id: `interval-${degree.toString()}`,
    prompt: degree.toString(),
    answer: `${degree.intervalName()} — ${degree.semitones()} semitones`,
  }));
}

/** Inverso do baralho de intervalos: nome -> grau + semitons. */
function buildIntervalNameDeck(): Flashcard[] {
  return INTERVAL_DEGREES.map((degree) => ({
    id: `interval-name-${degree.toString()}`,
    prompt: degree.intervalName(),
    answer: `${degree.toString()} — ${degree.semitones()} semitones`,
  }));
}

function buildChordFormulaDeck(): Flashcard[] {
  return CHORD_PATTERNS.map((pattern) => ({
    id: `chord-${pattern.name}`,
    prompt: pattern.name,
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
