import {
  Clef,
  Duration,
  KeySignature,
  SpelledNote,
  SpelledPitch,
  createPassage,
  effectiveAccidental,
  note,
  type Letter,
  type Passage,
} from "@music-workspace/music-theory";

import type { LabelRef } from "@/modules/shared/application/music-terms";
import type { QuizOption } from "@/modules/shared/application/quiz";
import { randomChoice, randomInt, sampleDistinct, shuffle } from "@/modules/shared/application/random";

import { explain, toOption, type QuestionGenerator } from "./checkpoint-kit";

/**
 * Pools de perguntas das lições de leitura de altura (pauta, linhas suplementares, clave de fá,
 * acidentes e armaduras). Toda resposta vem do domínio: posições via `Clef`, armaduras via
 * `KeySignature`, acidentes via `measureAccidentalMarks`/`effectiveAccidental`. Prompts e
 * rótulos ficam em `learn.checkpoints.readingPitch`, explicações em `learn.explanations.reading*`.
 */

const PROMPTS = "learn.checkpoints.readingPitch";
const OPTIONS = `${PROMPTS}.options`;
const SIDES = `${PROMPTS}.sides`;

const LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];
const WHOLE = Duration.of("whole");
const HALF = Duration.of("half");

const TOP_LINE = 8;
const LEDGER_POSITIONS = [-6, -5, -4, -3, -2, -1, 9, 10, 11, 12, 13, 14];

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);
}

function prompt(name: string): string {
  return `${PROMPTS}.${name}`;
}

function letterOf(pitch: SpelledPitch): Letter {
  return pitch.spelled.letter;
}

function letterOptions(correct: Letter) {
  return shuffle([correct, ...sampleDistinct(LETTERS, 3, (letter) => letter === correct)].map((letter) => toOption(letter)));
}

function singleNotePassage(clef: Clef, pitch: SpelledPitch, fifths = 0): Passage {
  return createPassage({ clef: clef.name, fifths }, [[note(pitch.toString(), WHOLE)]]);
}

/** Letras de `from` até `to` (posições na pauta), na ordem em que são contadas. */
function letterPath(clef: Clef, from: number, to: number): string {
  const step = to >= from ? 1 : -1;
  const positions = range(0, Math.abs(to - from)).map((offset) => from + offset * step);

  return positions.map((position) => letterOf(clef.pitchAt(position))).join(" → ");
}

// ── Lição: a pauta ───────────────────────────────────────────────────────────

function nameNoteGenerator(id: string, promptName: string, clef: Clef, positions: number[]): QuestionGenerator {
  return () => {
    const position = randomChoice(positions);
    const pitch = clef.pitchAt(position);

    return {
      id,
      promptKey: prompt(promptName),
      options: letterOptions(letterOf(pitch)),
      correctId: letterOf(pitch),
      explanation: explain("readingNameNote", {
        bottom: clef.bottomLine().toString(),
        path: letterPath(clef, 0, position),
        note: letterOf(pitch),
      }),
      staff: singleNotePassage(clef, pitch),
    };
  };
}

/** Número da linha (1 = inferior) ou do espaço (1 = o primeiro, acima da linha inferior). */
function ordinalOf(clef: Clef, position: number): number {
  return clef.isLine(position) ? position / 2 + 1 : (position + 1) / 2;
}

function lineOrSpaceId(clef: Clef, position: number): string {
  return `${clef.isLine(position) ? "line" : "space"}-${ordinalOf(clef, position)}`;
}

function lineOrSpaceOption(clef: Clef, position: number) {
  const key = clef.isLine(position) ? "line" : "space";

  return toOption(lineOrSpaceId(clef, position), { key: `${OPTIONS}.${key}`, params: { n: ordinalOf(clef, position) } });
}

