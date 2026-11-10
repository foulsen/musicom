import { Duration, note, rest, TRIPLET, type MusicEvent } from "@music-workspace/music-theory";

/** Altura fixa de todas as células: o exercício de ritmo ignora a melodia. */
const PITCH = "B4";

/** Célula rítmica: eventos que preenchem um número inteiro de pulsos. */
export interface RhythmCell {
  /** Quantos pulsos a célula ocupa (pulso = semínima em compasso simples, semínima pontuada no composto). */
  pulses: number;
  build(): MusicEvent[];
}

const quarter = Duration.of("quarter");
const eighth = Duration.of("eighth");
const sixteenth = Duration.of("sixteenth");
const dottedQuarter = Duration.of("quarter", 1);
const dottedEighth = Duration.of("eighth", 1);
const tripletEighth = Duration.of("eighth", 0, TRIPLET);

export const RHYTHM_CELLS = {
  // Pulso de semínima
  q: { pulses: 1, build: () => [note(PITCH, quarter)] },
  qr: { pulses: 1, build: () => [rest(quarter)] },
  "8-8": { pulses: 1, build: () => [note(PITCH, eighth), note(PITCH, eighth)] },
  "16x4": { pulses: 1, build: () => Array.from({ length: 4 }, () => note(PITCH, sixteenth)) },
  "8-16-16": { pulses: 1, build: () => [note(PITCH, eighth), note(PITCH, sixteenth), note(PITCH, sixteenth)] },
  "16-16-8": { pulses: 1, build: () => [note(PITCH, sixteenth), note(PITCH, sixteenth), note(PITCH, eighth)] },
  "8r-8": { pulses: 1, build: () => [rest(eighth), note(PITCH, eighth)] },
  "16-8-16": { pulses: 1, build: () => [note(PITCH, sixteenth), note(PITCH, eighth), note(PITCH, sixteenth)] },
  trip8: { pulses: 1, build: () => Array.from({ length: 3 }, () => note(PITCH, tripletEighth)) },
  // Dois pulsos
  h: { pulses: 2, build: () => [note(PITCH, Duration.of("half"))] },
  hr: { pulses: 2, build: () => [rest(Duration.of("half"))] },
  "q.-8": { pulses: 2, build: () => [note(PITCH, dottedQuarter), note(PITCH, eighth)] },
  "8-q-8": { pulses: 2, build: () => [note(PITCH, eighth), note(PITCH, quarter), note(PITCH, eighth)] },
  "q~8-8": {
    pulses: 2,
    build: () => [note(PITCH, quarter, { tieToNext: true }), note(PITCH, eighth), note(PITCH, eighth)],
  },
  // Três e quatro pulsos
  "h.": { pulses: 3, build: () => [note(PITCH, Duration.of("half", 1))] },
  w: { pulses: 4, build: () => [note(PITCH, Duration.of("whole"))] },
  // Pulso de semínima pontuada (compasso composto)
  "q.": { pulses: 1, build: () => [note(PITCH, dottedQuarter)] },
  "q.r": { pulses: 1, build: () => [rest(dottedQuarter)] },
  "q-8": { pulses: 1, build: () => [note(PITCH, quarter), note(PITCH, eighth)] },
  "8-q": { pulses: 1, build: () => [note(PITCH, eighth), note(PITCH, quarter)] },
  "8-8-8": { pulses: 1, build: () => Array.from({ length: 3 }, () => note(PITCH, eighth)) },
  "8.-16-8": { pulses: 1, build: () => [note(PITCH, dottedEighth), note(PITCH, sixteenth), note(PITCH, eighth)] },
} satisfies Record<string, RhythmCell>;

export type RhythmCellId = keyof typeof RHYTHM_CELLS;
