import {
  Clef,
  Duration,
  KeySignature,
  createPassage,
  note,
  type ClefName,
  type Letter,
  type Passage,
  type SpelledNote,
  type SpelledPitch,
} from "@music-workspace/music-theory";

import { itemWeight, pickWeighted } from "@/modules/shared/application/weighted-sampling";

import { KEY_SIGNATURE_LEVEL_FIFTHS, NOTE_READING_LEVELS } from "./note-reading-levels";
import type { ItemScore, NoteReadingLevelId } from "./reading-types";

/** Letras na ordem exibida nos botões de resposta. */
export const NOTE_READING_LETTERS: readonly Letter[] = ["C", "D", "E", "F", "G", "A", "B"];

/** Acidentes que o usuário pode escolher (bemol, bequadro, sustenido). */
export const ACCIDENTAL_CHOICES = [-1, 0, 1] as const;

/** Uma nota possível de um nível: clave + armadura + altura grafada. */
export interface NoteReadingItem {
  /** Chave do placar: `${clef}:${pitch}` ou, no nível de armaduras, `${clef}:${fifths}:${pitch}`. */
  itemKey: string;
  clef: ClefName;
  fifths: number;
  pitch: SpelledPitch;
}

export interface NoteReadingQuestion {
  itemKey: string;
  /** Uma semibreve sozinha (compasso 4/4 completo); a fórmula de compasso fica oculta no componente. */
  passage: Passage;
  /** Nome a ser acertado (letra + acidente, sem oitava). */
  answer: SpelledNote;
  pitch: SpelledPitch;
}

/** Todas as notas sorteáveis do nível: clave × posição × variante de acidente (ou armadura). */
export function noteReadingPool(levelId: NoteReadingLevelId): NoteReadingItem[] {
  const level = NOTE_READING_LEVELS[levelId];
  const items: NoteReadingItem[] = [];

  for (const clefName of level.clefs) {
    const clef = Clef.from(clefName);

    for (let position = level.minPosition; position <= level.maxPosition; position++) {
      if (level.accidentals === "none") {
        const pitch = clef.pitchAt(position);
        items.push({ itemKey: `${clefName}:${pitch}`, clef: clefName, fifths: 0, pitch });
      } else if (level.accidentals === "random") {
        for (const accidental of ACCIDENTAL_CHOICES) {
          const pitch = clef.pitchAt(position, accidental);
          items.push({ itemKey: `${clefName}:${pitch}`, clef: clefName, fifths: 0, pitch });
        }
      } else {
        for (const fifths of KEY_SIGNATURE_LEVEL_FIFTHS) {
          const natural = clef.pitchAt(position);
          const pitch = natural.withAccidental(new KeySignature(fifths).accidentalFor(natural.spelled.letter));
          items.push({ itemKey: `${clefName}:${fifths}:${pitch}`, clef: clefName, fifths, pitch });
        }
      }
    }
  }

  return items;
}

export function buildNoteReadingQuestion(item: NoteReadingItem): NoteReadingQuestion {
  const passage = createPassage({ clef: item.clef, fifths: item.fifths, time: "4/4" }, [
    [note(item.pitch.toString(), Duration.of("whole"))],
  ]);

  return { itemKey: item.itemKey, passage, answer: item.pitch.spelled, pitch: item.pitch };
}

/**
 * Sorteia a próxima nota do nível, ponderada pelo erro (`itemWeight`) e sem repetir `previousKey`
 * quando há alternativa. `random` é injetável (0 <= r < 1) para testes determinísticos.
 */
export function nextNoteReadingQuestion(
  levelId: NoteReadingLevelId,
  stats: Record<string, ItemScore>,
  previousKey?: string,
  random: () => number = Math.random,
): NoteReadingQuestion {
  const pool = noteReadingPool(levelId);
  const candidates = pool.length > 1 ? pool.filter((item) => item.itemKey !== previousKey) : pool;
  const weights = candidates.map((item) => itemWeight(stats[item.itemKey]));

  return buildNoteReadingQuestion(pickWeighted(candidates, weights, random));
}

/** O palpite acerta quando letra e acidente batem (a oitava nunca é perguntada). */
export function isNoteReadingAnswerCorrect(answer: SpelledNote, letter: Letter, accidental: number): boolean {
  return answer.letter === letter && answer.accidental === accidental;
}

/** Nome para exibição com símbolos tipográficos (ex.: "F♯", "B♭"). */
export function formatSpelledNote(spelled: SpelledNote): string {
  if (spelled.accidental === 0) return spelled.letter;

  return spelled.letter + (spelled.accidental > 0 ? "♯" : "♭").repeat(Math.abs(spelled.accidental));
}
