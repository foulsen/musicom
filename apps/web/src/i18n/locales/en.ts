export const en = {
  nav: {
    scaleExplorer: "Scale Explorer",
    chordExplorer: "Chord Explorer",
    openSidebar: "Open navigation",
    closeSidebar: "Close navigation",
  },
  common: {
    rootNote: "Root note",
    notes: "Notes",
    shapes: "Shapes",
    fretRange: "Fret range",
    frets: "{count} frets",
  },
  scaleExplorer: {
    title: "Scale Explorer",
    subtitle: "Pick a root and a scale to see its notes, harmonic field and fretboard.",
    scaleType: "Scale Type",
    harmonicField: "Harmonic Field",
    openInChordExplorer: "Open in Chord Explorer",
    emptyShapes: {
      title: "No saved shapes yet",
      description: "There's no predefined fingering for {chord} yet, but you can still see its notes above and explore it on the fretboard.",
    },
  },
  chordExplorer: {
    title: "Chord Explorer",
    subtitle: "Combine a root, a chord family and a quality to study its shapes and fretboard.",
    chordFamily: "Chord Family",
    chordQuality: "Chord Quality",
    fretboardWithChordNotes: "Fretboard with chord notes",
    emptyShapes: {
      title: "No saved shapes yet",
      description: "There's no predefined fingering for {chord} yet, but you can still see its notes above and explore it on the fretboard.",
    },
  },
  fretboard: {
    showOutOfScale: "Show all notes",
    showOutOfChord: "Show all notes",
  },
  tuning: {
    label: "Tuning",
    placeholder: "Select a tuning",
  },
  intervals: {
    whole: "W",
    half: "H",
    wholeHalf: "W½",
  },
};

type DeepStringify<T> = T extends string ? string : { [K in keyof T]: DeepStringify<T[K]> };

export type MessageSchema = DeepStringify<typeof en>;
