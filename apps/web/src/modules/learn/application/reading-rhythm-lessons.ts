import {
  Duration,
  MAJOR_SCALE_PATTERN,
  TRIPLET,
  createPassage,
  note,
  rest,
  type MusicEvent,
  type NoteValue,
  type Passage,
} from "@music-workspace/music-theory";

import { generateCheckpoint } from "./checkpoint-generators";
import type { ConceptStep, InlineVizKind, Lesson, StaffExample } from "./curriculum";

/**
 * Lições de leitura rítmica da trilha "Leitura de partitura". A ordem na trilha e os pré-requisitos
 * são montados no curriculum; aqui cada lição só aponta para o anterior na cadeia completa.
 * Os exemplos usam uma nota só (Si4) para que a atenção fique no ritmo.
 */

const PITCH = "B4";
const PLAYBACK = { bpm: 72, click: true } as const;
const STAFF_VIZ: InlineVizKind[] = ["staff"];

type Dots = 0 | 1 | 2;

function n(value: NoteValue, dots: Dots = 0, extras: { tieToNext?: boolean } = {}): MusicEvent {
  return note(PITCH, Duration.of(value, dots), extras);
}

function r(value: NoteValue, dots: Dots = 0): MusicEvent {
  return rest(Duration.of(value, dots));
}

/** Repete um evento — `times(4, n("quarter"))` escreve quatro semínimas. */
function times(count: number, event: MusicEvent): MusicEvent[] {
  return Array.from({ length: count }, () => event);
}

/** Nota de quiáltera de colcheia (tercina): três ocupam um tempo de semínima. */
function triplet(): MusicEvent {
  return note(PITCH, Duration.of("eighth", 0, TRIPLET));
}

function example(passage: Passage, captionKey?: string): StaffExample {
  return { passage, playback: PLAYBACK, ...(captionKey ? { captionKey } : {}) };
}

function lessonBase(id: string, key: string, steps: Lesson["steps"], extras: Pick<Lesson, "practice" | "prerequisiteId">): Lesson {
  return {
    id,
    titleKey: `learn.lessons.${key}.title`,
    summaryKey: `learn.lessons.${key}.summary`,
    context: { root: "C", pattern: MAJOR_SCALE_PATTERN.name },
    steps: [...steps, { kind: "checkpoint", generate: (ctx) => generateCheckpoint(id, ctx) }],
    ...extras,
  };
}

/** Passo de conceito de uma lição; `captions` são as chaves (em `steps.<passo>.captions`) de cada pauta. */
function concept(lessonKey: string, stepKey: string, staves?: (readonly [Passage, string])[]): ConceptStep {
  const prefix = `learn.lessons.${lessonKey}.steps.${stepKey}`;

  return {
    kind: "concept",
    titleKey: `${prefix}.title`,
    bodyKey: `${prefix}.body`,
    ...(staves ? { viz: STAFF_VIZ, staves: staves.map(([passage, caption]) => example(passage, `${prefix}.captions.${caption}`)) } : {}),
  };
}

const noteValuesLesson = lessonBase(
  "reading-note-values",
  "readingNoteValues",
  [
    concept("readingNoteValues", "figures", [
      [createPassage({}, [[n("whole")]]), "whole"],
      [createPassage({}, [[n("half"), n("half")]]), "half"],
      [createPassage({}, [times(4, n("quarter"))]), "quarter"],
      [createPassage({}, [times(8, n("eighth"))]), "eighth"],
      [createPassage({}, [times(16, n("sixteenth"))]), "sixteenth"],
    ]),
    concept("readingNoteValues", "rests", [
      [createPassage({}, [[n("quarter"), r("quarter"), n("half")]]), "quarterRest"],
      [createPassage({}, [[r("half"), n("half")]]), "halfRest"],
    ]),
    concept("readingNoteValues", "pulse", [[createPassage({}, [times(4, n("quarter")), times(4, n("quarter"))]), "steady"]]),
  ],
  { practice: [{ kind: "reading", exercise: "rhythm", level: "quarters" }], prerequisiteId: "reading-staff" },
);

const timeSignaturesLesson = lessonBase(
  "reading-time-signatures",
  "readingTimeSignatures",
  [
    concept("readingTimeSignatures", "measuresAndBarlines", [
      [createPassage({}, [times(4, n("quarter")), [n("half"), n("half")]]), "twoMeasures"],
    ]),
    concept("readingTimeSignatures", "topAndBottom", [
      [createPassage({ time: "2/4" }, [times(2, n("quarter"))]), "twoFour"],
      [createPassage({ time: "3/4" }, [times(3, n("quarter"))]), "threeFour"],
      [createPassage({ time: "4/4" }, [times(4, n("quarter"))]), "fourFour"],
    ]),
    concept("readingTimeSignatures", "counting", [
      [createPassage({}, [times(4, n("quarter"))]), "countQuarters"],
      [createPassage({}, [times(8, n("eighth"))]), "countEighths"],
    ]),
  ],
  {
    practice: [
      { kind: "reading", exercise: "rhythm", level: "quarters" },
      { kind: "reading", exercise: "rhythm", level: "eighths" },
    ],
    prerequisiteId: "reading-ledger-lines",
  },
);

