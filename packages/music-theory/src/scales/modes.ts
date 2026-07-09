import { Note } from "../notes/note";
import { Scale } from "./scale";
import { createScale } from "./create-scale";
import { ScalePattern } from "./scale-pattern";
import {
  AEOLIAN_SCALE_PATTERN,
  DORIAN_SCALE_PATTERN,
  IONIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MAJOR_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
} from "./scale-patterns";

/** Os 7 padrões modais do sistema maior, na ordem dos graus 1..7 do tom-pai. */
export const MAJOR_SCALE_MODE_PATTERNS: ScalePattern[] = [
  IONIAN_SCALE_PATTERN,
  DORIAN_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
  LYDIAN_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  AEOLIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
];

/**
 * Os mesmos 7 padrões, do mais brilhante (Lydian) ao mais escuro (Locrian).
 * Referências de objeto (não nomes em string), para não quebrar silenciosamente
 * se um padrão for renomeado — quem consome compara por igualdade de referência.
 */
export const MODE_BRIGHTNESS_ORDER: ScalePattern[] = [
  LYDIAN_SCALE_PATTERN,
  IONIAN_SCALE_PATTERN,
  MIXOLYDIAN_SCALE_PATTERN,
  DORIAN_SCALE_PATTERN,
  AEOLIAN_SCALE_PATTERN,
  PHRYGIAN_SCALE_PATTERN,
  LOCRIAN_SCALE_PATTERN,
];

export interface Mode {
  /** Grau do tom-pai em que o modo começa (1..7). */
  degree: number;
  pattern: ScalePattern;
  scale: Scale;
}

/**
 * Os 7 modos diatônicos derivados de um tom-pai maior: cada modo começa em um
 * grau da escala maior de `parentRoot` e usa o padrão modal correspondente —
 * mesmas notas do tom-pai, tônica diferente (rotação, não uma escala nova).
 */
export function relativeModesOf(parentRoot: Note): Mode[] {
  const parentNotes = createScale(parentRoot, MAJOR_SCALE_PATTERN).notes();

  return MAJOR_SCALE_MODE_PATTERNS.map((pattern, index) => ({
    degree: index + 1,
    pattern,
    scale: createScale(parentNotes[index], pattern),
  }));
}