const lineOrSpace: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const positions = range(0, TOP_LINE);
  const position = randomChoice(positions);
  const pitch = clef.pitchAt(position);
  const distractors = sampleDistinct(positions, 3, (other) => other === position);

  return {
    id: "line-or-space",
    promptKey: prompt("lineOrSpace"),
    options: shuffle([position, ...distractors].map((item) => lineOrSpaceOption(clef, item))),
    correctId: lineOrSpaceId(clef, position),
    explanation: explain(clef.isLine(position) ? "readingOnLine" : "readingInSpace", {
      note: pitch.toString(),
      number: ordinalOf(clef, position),
    }),
    staff: singleNotePassage(clef, pitch),
  };
};

type MotionKind = "step" | "skip" | "leap";

const stepOrSkip: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const kind = randomChoice<MotionKind>(["step", "skip", "leap"]);
  const distance = kind === "step" ? 1 : kind === "skip" ? 2 : randomChoice([3, 4, 5]);
  const lower = randomInt(TOP_LINE + 1 - distance);
  const [from, to] = Math.random() < 0.5 ? [lower, lower + distance] : [lower + distance, lower];
  const first = clef.pitchAt(from);
  const second = clef.pitchAt(to);
  const between = range(Math.min(from, to) + 1, Math.max(from, to) - 1)
    .map((position) => letterOf(clef.pitchAt(position)))
    .join(", ");

  const explanationName = { step: "readingStep", skip: "readingSkip", leap: "readingLeap" }[kind];

  return {
    id: "step-or-skip",
    promptKey: prompt("stepOrSkip"),
    options: (["step", "skip", "leap"] as const).map((item) => toOption(item, { key: `${OPTIONS}.${item}` })),
    correctId: kind,
    explanation: explain(explanationName, {
      a: letterOf(first),
      b: letterOf(second),
      between,
      skipped: distance - 1,
    }),
    staff: createPassage({ clef: clef.name }, [[note(first.toString(), HALF), note(second.toString(), HALF)]]),
  };
};

// ── Lição: linhas suplementares ──────────────────────────────────────────────

function sideOf(position: number): LabelRef {
  return { key: `${SIDES}.${position < 0 ? "below" : "above"}` };
}

function nameLedgerGenerator(id: string, promptName: string, clef: Clef): QuestionGenerator {
  return () => {
    const position = randomChoice(LEDGER_POSITIONS);
    const pitch = clef.pitchAt(position);
    const edge = position > TOP_LINE ? TOP_LINE : 0;

    return {
      id,
      promptKey: prompt(promptName),
      options: letterOptions(letterOf(pitch)),
      correctId: letterOf(pitch),
      explanation: explain("readingNameLedger", {
        edge: clef.pitchAt(edge).toString(),
        path: letterPath(clef, edge, position),
        note: letterOf(pitch),
      }),
      staff: singleNotePassage(clef, pitch),
    };
  };
}

const countLedgerLines: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const position = randomChoice(LEDGER_POSITIONS);
  const pitch = clef.pitchAt(position);
  const count = clef.ledgerLineCount(position);
  const options = shuffle([count, ...sampleDistinct(range(0, 4), 3, (other) => other === count)]).map((value) =>
    toOption(String(value)),
  );

  const params = { note: pitch.toString(), side: sideOf(position) };

  return {
    id: "count-ledger-lines",
    promptKey: prompt("countLedgerLines"),
    options,
    correctId: String(count),
    explanation:
      count === 0 ? explain("readingLedgerNone", params) : { ...explain("readingLedgerCount", params), count },
    staff: singleNotePassage(clef, pitch),
  };
};

/** Notas que cabem na clave de sol (com até duas linhas suplementares) para a pergunta de oitava. */
const OCTAVE_CANDIDATES = ["C4", "C5", "C6", "G3", "G4", "G5", "E4", "E5", "E6"];

const whichOctave: QuestionGenerator = () => {
  const pitch = SpelledPitch.parse(randomChoice(OCTAVE_CANDIDATES));
  const letter = letterOf(pitch);
  const options = [3, 4, 5, 6].map((octave) => toOption(`${letter}${octave}`));

  return {
    id: "which-octave",
    promptKey: prompt("whichOctave"),
    options: shuffle(options),
    correctId: pitch.toString(),
    explanation: explain("readingOctave", { letter, note: pitch.toString() }),
    staff: singleNotePassage(Clef.TREBLE, pitch),
  };
};

