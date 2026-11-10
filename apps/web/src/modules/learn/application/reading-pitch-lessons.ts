import { Duration, MAJOR_SCALE_PATTERN, createPassage, note, rest, type MusicEvent } from "@music-workspace/music-theory";

import { generateCheckpoint } from "./checkpoint-generators";
import type { ConceptStep, Lesson, LessonContext, StaffExample } from "./curriculum";

/**
 * Lições de leitura de altura (trilha "Leitura de partitura"): pauta, linhas suplementares,
 * clave de fá, acidentes e armaduras. Cada passo de conceito mostra pautas montadas com
 * `createPassage`/`note`/`rest`; o checkpoint vem de `READING_PITCH_GENERATORS` (ligado em
 * `checkpoint-generators.ts`).
 */

const CONTEXT: LessonContext = { root: "C", pattern: MAJOR_SCALE_PATTERN.name };

const WHOLE = Duration.of("whole");
const HALF = Duration.of("half");
const QUARTER = Duration.of("quarter");

type LessonId = "reading-staff" | "reading-ledger-lines" | "reading-bass-clef" | "reading-accidentals" | "reading-key-signatures";

/** Semínimas em sequência. */
function quarters(...pitches: string[]): MusicEvent[] {
  return pitches.map((pitch) => note(pitch, QUARTER));
}

function halves(...pitches: string[]): MusicEvent[] {
  return pitches.map((pitch) => note(pitch, HALF));
}

const quarterRest = () => rest(QUARTER);

function captionKey(lesson: string, step: string, name: string): string {
  return `learn.lessons.${lesson}.steps.${step}.captions.${name}`;
}

function conceptStep(lesson: string, step: string, staves: StaffExample[]): ConceptStep {
  return {
    kind: "concept",
    titleKey: `learn.lessons.${lesson}.steps.${step}.title`,
    bodyKey: `learn.lessons.${lesson}.steps.${step}.body`,
    viz: ["staff"],
    staves,
  };
}

function lesson(
  id: LessonId,
  i18nKey: string,
  prerequisiteId: string | undefined,
  practice: Lesson["practice"],
  steps: ConceptStep[],
): Lesson {
  return {
    id,
    titleKey: `learn.lessons.${i18nKey}.title`,
    summaryKey: `learn.lessons.${i18nKey}.summary`,
    context: CONTEXT,
    prerequisiteId,
    practice,
    steps: [...steps, { kind: "checkpoint", generate: (ctx) => generateCheckpoint(id, ctx) }],
  };
}

const PLAYBACK = { bpm: 80 };

