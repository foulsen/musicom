import { MAJOR_SCALE_PATTERN, Duration, createPassage, note, type Passage } from "@music-workspace/music-theory";

import { generateCheckpoint } from "./checkpoint-generators";
import type { ConceptStep, Lesson, StaffExample } from "./curriculum";

/**
 * Lições avançadas da trilha de leitura de partitura: acordes na pauta, expressão (dinâmica,
 * articulação, andamento), claves de dó e leitura à primeira vista. Os exemplos de pauta são
 * `Passage`s do domínio; os textos vivem em `learn.lessons.<idEmCamelCase>.steps.<passo>.*`.
 */

const WHOLE = Duration.of("whole");
const DOTTED_HALF = Duration.of("half", 1);
const HALF = Duration.of("half");
const QUARTER = Duration.of("quarter");
const EIGHTH = Duration.of("eighth");

const CONTEXT = { root: "C", pattern: MAJOR_SCALE_PATTERN.name } as const;

type AdvancedLessonId = "reading-chords" | "reading-expression" | "reading-c-clefs" | "reading-sight-reading";

const LESSON_KEYS: Record<AdvancedLessonId, string> = {
  "reading-chords": "readingChords",
  "reading-expression": "readingExpression",
  "reading-c-clefs": "readingCClefs",
  "reading-sight-reading": "readingSightReading",
};

/** Exemplo de pauta com legenda opcional (`captionKey` é derivado de `lessonId` + `stepId` + `caption`). */
function example(
  lessonId: AdvancedLessonId,
  stepId: string,
  passage: Passage,
  caption?: string,
  playback?: StaffExample["playback"],
): StaffExample {
  return {
    passage,
    ...(caption ? { captionKey: `learn.lessons.${LESSON_KEYS[lessonId]}.steps.${stepId}.${caption}` } : {}),
    ...(playback ? { playback } : {}),
  };
}

function conceptStep(lessonId: AdvancedLessonId, stepId: string, staves: StaffExample[]): ConceptStep {
  const base = `learn.lessons.${LESSON_KEYS[lessonId]}.steps.${stepId}`;

  return { kind: "concept", titleKey: `${base}.title`, bodyKey: `${base}.body`, viz: ["staff"], staves };
}

function lesson(
  id: AdvancedLessonId,
  prerequisiteId: string,
  practice: Lesson["practice"],
  steps: ConceptStep[],
): Lesson {
  const base = `learn.lessons.${LESSON_KEYS[id]}`;

  return {
    id,
    titleKey: `${base}.title`,
    summaryKey: `${base}.summary`,
    context: { ...CONTEXT },
    prerequisiteId,
    practice,
    steps: [...steps, { kind: "checkpoint", generate: (ctx) => generateCheckpoint(id, ctx) }],
  };
}

// ── reading-chords ───────────────────────────────────────────────────────────

const intervalsOddPassage = createPassage({}, [[note(["E4", "G4"], WHOLE)], [note(["G4", "D5"], WHOLE)]]);
const intervalsEvenPassage = createPassage({}, [[note(["E4", "A4"], WHOLE)], [note(["G4", "E5"], WHOLE)]]);

const triadsOnLinesPassage = createPassage({}, [[note(["E4", "G4", "B4"], WHOLE)], [note(["G4", "B4", "D5"], WHOLE)]]);
const triadsInSpacesPassage = createPassage({}, [[note(["F4", "A4", "C5"], WHOLE)], [note(["A4", "C5", "E5"], WHOLE)]]);

/** As sete tríades de Dó maior (empilhando terças da escala) mais a tônica de volta uma oitava acima. */
const cMajorTriadsPassage = createPassage({}, [
  [
    note(["C4", "E4", "G4"], QUARTER),
    note(["D4", "F4", "A4"], QUARTER),
    note(["E4", "G4", "B4"], QUARTER),
    note(["F4", "A4", "C5"], QUARTER),
  ],
  [
    note(["G4", "B4", "D5"], QUARTER),
    note(["A4", "C5", "E5"], QUARTER),
    note(["B4", "D5", "F5"], QUARTER),
    note(["C5", "E5", "G5"], QUARTER),
  ],
]);

const chordsLesson = lesson(
  "reading-chords",
  "reading-tuplets",
  [
    { kind: "reading", exercise: "notes", level: "grand-staff" },
    { kind: "ear-training", quiz: "chordQuality" },
  ],
  [
    conceptStep("reading-chords", "intervalsOnStaff", [
      example("reading-chords", "intervalsOnStaff", intervalsOddPassage, "captionOdd"),
      example("reading-chords", "intervalsOnStaff", intervalsEvenPassage, "captionEven"),
    ]),
    conceptStep("reading-chords", "stackedTriads", [
      example("reading-chords", "stackedTriads", triadsOnLinesPassage, "captionLines"),
      example("reading-chords", "stackedTriads", triadsInSpacesPassage, "captionSpaces"),
    ]),
    conceptStep("reading-chords", "namingChords", [
      example("reading-chords", "namingChords", cMajorTriadsPassage, "caption", { bpm: 60 }),
    ]),
  ],
);

// ── reading-expression ───────────────────────────────────────────────────────

const dynamicsPassage = createPassage({ time: "3/4" }, [
  [
    note("G4", QUARTER, { dynamic: "pp" }),
    note("G4", QUARTER, { dynamic: "p" }),
    note("G4", QUARTER, { dynamic: "mp" }),
  ],
  [
    note("G4", QUARTER, { dynamic: "mf" }),
    note("G4", QUARTER, { dynamic: "f" }),
    note("G4", QUARTER, { dynamic: "ff" }),
  ],
]);

