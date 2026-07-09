export const en = {
  nav: {
    scaleExplorer: "Scale Explorer",
    chordExplorer: "Chord Explorer",
    modeExplorer: "Mode Explorer",
    earTraining: "Ear Training",
    drills: "Drills",
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
  chromaticWheel: {
    title: "Chromatic Wheel",
    chromaticMode: "Chromatic",
    intervalMode: "Intervals",
  },
  drills: {
    title: "Drills",
    subtitle: "Practice against the clock on the fretboard, or drill theory with spaced-repetition flashcards.",
    sections: {
      fretboard: "Fretboard",
      flashcards: "Flashcards",
    },
    fretboard: {
      intro: "Find every occurrence of a note on the fretboard, as fast as you can.",
      findAll: "Find every {note}",
      complete: "All found in {time}!",
      best: "Best: {time}",
      start: "Start",
      restart: "Restart",
      naturalsOnly: "Naturals only",
      ariaLabel: "Fretboard drill",
    },
    flashcards: {
      deck: "Deck",
      due: "{due} of {total} cards due",
      reveal: "Reveal answer",
      again: "Again",
      gotIt: "Got it",
      done: "All done for now",
      doneDescription: "No cards left in this session — come back later or switch decks.",
      decks: {
        intervals: "Intervals",
        intervalNames: "Interval names",
        chordFormulas: "Chord formulas",
        chordSpelling: "Chord spelling",
      },
    },
  },
  earTraining: {
    title: "Ear Training Studio",
    subtitle: "Listen and pick the right answer — intervals, chord qualities and scales.",
    quizType: "Quiz type",
    play: "Play",
    next: "Next",
    correct: "Correct!",
    incorrect: "Not quite — the highlighted answer was correct.",
    score: "Score: {correct}/{total}",
    streak: "streak {streak}",
    resetScore: "Reset score",
    difficulty: "Difficulty",
    intervalPlaybackMode: "Interval playback",
    melodic: "Melodic",
    harmonic: "Harmonic",
    clickPlayHint: "Click Play to hear it (1-4 to answer, R to replay).",
    kinds: {
      interval: "Intervals",
      chordQuality: "Chord Quality",
      scale: "Scales",
    },
    difficulties: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
    prompts: {
      interval: "What interval do you hear?",
      chordQuality: "What chord quality do you hear?",
      scale: "What scale do you hear?",
    },
  },
  modeExplorer: {
    title: "Mode Explorer",
    subtitle: "Pick a parent key and spin through its 7 modes — same notes, different tonic.",
    mode: "Mode",
    degree: "Degree {degree}",
    brightness: "Brightness",
    listenToMode: "Listen to {mode}",
    emptyShapes: {
      title: "No saved shapes yet",
      description: "There's no predefined fingering for {chord} yet, but you can still see its notes above and explore it on the fretboard.",
    },
  },
};

type DeepStringify<T> = T extends string ? string : { [K in keyof T]: DeepStringify<T[K]> };

export type MessageSchema = DeepStringify<typeof en>;
