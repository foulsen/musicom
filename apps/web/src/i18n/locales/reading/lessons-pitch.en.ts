export const readingPitchLessonsEn = {
  lessons: {
    readingStaff: {
      title: "Reading the staff",
      summary: "Five lines, four spaces and a clef: how pitch is written on paper.",
      steps: {
        staffLines: {
          title: "Five lines, four spaces",
          body: "Music is written on a [[staff:staff]]: five horizontal lines and the four spaces between them. Lines and spaces are counted from the bottom up, and each one stands for a different note. The higher a note sits on the staff, the higher it sounds. Here are the five lines first, then the four spaces.",
          captions: {
            lines: "The five lines of the treble staff: E4, G4, B4, D5 and F5, counted from the bottom up.",
            spaces: "The four spaces of the treble staff: F4, A4, C5 and E5, counted from the bottom up.",
          },
        },
        trebleClef: {
          title: "The treble clef",
          body: "The symbol at the start of the staff is a [[clef:clef]], and it tells you which note each line and space means. The treble (G) clef curls around the second line, which is G4. From there everything follows: the bottom line is E4 and the top line is F5, so the staff covers E4 to F5.",
          captions: {
            notes: "E4 on the bottom line, G4 on the second line (where the clef curls) and F5 on the top line.",
          },
        },
        landmarks: {
          title: "Read by steps from G",
          body: "You don't need to memorize all nine positions at once. Start from a landmark, like the G on the second line, and move one position at a time: line, space, line, space. Each step up is the next letter of the musical alphabet (A B C D E F G, then A again). Play the notes while you follow them.",
          captions: {
            climb: "Climbing from G4 one position at a time: G, A, B, C, D, E, F.",
          },
        },
      },
    },
    readingLedgerLines: {
      title: "Ledger lines and middle C",
      summary: "What to do when a note is too high or too low for the staff.",
      steps: {
        ledgerLines: {
          title: "Beyond the staff",
          body: "When a note is too high or too low for the five lines, the staff is extended with short [[ledgerLine:ledger lines]]. They continue the pattern of lines and spaces: the first one above the treble staff holds A5 and the first one below holds C4. Notes just outside the staff, like G5 or D4, hang in the space and need no ledger line.",
          captions: {
            outside: "Above the staff: F5, G5 and A5 (on the first ledger line). Below: E4, D4 and C4 (on the first ledger line).",
          },
        },
        middleC: {
          title: "Middle C",
          body: "C4, near the middle of the piano keyboard, is called middle C. On the treble staff it sits on the first ledger line below the staff. Count up from it: D4 hangs under the bottom line and E4 is the bottom line itself.",
          captions: {
            middleC: "Middle C (C4) on its ledger line, then D4 and E4 climbing back to the staff.",
          },
        },
        octaves: {
          title: "Same letter, different octave",
          body: "The same letter appears again and again at different heights, each one an [[octave:octave]] apart. A number tells them apart: middle C is C4 and the next C up is C5. The number goes up every time you pass a C, so B3 is just below C4 and B4 just below C5.",
          captions: {
            octaves: "C4 and C5, then G4 and G5: the same letter, one octave apart.",
          },
        },
      },
    },
    readingBassClef: {
      title: "The bass clef and the grand staff",
      summary: "The F clef for low notes, and how treble and bass fit together.",
      steps: {
        fClef: {
          title: "The F clef",
          body: "Low notes are written with the bass (F) [[clef:clef]]. Its two dots sit around the fourth line, which is F3. The bottom line is G2 and the top line is A3, so the same lines and spaces mean different notes than in the treble clef.",
          captions: {
            climb: "Climbing the bass staff from the bottom line: G2, A2, B2, C3, D3, E3, F3, G3.",
          },
        },
        grandStaff: {
          title: "The grand staff",
          body: "Piano music joins a treble staff and a bass staff. Middle C sits between them: one ledger line below the treble staff, or one ledger line above the bass staff. It is the same sound written in two ways. Notice how the same position means a different note in each clef.",
          captions: {
            treble: "Middle C written below the treble staff.",
            bass: "Middle C written above the bass staff.",
          },
        },
        bassLandmarks: {
          title: "Bass landmarks",
          body: "Use landmarks here too: F3 on the line between the two dots, C3 in the second space, and middle C above the staff. From any of them, count up or down one letter at a time, exactly as in the treble clef.",
          captions: {
            landmarks: "Bass-clef landmarks: F3, C3 and middle C (C4).",
          },
        },
      },
    },
    readingAccidentals: {
      title: "Sharps, flats and naturals",
      summary: "The signs that raise or lower a note, and how long they last.",
      steps: {
        symbols: {
          title: "The signs",
          body: "An [[accidental:accidental]] is a sign written before a note. A sharp (#) raises it by a [[semitone:semitone]], a flat (b) lowers it by a semitone, and a natural cancels a previous sharp or flat. A double sharp raises the note by two semitones and a double flat lowers it by two. The sign goes to the left of the note, on its line or space.",
          captions: {
            signs: "F sharp, then F natural (cancelling the sharp), B flat and G double sharp.",
          },
        },
        measureRule: {
          title: "How long they last",
          body: "An accidental affects every later note on the same line or space until the barline of the [[measure:measure]]. It does not carry over to other octaves, and the next measure starts clean. In the example, the second F# needs no sign, but the F an octave higher is a plain F. Play it and listen.",
          captions: {
            rule: "The second F# needs no sign; the F one octave higher and the F in the next measure are naturals.",
          },
        },
        enharmonicSpelling: {
          title: "Same sound, different spelling",
          body: "F# and Gb are two ways of writing the same key, an [[enharmonic:enharmonic]] pair. On the staff they sit at different positions: F# on the F position, Gb on the G position. The spelling tells you the letter even when the sound is the same, and the key decides which one to use. Play both and compare.",
          captions: {
            pair: "F sharp and G flat: different positions on the staff, the same sound.",
          },
        },
      },
    },
    readingKeySignatures: {
      title: "Key signatures",
      summary: "The sharps and flats after the clef that define the key.",
      steps: {
        whatIsKeySignature: {
          title: "What a key signature is",
          body: "Instead of writing a sharp before every F, music puts the sharps or flats right after the [[clef:clef]], once. This is the [[keySignature:key signature]], and it applies to every note of that letter, in every octave, for the whole piece, unless an accidental changes it. In the example, one sharp on the F line means every F is an F#.",
          captions: {
            gMajor: "G major: one sharp in the key signature, so the F in the second measure sounds F#.",
          },
        },
        orderOfAccidentals: {
          title: "The order of accidentals",
          body: "Sharps and flats always appear in the same order. Sharps: F C G D A E B. Flats: B E A D G C F, the exact reverse. A signature with three sharps is always F#, C# and G#, never any other three. That fixed order is what lets you read the key at a glance.",
          captions: {
            sharps: "All seven sharps, in order: F, C, G, D, A, E, B.",
            flats: "All seven flats, in order: B, E, A, D, G, C, F.",
          },
        },
        findTheKey: {
          title: "Finding the key",
          body: "For sharps, take the last sharp and go a semitone up: the last of three sharps is G#, so the key is A major. For flats, the key is the second-to-last flat: with three flats (Bb, Eb, Ab) it is Eb major. One flat is the exception: F major. The relative minor starts 3 semitones below the major tonic.",
          captions: {
            sharps: "Three sharps: the last is G#, a semitone up is A, so A major (F# minor is its relative).",
            flats: "Three flats: the second-to-last is Eb, so Eb major (C minor is its relative).",
          },
        },
      },
    },
  },
  explanations: {
    readingNameNote: "Counting letter by letter from the bottom line ({bottom}): {path}. So this note is {note}.",
    readingOnLine: "{note} sits on line {number}, counting the lines from the bottom.",
    readingInSpace: "{note} sits in space {number}, counting the spaces from the bottom.",
    readingStep: "{a} and {b} are neighbours in the musical alphabet, so one is on a line and the other in the space next to it: that is a step.",
    readingSkip: "From {a} to {b} you skip over {between}: both notes sit on lines or both in spaces. That is a skip (a third).",
    readingLeap: "From {a} to {b} you skip over {skipped} notes ({between}): that is a leap, bigger than a skip.",
    readingNameLedger: "Start from the line at the edge of the staff ({edge}) and keep counting letter by letter: {path}. That note is {note}.",
    readingLedgerCount: "{note} lies {side} the staff, and reaching it takes {count} ledger line. | {note} lies {side} the staff, and reaching it takes {count} ledger lines.",
    readingLedgerNone: "{note} lies {side} the staff, in the space right next to it, so it needs no ledger line.",
    readingOctave: "Octave numbers go up at every C, and the treble staff starts at E4 (bottom line). Reading this {letter} gives {note}.",
    readingSameSpot: "On the treble clef this spot is {treble}; on the bass clef the same spot is {bass}. The bottom line is {trebleBottom} in the treble clef but {bassBottom} in the bass clef.",
    readingSharpNote: "The note sits at the {letter} position, and the sharp sign raises it by a semitone: {note}.",
    readingFlatNote: "The note sits at the {letter} position, and the flat sign lowers it by a semitone: {note}.",
    readingMeasureRuleSame: "The {first} written earlier in the measure still applies to {letter} on the same line or space until the barline. It sounds {note}.",
    readingMeasureRuleNext: "The barline cancels the {first} from the previous measure, so {letter} goes back to the key signature. It sounds {note}.",
    readingEnharmonic: "{shown} and {answer} are the same key written two ways: {shown} sits at the {shownLetter} position and {answer} at the {answerLetter} position, but they sound identical.",
    readingMajorKeyNone: "No sharps or flats means C major (or A minor).",
    readingMajorKeySharps: "With {count} sharp, the last one is {last}. The major key is a semitone above the last sharp: {tonic} major. | With {count} sharps, the last one is {last}. The major key is a semitone above the last sharp: {tonic} major.",
    readingMajorKeyOneFlat: "A single flat (Bb) is the exception to the flats rule: it is F major.",
    readingMajorKeyFlats: "With {count} flats ({list}), the second-to-last flat names the key: {tonic} major.",
    readingMinorKey: "This signature belongs to {major} major and to its relative minor. The minor tonic is 3 semitones below the major one: {minor} minor.",
    readingCountSharps: "{key} major has {count} sharp: {list}. | {key} major has {count} sharps: {list}.",
    readingCountFlats: "{key} major has {count} flat: {list}. | {key} major has {count} flats: {list}.",
    readingNoteInKey: "The key signature ({list}) applies to every {letter}, so the note without a sign sounds {note}.",
  },
  checkpoints: {
    readingPitch: {
      nameNote: "Which note is shown on the staff?",
      lineOrSpace: "Where does this note sit? Count the lines and spaces from the bottom.",
      stepOrSkip: "How do these two notes move?",
      nameLedgerNote: "Which note is shown? It lies outside the staff.",
      countLedgerLines: "How many ledger lines does this note need?",
      whichOctave: "Which note is shown, with its octave number?",
      nameBassNote: "Which note is shown in the bass clef?",
      nameBassLedgerNote: "Which bass-clef note is shown? It lies outside the staff.",
      sameNoteOtherClef: "Imagine this same spot with a bass clef instead of the treble clef. Which note would it be?",
      nameAccidentalNote: "Which note is shown, accidental included?",
      measureRuleSame: "The second note has no accidental sign of its own. Which note sounds?",
      measureRuleNext: "The second note is in the next measure and has no accidental sign. Which note sounds?",
      enharmonicOnStaff: "Which note sounds exactly the same as the one shown?",
      majorKeyOfSignature: "Which major key has this key signature?",
      minorKeyOfSignature: "Which minor key has this key signature?",
      accidentalCount: "How many sharps or flats does the key of {key} major have?",
      noteInKey: "Following the key signature, which note sounds?",
      options: {
        line: "Line {n}",
        space: "Space {n}",
        step: "Step",
        skip: "Skip (a third)",
        leap: "Leap",
        majorKey: "{note} major",
        minorKey: "{note} minor",
      },
      sides: {
        below: "below",
        above: "above",
      },
    },
  },
};
