import type { FretPosition } from "@music-workspace/music-theory";

/** Progressão do Note ID: cada nível amplia a região do braço (sempre a partir da corda solta). */
export type NoteIdLevelId = "frets3" | "frets5" | "frets7" | "frets12";

export interface NoteIdLevel {
  id: NoteIdLevelId;
  /** Última casa sorteável (inclusive); 0 = corda solta. */
  maxFret: number;
}

export const NOTE_ID_LEVELS: NoteIdLevel[] = [
  { id: "frets3", maxFret: 3 },
  { id: "frets5", maxFret: 5 },
  { id: "frets7", maxFret: 7 },
  { id: "frets12", maxFret: 12 },
];

export const DEFAULT_NOTE_ID_LEVEL: NoteIdLevelId = "frets3";

export function levelFor(id: NoteIdLevelId): NoteIdLevel {
  return NOTE_ID_LEVELS.find((level) => level.id === id) ?? NOTE_ID_LEVELS[0];
}

/** Posições sorteáveis: casas 0..maxFret do nível e, com "só naturais", só as que caem numa nota natural. */
export function noteIdPool(
  positions: readonly (readonly FretPosition[])[],
  levelId: NoteIdLevelId,
  naturalsOnly: boolean,
): FretPosition[] {
  const { maxFret } = levelFor(levelId);

  return positions
    .flat()
    .filter((position) => position.fret <= maxFret && (!naturalsOnly || !position.pitch.note.value.includes("#")));
}