// ── Lição: clave de fá ───────────────────────────────────────────────────────

const sameNoteOtherClef: QuestionGenerator = () => {
  const position = randomChoice(range(0, TOP_LINE));
  const treble = Clef.TREBLE.pitchAt(position);
  const bass = Clef.BASS.pitchAt(position);

  return {
    id: "same-spot-other-clef",
    promptKey: prompt("sameNoteOtherClef"),
    options: letterOptions(letterOf(bass)),
    correctId: letterOf(bass),
    explanation: explain("readingSameSpot", {
      treble: treble.toString(),
      bass: bass.toString(),
      trebleBottom: Clef.TREBLE.bottomLine().toString(),
      bassBottom: Clef.BASS.bottomLine().toString(),
    }),
    staff: singleNotePassage(Clef.TREBLE, treble),
  };
};

// ── Lição: acidentes ─────────────────────────────────────────────────────────

/** Grafias comuns: sustenido em C D F G A, bemol em D E G A B (sem E#, B#, Fb, Cb). */
const SHARPABLE: Letter[] = ["C", "D", "F", "G", "A"];
const FLATTABLE: Letter[] = ["D", "E", "G", "A", "B"];

function randomAccidental(letter: Letter): number {
  const choices: number[] = [];
  if (SHARPABLE.includes(letter)) choices.push(1);
  if (FLATTABLE.includes(letter)) choices.push(-1);

  return randomChoice(choices);
}

/** Nome grafado com sinal: "F#", "Bb", "C". */
function spelledName(letter: Letter, accidental: number): string {
  return new SpelledNote(letter, accidental).toString();
}

/** Resposta + 3 distratores: a mesma letra com outros acidentes e letras vizinhas com o mesmo acidente. */
function spelledNameOptions(answer: SpelledNote) {
  const correct = answer.toString();
  const index = LETTERS.indexOf(answer.letter);
  const neighbours = [LETTERS[(index + 6) % 7], LETTERS[(index + 1) % 7]];
  const pool = [
    ...[-1, 0, 1].map((accidental) => spelledName(answer.letter, accidental)),
    ...neighbours.map((letter) => spelledName(letter, answer.accidental)),
  ];

  return shuffle([correct, ...sampleDistinct([...new Set(pool)], 3, (name) => name === correct)].map((name) => toOption(name)));
}

const nameAccidentalNote: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const position = randomInt(TOP_LINE + 1);
  const letter = letterOf(clef.pitchAt(position));
  const accidental = randomAccidental(letter);
  const pitch = clef.pitchAt(position, accidental);

  return {
    id: "name-accidental-note",
    promptKey: prompt("nameAccidentalNote"),
    options: spelledNameOptions(pitch.spelled),
    correctId: pitch.spelled.toString(),
    explanation: explain(accidental > 0 ? "readingSharpNote" : "readingFlatNote", {
      letter,
      note: pitch.spelled.toString(),
    }),
    staff: singleNotePassage(clef, pitch),
  };
};

const measureRule: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const position = randomInt(TOP_LINE + 1);
  const letter = letterOf(clef.pitchAt(position));
  const first = clef.pitchAt(position, randomAccidental(letter));
  const sameMeasure = Math.random() < 0.5;
  const key = new KeySignature(0);

  // a segunda nota é escrita sem sinal: no mesmo compasso herda o acidente, no seguinte volta à armadura
  const second = sameMeasure ? first : first.withAccidental(key.accidentalFor(letter));
  const passage = sameMeasure
    ? createPassage({ clef: clef.name }, [[note(first.toString(), HALF), note(second.toString(), HALF)]])
    : createPassage({ clef: clef.name }, [[note(first.toString(), WHOLE)], [note(second.toString(), WHOLE)]]);

  const lastMeasure = passage.measures.length - 1;
  const lastEvent = sameMeasure ? 1 : 0;
  const sounding = effectiveAccidental(passage.measures[lastMeasure], key, lastEvent, 0);

  return {
    id: "measure-rule",
    promptKey: prompt(sameMeasure ? "measureRuleSame" : "measureRuleNext"),
    options: spelledNameOptions(new SpelledNote(letter, sounding)),
    correctId: spelledName(letter, sounding),
    explanation: explain(sameMeasure ? "readingMeasureRuleSame" : "readingMeasureRuleNext", {
      first: first.spelled.toString(),
      letter,
      note: spelledName(letter, sounding),
    }),
    staff: passage,
  };
};