const articulationsPassage = createPassage({}, [
  [
    note("B4", QUARTER, { articulations: ["staccato"] }),
    note("B4", QUARTER, { articulations: ["accent"] }),
    note("B4", QUARTER, { articulations: ["tenuto"] }),
    note("B4", QUARTER, { articulations: ["marcato"] }),
  ],
  [note("B4", WHOLE, { articulations: ["fermata"] })],
]);

/** Mesmas notas nos dois andamentos — só a velocidade muda. */
const tempoPassage = createPassage({}, [
  [note("C5", QUARTER), note("D5", QUARTER), note("E5", QUARTER), note("C5", QUARTER)],
]);

const expressionLesson = lesson(
  "reading-expression",
  chordsLesson.id,
  [{ kind: "reading", exercise: "dictation", level: "steps" }],
  [
    conceptStep("reading-expression", "dynamics", [
      example("reading-expression", "dynamics", dynamicsPassage, "caption"),
    ]),
    conceptStep("reading-expression", "articulations", [
      example("reading-expression", "articulations", articulationsPassage, "caption"),
    ]),
    conceptStep("reading-expression", "tempo", [
      example("reading-expression", "tempo", tempoPassage, "captionSlow", { bpm: 52, click: true }),
      example("reading-expression", "tempo", tempoPassage, "captionFast", { bpm: 144, click: true }),
    ]),
  ],
);

// ── reading-c-clefs ──────────────────────────────────────────────────────────

const middleCTreblePassage = createPassage({ clef: "treble" }, [[note("C4", WHOLE)]]);
const middleCAltoPassage = createPassage({ clef: "alto" }, [[note("C4", WHOLE)]]);
const middleCTenorPassage = createPassage({ clef: "tenor" }, [[note("C4", WHOLE)]]);

/** A mesma melodia (A3 … E4 e de volta) escrita nas duas claves de dó. */
function cClefMelody(clef: "alto" | "tenor"): Passage {
  return createPassage({ clef }, [
    [note("A3", QUARTER), note("B3", QUARTER), note("C4", QUARTER), note("D4", QUARTER)],
    [note("E4", QUARTER), note("D4", QUARTER), note("C4", QUARTER), note("B3", QUARTER)],
  ]);
}

const cClefsLesson = lesson(
  "reading-c-clefs",
  expressionLesson.id,
  [{ kind: "reading", exercise: "notes", level: "c-clefs" }],
  [
    conceptStep("reading-c-clefs", "cClef", [
      example("reading-c-clefs", "cClef", middleCTreblePassage, "captionTreble"),
      example("reading-c-clefs", "cClef", middleCAltoPassage, "captionAlto"),
      example("reading-c-clefs", "cClef", middleCTenorPassage, "captionTenor"),
    ]),
    conceptStep("reading-c-clefs", "altoClef", [
      example("reading-c-clefs", "altoClef", cClefMelody("alto"), "caption", { bpm: 72 }),
    ]),
    conceptStep("reading-c-clefs", "tenorClef", [
      example("reading-c-clefs", "tenorClef", cClefMelody("tenor"), "caption", { bpm: 72 }),
    ]),
  ],
);

// ── reading-sight-reading ────────────────────────────────────────────────────

const scanPassage = createPassage({ fifths: 1, time: "3/4" }, [
  [note("G4", QUARTER), note("A4", QUARTER), note("B4", QUARTER)],
  [note("D5", DOTTED_HALF)],
]);

const keepGoingPassage = createPassage({ fifths: -1 }, [
  [note("F4", QUARTER), note("G4", QUARTER), note("A4", QUARTER), note("Bb4", QUARTER)],
  [note("C5", QUARTER), note("A4", QUARTER), note("F4", HALF)],
]);

const chunkingPassage = createPassage({}, [
  [
    note("C4", EIGHTH),
    note("D4", EIGHTH),
    note("E4", EIGHTH),
    note("F4", EIGHTH),
    note("G4", EIGHTH),
    note("F4", EIGHTH),
    note("E4", EIGHTH),
    note("D4", EIGHTH),
  ],
  [note("C4", HALF), note("G4", HALF)],
]);

const sightReadingLesson = lesson(
  "reading-sight-reading",
  cClefsLesson.id,
  [
    { kind: "reading", exercise: "dictation", level: "leaps" },
    { kind: "reading", exercise: "rhythm", level: "syncopation" },
    { kind: "reading", exercise: "notes", level: "grand-staff" },
  ],
  [
    conceptStep("reading-sight-reading", "scanFirst", [
      example("reading-sight-reading", "scanFirst", scanPassage, "caption", { bpm: 72, click: true }),
    ]),
    conceptStep("reading-sight-reading", "keepGoing", [
      example("reading-sight-reading", "keepGoing", keepGoingPassage, undefined, { bpm: 80, click: true }),
    ]),
    conceptStep("reading-sight-reading", "chunking", [
      example("reading-sight-reading", "chunking", chunkingPassage, "caption", { bpm: 72, click: true }),
    ]),
  ],
);

export const READING_ADVANCED_LESSONS: Record<AdvancedLessonId, Lesson> = {
  "reading-chords": chordsLesson,
  "reading-expression": expressionLesson,
  "reading-c-clefs": cClefsLesson,
  "reading-sight-reading": sightReadingLesson,
};
