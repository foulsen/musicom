export const readingRhythmLessonsEn = {
  lessons: {
    readingNoteValues: {
      title: "Note values and rests",
      summary: "How long each note lasts: from the whole note down to the sixteenth, and the silences that match them.",
      steps: {
        figures: {
          title: "From whole note to sixteenth",
          body: "Every [[noteValue:note value]] lasts half as long as the one before it. In 4/4, with the quarter note as the beat, a whole note lasts 4 beats, a half note 2, a quarter note 1, an eighth note half a beat and a sixteenth note a quarter of a beat. The shape of the note tells its value: open or filled head, with or without a stem, and flags or beams for the short ones.",
          captions: {
            whole: "Whole note: 4 beats",
            half: "Two half notes: 2 beats each",
            quarter: "Four quarter notes: 1 beat each",
            eighth: "Eight eighth notes: half a beat each",
            sixteenth: "Sixteen sixteenth notes: a quarter of a beat each",
          },
        },
        rests: {
          title: "Rests: written silence",
          body: "Music is made of sound and silence, so every note value has a matching rest with the same duration: a quarter rest lasts one beat, a half rest two beats. A rest does not stop the [[beat:beat]]. The pulse keeps going while you stay silent, and the next note has to enter exactly on time.",
          captions: {
            quarterRest: "Note, quarter rest, half note",
            halfRest: "A half rest, then a half note",
          },
        },
        pulse: {
          title: "The steady beat",
          body: "Under every rhythm there is a steady [[beat:beat]] you could tap with your foot. Note values only make sense against it: they tell you how many beats each note covers. Play the example and tap along with the click, one tap for every quarter note.",
          captions: {
            steady: "Two measures of steady quarter notes",
          },
        },
      },
    },
    readingTimeSignatures: {
      title: "Measures and time signatures",
      summary: "How beats are grouped into measures, and how the two numbers of a time signature say it.",
      steps: {
        measuresAndBarlines: {
          title: "Measures and bar lines",
          body: "Music is cut into equal slices called [[measure:measures]], separated by vertical bar lines. Every measure holds the same number of beats, no matter which note values fill it. The first beat of each measure carries a natural accent, which is what makes you feel the groups.",
          captions: {
            twoMeasures: "Two measures with the same length, filled differently",
          },
        },
        topAndBottom: {
          title: "The two numbers",
          body: "A [[timeSignature:time signature]] has two numbers. The top one says how many beats are in each measure; the bottom one says which note value counts as one beat, and 4 means the quarter note. So 2/4 has two quarter-note beats, 3/4 has three (a waltz feel) and 4/4 has four, the most common of all.",
          captions: {
            twoFour: "2/4: two beats per measure",
            threeFour: "3/4: three beats per measure",
            fourFour: "4/4: four beats per measure",
          },
        },
        counting: {
          title: "Counting aloud",
          body: "Count the beats out loud, \"1 2 3 4\", and say \"and\" for the half-beat between them. Quarter notes land on the numbers; eighth notes fill the numbers and the \"and\" between them: \"1 and 2 and 3 and 4 and\". Counting is the quickest way to check that you read a rhythm correctly.",
          captions: {
            countQuarters: "Count: 1 2 3 4",
            countEighths: "Count: 1 and 2 and 3 and 4 and",
          },
        },
      },
    },
    readingDotsTies: {
      title: "Dots and ties",
      summary: "Two ways of making a note longer: the dot adds half its value and the tie joins two notes.",
      steps: {
        dot: {
          title: "The dot adds half",
          body: "A dot written after a note makes it longer by half of its own value. A dotted half note is 2 + 1 = 3 beats, a dotted quarter note is 1 + half a beat = 1.5 beats, and a dotted eighth note is an eighth plus a sixteenth. A second dot would add half of the first one.",
          captions: {
            dottedHalf: "Dotted half note (3 beats) and a quarter note",
            dottedQuarter: "Dotted quarter note, eighth note and half note",
          },
        },
        tie: {
          title: "The tie joins notes",
          body: "A [[tie:tie]] is a curved line between two notes of the same pitch: you play the first and hold through the second without striking it again, so they add up to one longer note. This is how a note can last across a bar line or reach a length no single note value has. A curve between different pitches is not a tie but a slur, which asks you to play the notes smoothly connected.",
          captions: {
            acrossBarline: "A half note tied across the bar line",
            insideMeasure: "A half note tied to a quarter note",
          },
        },
        countingDotted: {
          title: "Counting a dotted rhythm",
          body: "The classic dotted pair is a dotted quarter note followed by an eighth note. Count it \"1 (2) and\": the long note starts on 1 and lasts through the 2, and the short note falls on the \"and\" of 2. The eighth note is the leftover half beat, and it leads straight into the next beat.",
          captions: {
            dottedQuarterEighth: "Count: 1 (2) and 3 4",
          },
        },
      },
    },
    readingSyncopation: {
      title: "Sixteenths and syncopation",
      summary: "Dividing the beat in four, playing between the beats and shifting the accent.",
      steps: {
        sixteenths: {
          title: "Four notes in a beat",
          body: "Sixteenth notes divide a beat into four equal parts. Count them \"1 e and a, 2 e and a\": the number is the beat, \"and\" is the half-beat and \"e\" and \"a\" are the sixteenth notes in between. They are written with two beams and often mixed with eighth notes inside a beat.",
          captions: {
            oneEAndA: "Four sixteenth notes, then three quarter notes",
            mixed: "Eighth notes, then sixteenth notes, then quarter notes",
          },
        },
        offbeat: {
          title: "Playing on the \"and\"",
          body: "The notes that fall on the numbers are on the beat; the ones that fall on the \"and\" are off the beat. A rest on the beat followed by a note on the \"and\" is a very common pattern: you must feel the silent beat to place the note. Tap the beat with your foot while you count the example.",
          captions: {
            onTheAnd: "Eighth rests on the beats, notes on every \"and\"",
          },
        },
        syncopation: {
          title: "Shifting the accent",
          body: "[[syncopation:Syncopation]] happens when a note starts off the beat and lasts across the next beat, so the accent moves to a place where the pulse does not expect it. The classic figure is eighth, quarter, eighth: the long note starts on the \"and\" and the strong beat passes without a new attack. Keep the pulse steady and let the notes dance around it.",
          captions: {
            shifted: "Eighth, quarter, eighth, quarter, quarter",
            shiftedHalf: "Eighth, quarter, eighth, half note",
          },
        },
      },
    },
    readingCompoundMeter: {
      title: "Compound meters",
      summary: "6/8, 9/8 and 12/8: when the beat divides in three and the pulse is a dotted note.",
      steps: {
        simpleVsCompound: {
          title: "Dividing by two or by three",
          body: "In a simple meter such as 2/4 the beat divides into two: a quarter note becomes two eighth notes. In a compound meter such as 6/8 the beat divides into three, so the eighth notes come in groups of three. Both measures below hold the same number of notes per beat group, but they feel very different: the first one marches, the second one swings.",
          captions: {
            simple: "2/4: four eighth notes in two groups of two",
            compound: "6/8: six eighth notes in two groups of three",
          },
        },
        dottedPulse: {
          title: "The dotted pulse",
          body: "In compound meters the pulse is a dotted note, which holds exactly three eighth notes. So 6/8 has two pulses per measure (counted \"1 2\"), 9/8 has three and 12/8 has four. The bottom number still says the eighth note is the unit, but you feel and count the pulses, not the eighth notes.",
          captions: {
            sixEight: "6/8: two dotted quarter note pulses",
            nineEight: "9/8: three pulses",
            twelveEight: "12/8: four pulses",
          },
        },
        commonPatterns: {
          title: "Common patterns",
          body: "Inside each pulse of three eighth notes the rhythm can be written in a few ways: three eighth notes, a quarter note plus an eighth note (long-short) or an eighth note plus a quarter note (short-long), or one dotted quarter note for the whole pulse. Learn to recognize these shapes at a glance and you read compound meter fast.",
          captions: {
            quarterEighth: "Quarter plus eighth, twice",
            eighthsThenDotted: "Three eighth notes, then a dotted quarter note",
          },
        },
      },
    },
    readingTuplets: {
      title: "Triplets and tuplets",
      summary: "Squeezing three notes into the space of two, and other irregular groups.",
      steps: {
        triplets: {
          title: "Three in the time of two",
          body: "A [[tuplet:triplet]] fits three equal notes into the time normally taken by two of the same kind. Three triplet eighth notes share a single beat, so each one lasts a third of a beat. The group is marked with a small 3 over a bracket or the beam. Count it \"1 trip-let\" or simply \"1 la li\".",
          captions: {
            oneTriplet: "One beat of triplet eighth notes",
          },
        },
        tripletVsEighths: {
          title: "Triplet or two eighths?",
          body: "A beat can hold two eighth notes or three triplet eighth notes: same beat, different division. Two eighth notes feel like a back-and-forth; a triplet feels like a rolling wheel. Pay attention to the little 3 over the notes, it changes the rhythm completely.",
          captions: {
            twoThenThree: "One beat of eighth notes, then one beat of triplet",
          },
        },
        otherTuplets: {
          title: "Other tuplets",
          body: "The triplet is the most common [[tuplet:tuplet]], but the idea works for any number. A duplet puts two notes in the time of three, and is used in compound meters like 6/8. A quintuplet puts five notes in the time of four, a sextuplet six in the time of four. The number written over the group always tells you how many notes share the space.",
        },
      },
    },
  },
  explanations: {
    readingRhythmValueName:
      "From the longest to the shortest the values are whole, half, quarter, eighth and sixteenth, each half as long as the one before. This one is a {value}.",
    readingRhythmRestName: "A rest lasts as long as the note with the same name, so the symbol shown is a {value}.",
    readingRhythmHowManyFit:
      "Each value lasts half as long as the one before it, so one {big} is as long as {answer} {small}.",
    readingRhythmBeatsPerMeasure:
      "The top number of the time signature counts the beats in a measure, and the bottom number 4 says the quarter note is the beat. So {time} has {answer} beats.",
    readingRhythmMissingValue:
      "A {time} measure is worth {total} eighth notes. The notes shown take {used}, so {missing} eighth notes are left, and that is exactly a {value}.",
    readingRhythmWhichTimeSignature:
      "The top number is how many beats per measure and the bottom number is the note value of the beat. {beats} beats of a {value} is written {time}.",
    readingRhythmDottedValue:
      "A dotted note is its own value plus half of it. A {value} is {base} {unit}, half of that is {half}, so the dotted note lasts {answer} {unit}.",
    readingRhythmTiedDuration: "A tie adds the values: {first} + {second} = {answer} {unit}.",
    readingRhythmAttackCount:
      "Count only the notes that start a sound: {count}. Rests make no sound, and the second note of a tie only continues the first one. The music has {written} written symbols.",
    readingRhythmSyncopatedYes:
      "A note starts between the beats and lasts across the next beat, so the accent moves off the pulse. That is syncopation.",
    readingRhythmSyncopatedNo:
      "Every note either starts on a beat or ends before the next beat arrives, so the accent stays on the pulse. It is not syncopated.",
    readingRhythmCountOfNote:
      "Counting 1 and 2 and 3 and 4 and, {which} starts on {count}.",
    readingRhythmPulsesInMeter:
      "In a compound meter the pulse is a dotted note with three eighth notes. {time} has {top} eighth notes, which is {answer} pulses.",
    readingRhythmSimpleMeter:
      "{time} has a top number of {top}, so it is a simple meter: the beat is a plain note that divides into two.",
    readingRhythmCompoundMeter:
      "{time} has a top number of {top}, a multiple of three greater than three, so it is a compound meter: the beat is a dotted note that divides into three.",
    readingRhythmPulseValue:
      "In {time} one pulse is a {value}. A measure has {pulses} pulses. In compound meters the pulse is the dotted note that holds three divisions.",
    readingRhythmTripletCount:
      "A triplet fits {answer} equal notes into the time normally taken by {normal} of the same kind, so one beat holds {answer} triplet eighth notes.",
    readingRhythmTripletFraction:
      "A triplet fits three notes in the time of two normal ones of the same value, here {value}. So each triplet note lasts {answer} of a beat.",
  },
  checkpoints: {
    readingRhythm: {
      valueName: "What is the value of this note?",
      restName: "Which rest is this?",
      howManyFit: "How many {small} fit in the time of one {big}?",
      beatsPerMeasure: "How many beats does each measure have? The quarter note is the beat.",
      missingValue: "Which single note value completes this measure?",
      whichTimeSignature: "Which time signature has {beats} beats per measure, with the {value} as the beat?",
      dottedValue: "How many {unit} does a dotted {value} last?",
      tiedDuration: "The tied notes sound as one long note. How long is it, counted in {unit}?",
      attackCount: "How many notes are actually struck in this music? Tied notes count once.",
      attackCountRests: "How many notes are struck in this measure? Rests make no sound.",
      isSyncopated: "Is this rhythm syncopated?",
      countOfNote: "Counting 1 and 2 and 3 and 4 and, on which count does {which} start?",
      pulsesInMeter: "How many pulses does each measure of {time} have?",
      simpleOrCompound: "Is {time} a simple or a compound meter?",
      pulseValue: "In {time}, which note value is one pulse?",
      tripletCount: "How many equal notes does a triplet squeeze into one beat?",
      tripletAttackCount: "How many notes are struck in this measure? Count every note of the triplets.",
      tripletFraction: "With the quarter note as the beat, how much of a beat does each note of this triplet last? The triplet is made of {value}.",
      names: {
        whole: "whole note",
        half: "half note",
        quarter: "quarter note",
        eighth: "eighth note",
        sixteenth: "sixteenth note",
        wholePlural: "whole notes",
        halfPlural: "half notes",
        quarterPlural: "quarter notes",
        eighthPlural: "eighth notes",
        sixteenthPlural: "sixteenth notes",
        wholeRest: "whole rest",
        halfRest: "half rest",
        quarterRest: "quarter rest",
        eighthRest: "eighth rest",
        sixteenthRest: "sixteenth rest",
        dottedQuarter: "dotted quarter note",
      },
      options: {
        whole: "Whole note",
        half: "Half note",
        quarter: "Quarter note",
        eighth: "Eighth note",
        sixteenth: "Sixteenth note",
        wholeRest: "Whole rest",
        halfRest: "Half rest",
        quarterRest: "Quarter rest",
        eighthRest: "Eighth rest",
        sixteenthRest: "Sixteenth rest",
        dottedQuarter: "Dotted quarter note",
        yes: "Yes, it is syncopated",
        no: "No, the accent stays on the beat",
        simple: "Simple",
        compound: "Compound",
        countAnd: "{n} and",
        secondNote: "the second note",
        lastNote: "the last note",
      },
    },
  },
};
