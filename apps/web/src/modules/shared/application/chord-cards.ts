import {
  ChordVoicing,
  Fretboard,
  GuitarChord,
  PREDEFINED_CHORDS,
  STANDARD_GUITAR_TUNING,
} from "@music-workspace/music-theory";

import type { ChordCardData, ChordShape } from "../types/chord-shape";

/** Casas exibidas por padrão em cada diagrama de digitação. */
const CHORD_DIAGRAM_FRETS = 5;

/** Braço em afinação padrão: os voicings do banco assumem EADGBE. */
const standardFretboard = new Fretboard(STANDARD_GUITAR_TUNING);

function toChordShape(voicing: ChordVoicing, chord: GuitarChord): ChordShape {
  const openPosition = voicing.isOpenPosition();
  const baseFret = openPosition ? 1 : voicing.lowestFret();
  const span = Math.max(1, voicing.highestFret() - baseFret + 1);

  const notes = voicing.frets.flatMap((fret, string) => {
    if (fret === null) return [];

    const pitch = standardFretboard.pitchAt(string, fret);
    const note = pitch.note;

    return [
      {
        string,
        fret,
        label: note.toString(),
        isRoot: note.equals(chord.root),
        pitch,
      },
    ];
  });

  return {
    notes,
    baseFret,
    fretCount: Math.max(CHORD_DIAGRAM_FRETS, span),
    openPosition,
  };
}

/** Todos os acordes predefinidos já resolvidos em cartões (nome + digitações). */
export const PREDEFINED_CHORD_CARDS: ChordCardData[] = PREDEFINED_CHORDS.map((chord) => ({
  name: chord.name,
  shapes: chord.voicings.map((voicing) => toChordShape(voicing, chord)),
}));

/** Cartão de digitações de um acorde pelo nome (ex.: "C", "Am"); null se não houver. */
export function resolveChordCard(chordName: string): ChordCardData | null {
  return PREDEFINED_CHORD_CARDS.find((card) => card.name === chordName) ?? null;
}