const dotsTiesLesson = lessonBase(
  "reading-dots-ties",
  "readingDotsTies",
  [
    concept("readingDotsTies", "dot", [
      [createPassage({}, [[n("half", 1), n("quarter")]]), "dottedHalf"],
      [createPassage({}, [[n("quarter", 1), n("eighth"), n("half")]]), "dottedQuarter"],
    ]),
    concept("readingDotsTies", "tie", [
      [
        createPassage({}, [
          [n("quarter"), n("quarter"), n("half", 0, { tieToNext: true })],
          [n("quarter"), n("quarter"), n("half")],
        ]),
        "acrossBarline",
      ],
      [createPassage({}, [[n("half", 0, { tieToNext: true }), n("quarter"), n("quarter")]]), "insideMeasure"],
    ]),
    concept("readingDotsTies", "countingDotted", [
      [createPassage({}, [[n("quarter", 1), n("eighth"), n("quarter"), n("quarter")]]), "dottedQuarterEighth"],
    ]),
  ],
  { practice: [{ kind: "reading", exercise: "rhythm", level: "dotted" }], prerequisiteId: "reading-accidentals" },
);

const syncopationLesson = lessonBase(
  "reading-syncopation",
  "readingSyncopation",
  [
    concept("readingSyncopation", "sixteenths", [
      [createPassage({}, [[...times(4, n("sixteenth")), ...times(3, n("quarter"))]]), "oneEAndA"],
      [createPassage({}, [[...times(2, n("eighth")), ...times(4, n("sixteenth")), n("quarter"), n("quarter")]]), "mixed"],
    ]),
    concept("readingSyncopation", "offbeat", [
      [createPassage({}, [Array.from({ length: 4 }).flatMap(() => [r("eighth"), n("eighth")])]), "onTheAnd"],
    ]),
    concept("readingSyncopation", "syncopation", [
      [createPassage({}, [[n("eighth"), n("quarter"), n("eighth"), n("quarter"), n("quarter")]]), "shifted"],
      [createPassage({}, [[n("eighth"), n("quarter"), n("eighth"), n("half")]]), "shiftedHalf"],
    ]),
  ],
  {
    practice: [
      { kind: "reading", exercise: "rhythm", level: "sixteenths" },
      { kind: "reading", exercise: "rhythm", level: "syncopation" },
    ],
    prerequisiteId: "reading-key-signatures",
  },
);

const compoundMeterLesson = lessonBase(
  "reading-compound-meter",
  "readingCompoundMeter",
  [
    concept("readingCompoundMeter", "simpleVsCompound", [
      [createPassage({ time: "2/4" }, [times(4, n("eighth"))]), "simple"],
      [createPassage({ time: "6/8" }, [times(6, n("eighth"))]), "compound"],
    ]),
    concept("readingCompoundMeter", "dottedPulse", [
      [createPassage({ time: "6/8" }, [times(2, n("quarter", 1))]), "sixEight"],
      [createPassage({ time: "9/8" }, [times(3, n("quarter", 1))]), "nineEight"],
      [createPassage({ time: "12/8" }, [times(4, n("quarter", 1))]), "twelveEight"],
    ]),
    concept("readingCompoundMeter", "commonPatterns", [
      [createPassage({ time: "6/8" }, [[n("quarter"), n("eighth"), n("quarter"), n("eighth")]]), "quarterEighth"],
      [createPassage({ time: "6/8" }, [[...times(3, n("eighth")), n("quarter", 1)]]), "eighthsThenDotted"],
    ]),
  ],
  { practice: [{ kind: "reading", exercise: "rhythm", level: "compound" }], prerequisiteId: "reading-syncopation" },
);

const tupletsLesson = lessonBase(
  "reading-tuplets",
  "readingTuplets",
  [
    concept("readingTuplets", "triplets", [
      [createPassage({}, [[...times(3, triplet()), n("quarter"), n("half")]]), "oneTriplet"],
    ]),
    concept("readingTuplets", "tripletVsEighths", [
      [createPassage({}, [[...times(2, n("eighth")), ...times(3, triplet()), n("quarter"), n("quarter")]]), "twoThenThree"],
    ]),
    concept("readingTuplets", "otherTuplets"),
  ],
  { practice: [{ kind: "reading", exercise: "rhythm", level: "triplets" }], prerequisiteId: "reading-compound-meter" },
);

export const READING_RHYTHM_LESSONS: Record<
  | "reading-note-values"
  | "reading-time-signatures"
  | "reading-dots-ties"
  | "reading-syncopation"
  | "reading-compound-meter"
  | "reading-tuplets",
  Lesson
> = {
  "reading-note-values": noteValuesLesson,
  "reading-time-signatures": timeSignaturesLesson,
  "reading-dots-ties": dotsTiesLesson,
  "reading-syncopation": syncopationLesson,
  "reading-compound-meter": compoundMeterLesson,
  "reading-tuplets": tupletsLesson,
};
