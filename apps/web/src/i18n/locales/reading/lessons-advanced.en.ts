export const readingAdvancedLessonsEn = {
  lessons: {
    readingChords: {
      title: "Intervals and chords on the staff",
      summary: "See thirds as stacked lines or spaces, and spot a triad at a glance.",
      steps: {
        intervalsOnStaff: {
          title: "Intervals on the staff",
          body: "Two notes written one above the other form an [[interval:interval]]. To name it, count every line and space from the lower note to the upper one, both included: that count is the interval's number. A handy shortcut: when both notes sit on lines (or both in spaces) the interval is odd — a 3rd, 5th or 7th. When one sits on a line and the other in a space, it is even — a 2nd, 4th, 6th or an octave.",
          captionOdd: "Line to line: a 3rd, then a 5th.",
          captionEven: "Line to space: a 4th, then a 6th.",
        },
        stackedTriads: {
          title: "Stacked thirds make a triad",
          body: "A [[triad:triad]] is three notes stacked in thirds. In root position its notes sit on three neighbouring lines or three neighbouring spaces, with no gaps, so a chord looks like a tidy tower on the staff. The lowest note is the root: the note that gives the chord its name.",
          captionLines: "Three lines: E-G-B, then G-B-D.",
          captionSpaces: "Three spaces: F-A-C, then A-C-E.",
        },
        namingChords: {
          title: "Naming the chords of C major",
          body: "Build a triad on each note of the C major scale, using only the notes of the scale, and you get the seven chords of the key: C, Dm, Em, F, G, Am and B diminished. They all look like the same tower on the staff, but the exact distance between the notes changes the quality. That is why the root's letter and the key signature decide the name. Press play to hear them in order.",
          caption: "C, Dm, Em, F, then G, Am, Bdim and C.",
        },
      },
    },
    readingExpression: {
      title: "Dynamics, articulation and tempo",
      summary: "The signs that tell you how loud, how short and how fast to play.",
      steps: {
        dynamics: {
          title: "How loud: dynamics",
          body: "[[dynamics:Dynamics]] tell you the volume. They are written below the staff as abbreviations of Italian words: pp (very soft), p (soft), mp (moderately soft), mf (moderately loud), f (loud) and ff (very loud). A gradual change is shown with a crescendo hairpin (getting louder) or a diminuendo hairpin (getting softer), or with the words cresc. and dim.",
          caption: "From pp to ff: each marking is a step louder.",
        },
        articulations: {
          title: "How short or long: articulation",
          body: "[[articulation:Articulation]] marks change how a single note is attacked and held. A dot is staccato (short and detached). A short horizontal line is tenuto (hold the full value, with a gentle stress). A > sign is an accent (attack harder) and a ^ sign is marcato (a strong, short accent). A fermata, the arc with a dot, holds the note longer than written.",
          caption: "Staccato, accent, tenuto and marcato, then a fermata.",
        },
        tempo: {
          title: "How fast: tempo",
          body: "Tempo is the speed of the [[beat]], measured in beats per minute (BPM): 60 BPM is one beat per second. Scores usually give an Italian word, often with a number. Largo is very slow (about 40-60 BPM), Adagio slow (66-76), Andante a walking pace (76-108), Moderato moderate (108-120), Allegro fast (120-156) and Presto very fast (168-200). Play both examples: same notes, two tempos.",
          captionSlow: "Largo: 52 BPM.",
          captionFast: "Allegro: 144 BPM.",
        },
      },
    },
    readingCClefs: {
      title: "C clefs: alto and tenor",
      summary: "Clefs that point to middle C, as read by violas, cellos and trombones.",
      steps: {
        cClef: {
          title: "A clef that points to middle C",
          body: "The treble [[clef]] curls around G and the bass clef marks F. The C clef marks middle C (C4): the centre of the sign sits on the line that is C4. Since that centre can sit on different lines, the same symbol makes different clefs. Compare the same note, middle C, in three clefs: below the treble staff on a ledger line, on the middle line in the alto clef, and on the fourth line in the tenor clef.",
          captionTreble: "Treble clef: C4 on a ledger line below the staff.",
          captionAlto: "Alto clef: C4 on the middle line.",
          captionTenor: "Tenor clef: C4 on the fourth line.",
        },
        altoClef: {
          title: "Alto clef: the middle line is C",
          body: "In the alto clef the middle line is middle C. Read from there: one step up is D, one step down is B. Violas read in this clef, so the notes of their middle register fit on the staff without ledger lines. Try this melody, which goes from A up to E and back down.",
          caption: "Alto clef: the middle line is C4.",
        },
        tenorClef: {
          title: "Tenor clef: the 4th line is C",
          body: "In the tenor clef the fourth line from the bottom is middle C. It is the same melody as before, written one line higher on the staff. Cellos, bassoons and trombones switch to this clef when the music climbs too high for the bass clef, to avoid a pile of ledger lines.",
          caption: "Tenor clef: the fourth line is C4.",
        },
      },
    },
    readingSightReading: {
      title: "Sight-reading",
      summary: "Read new music at tempo: scan first, keep going and read in chunks.",
      steps: {
        scanFirst: {
          title: "Scan before you play",
          body: "Take a few seconds before the first note. Check the [[clef]], the [[keySignature:key signature]], the [[timeSignature:time signature]] and the range of the notes, then look for patterns: repeated measures, scales, arpeggios and leaps. Finally pick a tempo you can hold to the very end, even if it is slower than the music asks.",
          caption: "G major, 3/4: clef, key and meter first, then the shape of the tune.",
        },
        keepGoing: {
          title: "Keep the pulse going",
          body: "The pulse never stops. If you make a mistake, don't go back: keep the beat and rejoin on the next one. A steady tempo with a wrong note sounds far better than perfect notes that stop and start. Counting aloud, tapping your foot or playing along with the click helps you hold the pulse.",
        },
        chunking: {
          title: "Read in chunks",
          body: "Don't read note by note. Group what you see: a whole beat at a time, or a familiar shape such as a scale run, a third or an arpeggio. Reading the intervals between notes (step, skip, leap) is faster than naming every note. In this example the first measure is a scale going up and back down, and the second is a leap of a fifth.",
          caption: "One scale shape, then one leap: two chunks.",
        },
      },
    },
  },
  explanations: {
    readingIntervalOnStaff:
      "Count every line and space from the lower note to the upper one, both included: {path}. That is {size} notes, so the interval is the {interval}.",
    readingTriadName:
      "The key signature belongs to {key} major. The notes {notes}, stacked in thirds, form the triad on degree {degree} of that scale: {chord}.",
    readingRootOfTriad:
      "A triad in root position stacks thirds, so its root is the lowest note: {root}. The other two notes, {third} and {fifth}, sit a third and a fifth above it. Don't forget the key signature when naming them.",
    readingDynamic:
      "{dynamic} means {meaning}. From softest to loudest the markings go: pp, p, mp, mf, f, ff.",
    readingArticulation: "{name}: {meaning}.",
    readingTempo:
      "{bpm} BPM falls in the {term} range ({from}-{to} BPM). From slowest to fastest: Largo, Adagio, Andante, Moderato, Allegro, Presto.",
    readingAltoNote:
      "In the alto clef the middle line is C. Counting from it to your note, letter by letter, gives {path}. So the note is {note}.",
    readingTenorNote:
      "In the tenor clef the fourth line is C. Counting from it to your note, letter by letter, gives {path}. So the note is {note}.",
    readingMiddleC:
      "In the {clef} the bottom line is {bottom}. Counting letter by letter from it to middle C ({path}), middle C lands here: {placement}.",
    readingKeyAndMeter:
      "The key signature has {accidentals}, which belongs to {key} major. The time signature at the start is {time}.",
    readingFirstNote:
      "In the {clef}, the first note is a {letter}. The key signature ({accidentals}) does not change it, so it is {note}.",
    readingFirstNoteAltered:
      "In the {clef}, the first note is a {letter}. The key signature ({accidentals}) changes every {letter} in the piece, so it is {note}, not a plain {letter}.",
    readingAttackCount:
      "There are {noteheads} noteheads, but the tie joins two of them into one sound: {noteheads} minus 1 = {attacks} notes to play. Rests are not played.",
  },
  checkpoints: {
    readingAdvanced: {
      intervalOnStaff: "What interval do these two stacked notes form? Count both notes.",
      triadName: "Which triad is written on the staff?",
      rootOfTriad: "Which note is the root of this triad?",
      dynamicMeaning: "What does the dynamic marking {dynamic} mean?",
      articulationName: "Which articulation is written on these notes?",
      tempoTerm: "A score marks {bpm} BPM. Which tempo term fits that speed?",
      nameAltoNote: "Which note is this in the alto clef?",
      nameTenorNote: "Which note is this in the tenor clef?",
      middleCLine: "In the {clef}, where is middle C (C4) written?",
      keyAndMeter: "Assuming a major key, which key and time signature does this passage use?",
      firstNoteName: "What is the first note of this passage? Remember the key signature.",
      attackCount: "How many notes would you play here? Tied notes count once.",
      options: {
        interval: {
          n2: "2nd",
          n3: "3rd",
          n4: "4th",
          n5: "5th",
          n6: "6th",
          n7: "7th",
          n8: "octave",
        },
        dynamic: {
          pp: "very soft (pianissimo)",
          p: "soft (piano)",
          mp: "moderately soft (mezzo piano)",
          mf: "moderately loud (mezzo forte)",
          f: "loud (forte)",
          ff: "very loud (fortissimo)",
        },
        articulation: {
          staccato: "Staccato",
          accent: "Accent",
          tenuto: "Tenuto",
          marcato: "Marcato",
          fermata: "Fermata",
        },
        articulationMeaning: {
          staccato: "play the note short and detached (a dot above or below the notehead)",
          accent: "attack the note harder than its neighbours (a > sign)",
          tenuto: "hold the note for its full value, with a gentle stress (a short line)",
          marcato: "give the note a strong, short accent (a ^ sign)",
          fermata: "hold the note longer than written (an arc with a dot)",
        },
        clef: {
          treble: "treble clef",
          bass: "bass clef",
          alto: "alto clef",
          tenor: "tenor clef",
        },
        placement: {
          ledgerBelow: "On the 1st ledger line below the staff",
          ledgerAbove: "On the 1st ledger line above the staff",
          line2: "On the 2nd line",
          line3: "On the 3rd line (the middle one)",
          line4: "On the 4th line",
        },
        keyTime: "{key} major, {time}",
        noAccidentals: "no sharps or flats",
      },
    },
  },
};
