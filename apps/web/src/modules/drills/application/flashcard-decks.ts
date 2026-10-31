import {
  CHORD_PATTERNS,
  Degree,
  Note,
  SpelledNote,
  createChord,
  type ChordPattern,
  type SingleNote,
} from "@music-workspace/music-theory";

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
  /** Cartões parametrizados (ex.: raiz sorteada) geram aqui outra apresentação do mesmo cartão (mesmo `id`). */
  redraw?: () => Flashcard;
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

/** Raízes sorteáveis: as 12 classes de altura, com a grafia usual (sustenido só em F#, bemol nas demais). */
const SPELLING_ROOTS: { note: SingleNote; spelled: SpelledNote }[] = [
  { note: "C", spelled: new SpelledNote("C", 0) },
  { note: "C#", spelled: new SpelledNote("D", -1) },
  { note: "D", spelled: new SpelledNote("D", 0) },
  { note: "D#", spelled: new SpelledNote("E", -1) },
  { note: "E", spelled: new SpelledNote("E", 0) },
  { note: "F", spelled: new SpelledNote("F", 0) },
  { note: "F#", spelled: new SpelledNote("F", 1) },
  { note: "G", spelled: new SpelledNote("G", 0) },
  { note: "G#", spelled: new SpelledNote("A", -1) },
  { note: "A", spelled: new SpelledNote("A", 0) },
  { note: "A#", spelled: new SpelledNote("B", -1) },
  { note: "B", spelled: new SpelledNote("B", 0) },
];

/** Prefixo do id dos cartões de grafia — ids antigos eram `chord-spelling-<acorde>` (ver LEGACY_CARD_ID_PREFIXES). */
const SPELLING_ID_PREFIX = "spelling-";

/** Prefixos de ids que já existiram e não correspondem a nenhum cartão atual — seus estados são descartados. */
export const LEGACY_CARD_ID_PREFIXES = ["chord-spelling-"];

export function isLegacyCardId(id: string): boolean {
  return LEGACY_CARD_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
}

/**
 * Raízes "sensatas" para o padrão: evita grafias com acidente duplo (ex.: Abdim7 = Ab Cb Ebb Gbb),
 * que seriam correção teórica mas ruído para quem está aprendendo. Se nenhuma raiz escapa, usa todas.
 */
function rootsFor(pattern: ChordPattern): typeof SPELLING_ROOTS {
  const clean = SPELLING_ROOTS.filter(({ note, spelled }) =>
    createChord(Note.from(note), pattern, spelled).spelledNotes.every((spelledNote) => Math.abs(spelledNote.accidental) <= 1),
  );

  return clean.length > 0 ? clean : SPELLING_ROOTS;
}

/**
 * O cartão é o *padrão* do acorde (`spelling-<padrão>`); a raiz é sorteada a cada apresentação,
 * para não decorar "C7 = C E G Bb". `redraw` devolve o mesmo cartão com outra raiz (usado ao reenfileirar um erro).
 */
export function drawChordSpellingCard(
  pattern: ChordPattern,
  random: () => number = Math.random,
  avoidRoot?: SingleNote,
): Flashcard {
  const candidates = rootsFor(pattern);
  const pool = candidates.length > 1 ? candidates.filter(({ note }) => note !== avoidRoot) : candidates;
  const { note, spelled } = pool[Math.floor(random() * pool.length)];
  const chord = createChord(Note.from(note), pattern, spelled);

  return {
    id: `${SPELLING_ID_PREFIX}${pattern.name}`,
    prompt: chord.name,
    answer: chord.spelledNotes.join(" - "),
    redraw: () => drawChordSpellingCard(pattern, random, note),
  };
}

/** Nome do acorde -> grafia das notas (ex.: "Eb7" -> "Eb - G - Bb - Db"), com raiz sorteada por padrão. */
function buildChordSpellingDeck(): Flashcard[] {
  return CHORD_PATTERNS.map((pattern) => drawChordSpellingCard(pattern));
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

let cachedCardIds: string[] | undefined;

/** Ids de todos os cartões de todos os baralhos (estáveis — não dependem do sorteio) — para contagens globais. */
export function allCardIds(): string[] {
  cachedCardIds ??= DECK_IDS.flatMap((id) => buildDeck(id).map((card) => card.id));

  return cachedCardIds;
}