/** Teclas pretas nas duas grafias, para a pergunta de enarmonia. */
const BLACK_KEY_SPELLINGS: Array<[Letter, number]> = [
  ["C", 1],
  ["D", 1],
  ["F", 1],
  ["G", 1],
  ["A", 1],
  ["D", -1],
  ["E", -1],
  ["G", -1],
  ["A", -1],
  ["B", -1],
];

const enharmonicOnStaff: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const [letter, accidental] = randomChoice(BLACK_KEY_SPELLINGS);
  const position = randomChoice(range(0, TOP_LINE).filter((item) => letterOf(clef.pitchAt(item)) === letter));
  const shown = clef.pitchAt(position, accidental);

  // a outra grafia: uma letra acima (sustenido -> bemol) ou abaixo (bemol -> sustenido), mesma classe de altura
  const answer = SpelledNote.spell(shown.spelled, accidental > 0 ? 1 : 6, shown.spelled.pitchClass());
  const pool = [
    ...BLACK_KEY_SPELLINGS.map(([item, sign]) => new SpelledNote(item, sign)),
    ...LETTERS.map((item) => new SpelledNote(item, 0)),
  ].filter((candidate) => candidate.pitchClass() !== shown.spelled.pitchClass());

  const distractors = sampleDistinct(pool, 3, () => false);

  return {
    id: "enharmonic-on-staff",
    promptKey: prompt("enharmonicOnStaff"),
    options: shuffle([answer, ...distractors].map((item) => toOption(item.toString()))),
    correctId: answer.toString(),
    explanation: explain("readingEnharmonic", {
      shown: shown.spelled.toString(),
      answer: answer.toString(),
      shownLetter: letter,
      answerLetter: answer.letter,
    }),
    staff: singleNotePassage(clef, shown),
  };
};

// ── Lição: armaduras de clave ────────────────────────────────────────────────

const KEY_FIFTHS = range(-6, 6);

/** Pauta só com clave e armadura (compasso sem notas). */
function keyOnlyPassage(fifths: number): Passage {
  return createPassage({ fifths }, [[]]);
}

function keyOptions(correct: number, labelKey: "majorKey" | "minorKey", tonicOf: (key: KeySignature) => SpelledNote) {
  const nameOf = (fifths: number) => tonicOf(new KeySignature(fifths)).toString();
  const nearby = KEY_FIFTHS.filter((fifths) => fifths !== correct && Math.abs(fifths - correct) <= 3);
  const distractors = sampleDistinct(nearby, 3, () => false);

  return shuffle([correct, ...distractors]).map((fifths) =>
    toOption(nameOf(fifths), { key: `${OPTIONS}.${labelKey}`, params: { note: nameOf(fifths) } }),
  );
}

function listOf(notes: SpelledNote[]): string {
  return notes.map((item) => item.toString()).join(" ");
}

function majorKeyExplanation(key: KeySignature): LabelRef {
  const tonic = key.majorTonic().toString();
  const accidentals = key.accidentals();

  if (key.fifths === 0) return explain("readingMajorKeyNone");
  if (key.fifths > 0) {
    return {
      ...explain("readingMajorKeySharps", { last: accidentals[accidentals.length - 1].toString(), tonic }),
      count: key.fifths,
    };
  }
  if (key.fifths === -1) return explain("readingMajorKeyOneFlat");

  return explain("readingMajorKeyFlats", { count: -key.fifths, list: listOf(accidentals), tonic });
}