const readingStaff = lesson(
  "reading-staff",
  "readingStaff",
  undefined,
  [{ kind: "reading", exercise: "notes", level: "treble-staff" }],
  [
    conceptStep("readingStaff", "staffLines", [
      {
        passage: createPassage({ time: "5/4" }, [quarters("E4", "G4", "B4", "D5", "F5")]),
        captionKey: captionKey("readingStaff", "staffLines", "lines"),
        playback: PLAYBACK,
      },
      {
        passage: createPassage({}, [quarters("F4", "A4", "C5", "E5")]),
        captionKey: captionKey("readingStaff", "staffLines", "spaces"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingStaff", "trebleClef", [
      {
        passage: createPassage({}, [[...quarters("E4", "G4", "F5"), quarterRest()]]),
        captionKey: captionKey("readingStaff", "trebleClef", "notes"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingStaff", "landmarks", [
      {
        passage: createPassage({}, [quarters("G4", "A4", "B4", "C5"), [...quarters("D5", "E5", "F5"), quarterRest()]]),
        captionKey: captionKey("readingStaff", "landmarks", "climb"),
        playback: PLAYBACK,
      },
    ]),
  ],
);

const readingLedgerLines = lesson(
  "reading-ledger-lines",
  "readingLedgerLines",
  "reading-note-values",
  [{ kind: "reading", exercise: "notes", level: "treble-ledger" }],
  [
    conceptStep("readingLedgerLines", "ledgerLines", [
      {
        passage: createPassage({}, [
          [...quarters("F5", "G5", "A5"), quarterRest()],
          [...quarters("E4", "D4", "C4"), quarterRest()],
        ]),
        captionKey: captionKey("readingLedgerLines", "ledgerLines", "outside"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingLedgerLines", "middleC", [
      {
        passage: createPassage({}, [[...quarters("C4", "D4", "E4"), quarterRest()]]),
        captionKey: captionKey("readingLedgerLines", "middleC", "middleC"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingLedgerLines", "octaves", [
      {
        passage: createPassage({}, [halves("C4", "C5"), halves("G4", "G5")]),
        captionKey: captionKey("readingLedgerLines", "octaves", "octaves"),
        playback: PLAYBACK,
      },
    ]),
  ],
);

const readingBassClef = lesson(
  "reading-bass-clef",
  "readingBassClef",
  "reading-time-signatures",
  [
    { kind: "reading", exercise: "notes", level: "bass-staff" },
    { kind: "reading", exercise: "notes", level: "grand-staff" },
  ],
  [
    conceptStep("readingBassClef", "fClef", [
      {
        passage: createPassage({ clef: "bass" }, [quarters("G2", "A2", "B2", "C3"), quarters("D3", "E3", "F3", "G3")]),
        captionKey: captionKey("readingBassClef", "fClef", "climb"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingBassClef", "grandStaff", [
      {
        passage: createPassage({}, [[note("C4", WHOLE)]]),
        captionKey: captionKey("readingBassClef", "grandStaff", "treble"),
        playback: { bpm: 60 },
      },
      {
        passage: createPassage({ clef: "bass" }, [[note("C4", WHOLE)]]),
        captionKey: captionKey("readingBassClef", "grandStaff", "bass"),
        playback: { bpm: 60 },
      },
    ]),
    conceptStep("readingBassClef", "bassLandmarks", [
      {
        passage: createPassage({ clef: "bass" }, [[...quarters("F3", "C3", "C4"), quarterRest()]]),
        captionKey: captionKey("readingBassClef", "bassLandmarks", "landmarks"),
        playback: PLAYBACK,
      },
    ]),
  ],
);

const readingAccidentals = lesson(
  "reading-accidentals",
  "readingAccidentals",
  "reading-bass-clef",
  [{ kind: "reading", exercise: "notes", level: "accidentals" }],
  [
    conceptStep("readingAccidentals", "symbols", [
      {
        passage: createPassage({}, [halves("F#4", "F4"), halves("Bb4", "G##4")]),
        captionKey: captionKey("readingAccidentals", "symbols", "signs"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingAccidentals", "measureRule", [
      {
        passage: createPassage({}, [quarters("F#4", "A4", "F#4", "F5"), [note("F4", WHOLE)]]),
        captionKey: captionKey("readingAccidentals", "measureRule", "rule"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingAccidentals", "enharmonicSpelling", [
      {
        passage: createPassage({}, [halves("F#4", "Gb4")]),
        captionKey: captionKey("readingAccidentals", "enharmonicSpelling", "pair"),
        playback: PLAYBACK,
      },
    ]),
  ],
);

const readingKeySignatures = lesson(
  "reading-key-signatures",
  "readingKeySignatures",
  "reading-dots-ties",
  [
    { kind: "reading", exercise: "keys", level: "up-to-2" },
    { kind: "reading", exercise: "notes", level: "key-signatures" },
  ],
  [
    conceptStep("readingKeySignatures", "whatIsKeySignature", [
      {
        passage: createPassage({ fifths: 1 }, [quarters("G4", "A4", "B4", "C5"), quarters("D5", "E5", "F#5", "G5")]),
        captionKey: captionKey("readingKeySignatures", "whatIsKeySignature", "gMajor"),
        playback: PLAYBACK,
      },
    ]),
    conceptStep("readingKeySignatures", "orderOfAccidentals", [
      {
        passage: createPassage({ fifths: 7 }, [[]]),
        captionKey: captionKey("readingKeySignatures", "orderOfAccidentals", "sharps"),
      },
      {
        passage: createPassage({ fifths: -7 }, [[]]),
        captionKey: captionKey("readingKeySignatures", "orderOfAccidentals", "flats"),
      },
    ]),
    conceptStep("readingKeySignatures", "findTheKey", [
      {
        passage: createPassage({ fifths: 3 }, [[]]),
        captionKey: captionKey("readingKeySignatures", "findTheKey", "sharps"),
      },
      {
        passage: createPassage({ fifths: -3 }, [[]]),
        captionKey: captionKey("readingKeySignatures", "findTheKey", "flats"),
      },
    ]),
  ],
);

export const READING_PITCH_LESSONS: Record<LessonId, Lesson> = {
  "reading-staff": readingStaff,
  "reading-ledger-lines": readingLedgerLines,
  "reading-bass-clef": readingBassClef,
  "reading-accidentals": readingAccidentals,
  "reading-key-signatures": readingKeySignatures,
};