const majorKeyOfSignature: QuestionGenerator = () => {
  const fifths = randomChoice(KEY_FIFTHS);
  const key = new KeySignature(fifths);

  return {
    id: "major-key-of-signature",
    promptKey: prompt("majorKeyOfSignature"),
    options: keyOptions(fifths, "majorKey", (item) => item.majorTonic()),
    correctId: key.majorTonic().toString(),
    explanation: majorKeyExplanation(key),
    staff: keyOnlyPassage(fifths),
  };
};

const minorKeyOfSignature: QuestionGenerator = () => {
  const fifths = randomChoice(KEY_FIFTHS);
  const key = new KeySignature(fifths);

  return {
    id: "minor-key-of-signature",
    promptKey: prompt("minorKeyOfSignature"),
    options: keyOptions(fifths, "minorKey", (item) => item.minorTonic()),
    correctId: key.minorTonic().toString(),
    explanation: explain("readingMinorKey", {
      major: key.majorTonic().toString(),
      minor: key.minorTonic().toString(),
    }),
    staff: keyOnlyPassage(fifths),
  };
};

const accidentalCount: QuestionGenerator = () => {
  const fifths = randomChoice(KEY_FIFTHS.filter((value) => value !== 0));
  const key = new KeySignature(fifths);
  const count = Math.abs(fifths);
  const options = shuffle([count, ...sampleDistinct(range(0, 7), 3, (value) => value === count)]).map((value) =>
    toOption(String(value)),
  );

  return {
    id: "accidental-count",
    promptKey: prompt("accidentalCount"),
    promptParams: { key: key.majorTonic().toString() },
    options,
    correctId: String(count),
    explanation: {
      ...explain(fifths > 0 ? "readingCountSharps" : "readingCountFlats", {
        key: key.majorTonic().toString(),
        list: listOf(key.accidentals()),
      }),
      count,
    },
  };
};

const noteInKey: QuestionGenerator = () => {
  const clef = Clef.TREBLE;
  const fifths = randomChoice(KEY_FIFTHS.filter((value) => value !== 0));
  const key = new KeySignature(fifths);
  const letter = randomChoice(key.accidentals()).letter;
  const position = randomChoice(range(0, TOP_LINE).filter((item) => letterOf(clef.pitchAt(item)) === letter));
  const pitch = clef.pitchAt(position, key.accidentalFor(letter));

  return {
    id: "note-in-key",
    promptKey: prompt("noteInKey"),
    options: spelledNameOptions(pitch.spelled),
    correctId: pitch.spelled.toString(),
    explanation: explain("readingNoteInKey", {
      list: listOf(key.accidentals()),
      letter,
      note: pitch.spelled.toString(),
    }),
    staff: singleNotePassage(clef, pitch, fifths),
  };
};

// ── Pools por lição ──────────────────────────────────────────────────────────

export const READING_PITCH_GENERATORS: Record<string, QuestionGenerator[]> = {
  "reading-staff": [nameNoteGenerator("name-note", "nameNote", Clef.TREBLE, range(0, TOP_LINE)), lineOrSpace, stepOrSkip],
  "reading-ledger-lines": [nameLedgerGenerator("name-ledger-note", "nameLedgerNote", Clef.TREBLE), countLedgerLines, whichOctave],
  "reading-bass-clef": [
    nameNoteGenerator("name-bass-note", "nameBassNote", Clef.BASS, range(-1, 9)),
    nameLedgerGenerator("name-bass-ledger-note", "nameBassLedgerNote", Clef.BASS),
    sameNoteOtherClef,
  ],
  "reading-accidentals": [nameAccidentalNote, measureRule, enharmonicOnStaff],
  "reading-key-signatures": [majorKeyOfSignature, minorKeyOfSignature, accidentalCount, noteInKey],
};
