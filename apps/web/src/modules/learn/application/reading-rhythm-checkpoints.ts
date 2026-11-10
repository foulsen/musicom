import {
  Duration,
  TICKS_PER_QUARTER,
  TRIPLET,
  TimeSignature,
  createPassage,
  measureTicks,
  note,
  passageAttacks,
  rest,
  type MusicEvent,
  type NoteValue,
  type Passage,
} from "@music-workspace/music-theory";

import type { LabelRef } from "@/modules/shared/application/music-terms";
import type { QuizOption } from "@/modules/shared/application/quiz";
import { randomChoice, sampleDistinct, shuffle } from "@/modules/shared/application/random";

import { explain, toOption, type CheckpointQuestion, type QuestionGenerator } from "./checkpoint-kit";

/**
 * Pools de perguntas das lições de leitura rítmica. Tudo é derivado do domínio de notação —
 * durações via `Duration.ticks`, compassos via `TimeSignature`, ataques via `passageAttacks` — e
 * as chaves de texto vivem em `learn.checkpoints.readingRhythm` / `learn.explanations.readingRhythm*`.
 */

const PREFIX = "learn.checkpoints.readingRhythm";

/** Figuras usadas nas perguntas, da mais longa à mais curta. */
type Figure = "whole" | "half" | "quarter" | "eighth" | "sixteenth";
const VALUES: readonly Figure[] = ["whole", "half", "quarter", "eighth", "sixteenth"];

/** Símbolo de cada figura na escrita compacta de ritmos (ver `events`). */
const TOKEN_BY_VALUE: Record<Figure, string> = { whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16" };

/** Alturas dos exemplos: o ritmo é o assunto, então a melodia é uma nota só, sorteada por pergunta. */
const PITCHES = ["G4", "B4", "D5"];

const BEAT_VALUE: Record<number, NoteValue> = { 1: "whole", 2: "half", 4: "quarter", 8: "eighth" };

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// Nomes para frases (minúsculos, no meio do texto) e rótulos de opção (iniciam a frase).
const valueLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.names.${value}` });
const pluralLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.names.${value}Plural` });
const restLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.names.${value}Rest` });
const dottedLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.names.dotted${capitalize(value)}` });
const valueOptionLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.options.${value}` });
const restOptionLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.options.${value}Rest` });
const dottedOptionLabel = (value: NoteValue): LabelRef => ({ key: `${PREFIX}.options.dotted${capitalize(value)}` });

const ticksOf = (value: NoteValue): number => Duration.of(value).ticks();

// ── Escrita compacta de ritmos ───────────────────────────────────────────────

const TOKEN_VALUE: Record<string, NoteValue> = { w: "whole", h: "half", q: "quarter", "8": "eighth", "16": "sixteenth" };
const TOKEN = /^(r)?(t)?(w|h|q|8|16)(\.)?(~)?$/;

/**
 * Converte "q 8 8 r8 t8 q.~" em eventos de uma altura só: `r` = pausa, `t` = quiáltera de tercina,
 * `.` = ponto de aumento, `~` = ligada à próxima nota.
 */
function events(spec: string, pitch: string): MusicEvent[] {
  return spec.split(/\s+/).map((token) => {
    const match = TOKEN.exec(token);
    if (!match) throw new Error(`Invalid rhythm token: "${token}"`);

    const [, isRest, isTriplet, value, dot, tie] = match;
    const duration = Duration.of(TOKEN_VALUE[value], dot ? 1 : 0, isTriplet ? TRIPLET : null);

    return isRest ? rest(duration) : note(pitch, duration, tie ? { tieToNext: true } : {});
  });
}

/** Uma pauta de `time` com um compasso por especificação. */
function staffOf(time: string, pitch: string, ...measures: string[]): Passage {
  return createPassage({ time }, measures.map((spec) => events(spec, pitch)));
}

function repeat(token: string, count: number): string {
  return Array<string>(count).fill(token).join(" ");
}

// ── Opções ───────────────────────────────────────────────────────────────────

/** A resposta certa + 3 distratores do `pool`, embaralhados. */
function choose(correct: QuizOption, pool: QuizOption[]): QuizOption[] {
  return shuffle([correct, ...sampleDistinct(pool, 3, (option) => option.id === correct.id)]);
}

/** Números vizinhos da resposta (erro de contagem de 1 ou 2 é o mais comum); `preferred` entram primeiro. */
function numberOptions(correct: number, preferred: number[] = []): QuizOption[] {
  const candidates = [...preferred, correct + 1, correct - 1, correct + 2, correct - 2, correct + 3];
  const distractors = [...new Set(candidates)].filter((value) => value >= 1 && value !== correct).slice(0, 3);

  return shuffle([correct, ...distractors].map((value) => toOption(String(value))));
}

function valueOptions(correct: NoteValue, values: readonly NoteValue[], label: (value: NoteValue) => LabelRef): QuizOption[] {
  return choose(
    toOption(correct, label(correct)),
    values.map((value) => toOption(value, label(value))),
  );
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);

  return `${numerator / divisor}/${denominator / divisor}`;
}

// ── Lição: figuras de valor ──────────────────────────────────────────────────

function valueNameQuestion(): CheckpointQuestion {
  const value = randomChoice(VALUES);

  return {
    id: "value-name",
    promptKey: `${PREFIX}.valueName`,
    options: valueOptions(value, VALUES, valueOptionLabel),
    correctId: value,
    explanation: explain("readingRhythmValueName", { value: valueLabel(value) }),
    staff: staffOf("4/4", randomChoice(PITCHES), TOKEN_BY_VALUE[value]),
  };
}

function restNameQuestion(): CheckpointQuestion {
  const value = randomChoice(VALUES);

  return {
    id: "rest-name",
    promptKey: `${PREFIX}.restName`,
    options: valueOptions(value, VALUES, restOptionLabel),
    correctId: value,
    explanation: explain("readingRhythmRestName", { value: restLabel(value) }),
    staff: staffOf("4/4", "B4", `r${TOKEN_BY_VALUE[value]}`),
  };
}

function howManyFitQuestion(): CheckpointQuestion {
  const pairs = VALUES.flatMap((big, index) => VALUES.slice(index + 1).map((small) => ({ big, small })));
  const { big, small } = randomChoice(pairs);
  const answer = ticksOf(big) / ticksOf(small);

  return {
    id: "how-many-fit",
    promptKey: `${PREFIX}.howManyFit`,
    promptParams: { small: pluralLabel(small), big: valueLabel(big) },
    options: choose(
      toOption(String(answer)),
      [2, 3, 4, 6, 8, 16].map((value) => toOption(String(value))),
    ),
    correctId: String(answer),
    explanation: explain("readingRhythmHowManyFit", { big: valueLabel(big), small: pluralLabel(small), answer }),
  };
}

export const NOTE_VALUES_GENERATORS: QuestionGenerator[] = [valueNameQuestion, howManyFitQuestion, restNameQuestion];

// ── Lição: fórmulas de compasso ──────────────────────────────────────────────

const SIMPLE_TIMES = ["2/4", "3/4", "4/4"];

function beatsPerMeasureQuestion(): CheckpointQuestion {
  const time = randomChoice(SIMPLE_TIMES);
  const beats = TimeSignature.parse(time).beats;

  return {
    id: "beats-per-measure",
    promptKey: `${PREFIX}.beatsPerMeasure`,
    options: numberOptions(beats, [beats === 4 ? 2 : 4]),
    correctId: String(beats),
    explanation: explain("readingRhythmBeatsPerMeasure", { time, answer: beats }),
    staff: staffOf(time, randomChoice(PITCHES), repeat("q", beats)),
  };
}

/** Compassos incompletos: o que já foi escrito e a figura única que falta para fechá-lo. */
const MISSING_CASES: { time: string; shown: string }[] = [
  { time: "2/4", shown: "q" },
  { time: "2/4", shown: "8 8" },
  { time: "3/4", shown: "q q" },
  { time: "3/4", shown: "q" },
  { time: "3/4", shown: "h" },
  { time: "3/4", shown: "q 8 8" },
  { time: "4/4", shown: "q q q" },
  { time: "4/4", shown: "q q" },
  { time: "4/4", shown: "h" },
  { time: "4/4", shown: "h q" },
  { time: "4/4", shown: "q h" },
  { time: "4/4", shown: "8 8 q q" },
  { time: "4/4", shown: "q q 8 8" },
  { time: "4/4", shown: "8 8 8 8 q" },
];

function missingValueQuestion(): CheckpointQuestion {
  const { time, shown } = randomChoice(MISSING_CASES);
  const pitch = randomChoice(PITCHES);
  const staff = staffOf(time, pitch, shown);
  const used = measureTicks(staff.measures[0]);
  const remaining = staff.time.measureTicks() - used;
  const missing = VALUES.find((value) => ticksOf(value) === remaining);
  if (!missing) throw new Error(`No single value completes ${time} after "${shown}"`);

  const eighth = ticksOf("eighth");

  return {
    id: "missing-value",
    promptKey: `${PREFIX}.missingValue`,
    options: valueOptions(missing, ["whole", "half", "quarter", "eighth"], valueOptionLabel),
    correctId: missing,
    explanation: explain("readingRhythmMissingValue", {
      time,
      total: staff.time.measureTicks() / eighth,
      used: used / eighth,
      missing: remaining / eighth,
      value: valueLabel(missing),
    }),
    staff,
  };
}

/** Fórmulas descritas por contagem de tempos + figura do tempo (a pauta sempre mostra o compasso, então não há pauta aqui). */
const DESCRIBED_TIMES = ["2/4", "3/4", "4/4", "2/2", "3/8", "3/2"];

function whichTimeSignatureQuestion(): CheckpointQuestion {
  const time = randomChoice(DESCRIBED_TIMES);
  const signature = TimeSignature.parse(time);

  return {
    id: "which-time-signature",
    promptKey: `${PREFIX}.whichTimeSignature`,
    promptParams: { beats: signature.beats, value: valueLabel(BEAT_VALUE[signature.beatValue]) },
    options: choose(
      toOption(time),
      DESCRIBED_TIMES.map((item) => toOption(item)),
    ),
    correctId: time,
    explanation: explain("readingRhythmWhichTimeSignature", { time, beats: signature.beats, value: valueLabel(BEAT_VALUE[signature.beatValue]) }),
  };
}

export const TIME_SIGNATURES_GENERATORS: QuestionGenerator[] = [
  beatsPerMeasureQuestion,
  missingValueQuestion,
  whichTimeSignatureQuestion,
];

// ── Lição: pontos e ligaduras ────────────────────────────────────────────────

/** Figura pontuada e a unidade em que a duração dela é contada (sempre um número inteiro). */
const DOTTED_CASES: { value: Figure; unit: NoteValue }[] = [
  { value: "half", unit: "quarter" },
  { value: "quarter", unit: "eighth" },
  { value: "eighth", unit: "sixteenth" },
  { value: "half", unit: "eighth" },
  { value: "quarter", unit: "sixteenth" },
];

function dottedValueQuestion(): CheckpointQuestion {
  const { value, unit } = randomChoice(DOTTED_CASES);
  const unitTicks = ticksOf(unit);
  const base = ticksOf(value) / unitTicks;
  const answer = Duration.of(value, 1).ticks() / unitTicks;

  return {
    id: "dotted-value",
    promptKey: `${PREFIX}.dottedValue`,
    promptParams: { value: valueLabel(value), unit: pluralLabel(unit) },
    options: numberOptions(answer, [base, base * 2]),
    correctId: String(answer),
    explanation: explain("readingRhythmDottedValue", {
      value: valueLabel(value),
      unit: pluralLabel(unit),
      base,
      half: base / 2,
      answer,
    }),
    staff: staffOf("4/4", randomChoice(PITCHES), `${TOKEN_BY_VALUE[value]}.`),
  };
}

/** Duas notas ligadas, o resto do(s) compasso(s) completo, e a unidade em que a soma é contada. */
const TIE_CASES: { first: NoteValue; second: NoteValue; unit: NoteValue; measures: string[] }[] = [
  { first: "half", second: "quarter", unit: "quarter", measures: ["h~ q rq"] },
  { first: "quarter", second: "quarter", unit: "quarter", measures: ["q~ q rh"] },
  { first: "half", second: "half", unit: "quarter", measures: ["q q h~", "h q q"] },
  { first: "quarter", second: "eighth", unit: "eighth", measures: ["q~ 8 8 q q"] },
  { first: "eighth", second: "eighth", unit: "eighth", measures: ["8~ 8 q h"] },
  { first: "half", second: "eighth", unit: "eighth", measures: ["h~ 8 r8 q"] },
];

function tiedDurationQuestion(): CheckpointQuestion {
  const { first, second, unit, measures } = randomChoice(TIE_CASES);
  const staff = staffOf("4/4", randomChoice(PITCHES), ...measures);
  const tied = passageAttacks(staff).find((attack) => attack.event.tieToNext);
  if (!tied) throw new Error("Tie case without a tied note");

  const unitTicks = ticksOf(unit);
  const answer = tied.durationTicks / unitTicks;

  return {
    id: "tied-duration",
    promptKey: `${PREFIX}.tiedDuration`,
    promptParams: { unit: pluralLabel(unit) },
    options: numberOptions(answer, [ticksOf(first) / unitTicks, ticksOf(second) / unitTicks]),
    correctId: String(answer),
    explanation: explain("readingRhythmTiedDuration", {
      first: ticksOf(first) / unitTicks,
      second: ticksOf(second) / unitTicks,
      unit: pluralLabel(unit),
      answer,
    }),
    staff,
  };
}

/** Ritmos com ligaduras: o número de notas realmente tocadas é menor que o de notas escritas. */
const TIED_RHYTHMS = [
  ["q~ q h"],
  ["h~ q q"],
  ["q q~ q q"],
  ["8 8 q~ q q"],
  ["q~ q q~ q"],
  ["8~ 8 q h"],
  ["q q h~", "h q q"],
  ["q~ 8 8 q q"],
];

/** Notas que soam no passage (pausas e continuações de ligadura não contam) × figuras escritas, ambas do domínio. */
function attackCounts(passage: Passage): { attacks: number; written: number } {
  const written = passage.measures.reduce((total, measure) => total + measure.events.length, 0);

  return { attacks: passageAttacks(passage).length, written };
}

function attackQuestion(id: string, promptName: string, staff: Passage): CheckpointQuestion {
  const { attacks, written } = attackCounts(staff);

  return {
    id,
    promptKey: `${PREFIX}.${promptName}`,
    options: numberOptions(attacks, [written]),
    correctId: String(attacks),
    explanation: explain("readingRhythmAttackCount", { count: attacks, written }),
    staff,
  };
}

function attackCountQuestion(): CheckpointQuestion {
  return attackQuestion("attack-count", "attackCount", staffOf("4/4", randomChoice(PITCHES), ...randomChoice(TIED_RHYTHMS)));
}

export const DOTS_TIES_GENERATORS: QuestionGenerator[] = [dottedValueQuestion, tiedDurationQuestion, attackCountQuestion];

// ── Lição: síncope ───────────────────────────────────────────────────────────

/** Células de um tempo de semínima; as com pausa servem à contagem de ataques. */
const BEAT_CELLS = {
  plain: ["q", "8 8"],
  withRest: ["rq", "r8 8", "8 r8"],
};

function attackCountRestsQuestion(): CheckpointQuestion {
  const pitch = randomChoice(PITCHES);
  const anyCell = [...BEAT_CELLS.plain, ...BEAT_CELLS.withRest];
  let staff: Passage;

  // sorteia até haver ao menos uma pausa (garantida) e duas notas soando
  do {
    const cells = [randomChoice(BEAT_CELLS.withRest), ...Array.from({ length: 3 }, () => randomChoice(anyCell))];
    staff = staffOf("4/4", pitch, shuffle(cells).join(" "));
  } while (passageAttacks(staff).length < 2);

  return attackQuestion("attack-count-rests", "attackCountRests", staff);
}

const SYNCOPATED_RHYTHMS = ["8 q 8 q q", "q 8 q 8 q", "8 q 8 h", "q q 8 q 8", "8 q q q 8"];
const STEADY_RHYTHMS = ["q q q q", "8 8 q h", "q 8 8 q q", "h q q", "q. 8 q q", "8 8 8 8 h", "q q h", "8 8 q q q"];

/**
 * Síncope: alguma nota começa fora do pulso e dura além do próximo pulso, então o acento muda de lugar.
 * Notas que começam e terminam entre pulsos (colcheias em par) não contam.
 */
function isSyncopated(passage: Passage): boolean {
  const pulse = passage.time.pulseTicks();

  return passageAttacks(passage).some((attack) => {
    if (attack.tick % pulse === 0) return false;
    const nextPulse = Math.ceil(attack.tick / pulse) * pulse;

    return attack.tick + attack.durationTicks > nextPulse;
  });
}

function isSyncopatedQuestion(): CheckpointQuestion {
  const staff = staffOf("4/4", randomChoice(PITCHES), randomChoice(Math.random() < 0.5 ? SYNCOPATED_RHYTHMS : STEADY_RHYTHMS));
  const syncopated = isSyncopated(staff);

  return {
    id: "is-syncopated",
    promptKey: `${PREFIX}.isSyncopated`,
    options: [toOption("yes", { key: `${PREFIX}.options.yes` }), toOption("no", { key: `${PREFIX}.options.no` })],
    correctId: syncopated ? "yes" : "no",
    explanation: explain(syncopated ? "readingRhythmSyncopatedYes" : "readingRhythmSyncopatedNo"),
    staff,
  };
}

/** Em que posição de colcheia (em ticks) cada contagem de 4/4 cai: "1", "1 e", "2", "2 e"… */
const COUNT_POSITIONS = Array.from({ length: 8 }, (_, index) => index * (TICKS_PER_QUARTER / 2));

function countLabel(tick: number): string | LabelRef {
  const beat = Math.floor(tick / TICKS_PER_QUARTER) + 1;

  return tick % TICKS_PER_QUARTER === 0 ? String(beat) : { key: `${PREFIX}.options.countAnd`, params: { n: beat } };
}

const COUNT_RHYTHMS = ["q q q 8 8", "8 q 8 q q", "q q 8 q 8", "q 8 q 8 q", "h q 8 8", "q 8 8 q q", "r8 8 q q q", "q q r8 8 q"];

function countOfNoteQuestion(): CheckpointQuestion {
  const staff = staffOf("4/4", randomChoice(PITCHES), randomChoice(COUNT_RHYTHMS));
  const attacks = passageAttacks(staff);
  const which = randomChoice(["secondNote", "lastNote"] as const);
  const target = which === "secondNote" ? attacks[1] : attacks[attacks.length - 1];
  const whichLabel: LabelRef = { key: `${PREFIX}.options.${which}` };

  return {
    id: "count-of-note",
    promptKey: `${PREFIX}.countOfNote`,
    promptParams: { which: whichLabel },
    options: choose(
      toOption(String(target.tick), countLabel(target.tick)),
      COUNT_POSITIONS.map((tick) => toOption(String(tick), countLabel(tick))),
    ),
    correctId: String(target.tick),
    explanation: explain("readingRhythmCountOfNote", { which: whichLabel, count: countLabel(target.tick) }),
    staff,
  };
}

export const SYNCOPATION_GENERATORS: QuestionGenerator[] = [attackCountRestsQuestion, isSyncopatedQuestion, countOfNoteQuestion];

// ── Lição: compasso composto ─────────────────────────────────────────────────

const COMPOUND_TIMES = ["6/8", "9/8", "12/8"];
const ALL_METER_TIMES = [...SIMPLE_TIMES, ...COMPOUND_TIMES];

/** Um compasso cheio de pulsos: semínimas no simples, semínimas pontuadas no composto. */
function pulseStaff(time: string, pitch: string): Passage {
  const signature = TimeSignature.parse(time);

  return staffOf(time, pitch, repeat(signature.isCompound() ? "q." : "q", signature.pulsesPerMeasure()));
}

function pulsesInMeterQuestion(): CheckpointQuestion {
  const time = randomChoice(COMPOUND_TIMES);
  const signature = TimeSignature.parse(time);
  const pulses = signature.pulsesPerMeasure();

  return {
    id: "pulses-in-meter",
    promptKey: `${PREFIX}.pulsesInMeter`,
    promptParams: { time },
    options: numberOptions(pulses, [signature.beats]),
    correctId: String(pulses),
    explanation: explain("readingRhythmPulsesInMeter", { time, answer: pulses, top: signature.beats }),
    staff: pulseStaff(time, randomChoice(PITCHES)),
  };
}

function simpleOrCompoundQuestion(): CheckpointQuestion {
  const time = randomChoice(ALL_METER_TIMES);
  const signature = TimeSignature.parse(time);
  const compound = signature.isCompound();

  return {
    id: "simple-or-compound",
    promptKey: `${PREFIX}.simpleOrCompound`,
    promptParams: { time },
    options: [toOption("simple", { key: `${PREFIX}.options.simple` }), toOption("compound", { key: `${PREFIX}.options.compound` })],
    correctId: compound ? "compound" : "simple",
    explanation: explain(compound ? "readingRhythmCompoundMeter" : "readingRhythmSimpleMeter", { time, top: signature.beats }),
    staff: pulseStaff(time, randomChoice(PITCHES)),
  };
}

/** Figuras que podem ser o pulso de um compasso, por duração em ticks. */
const PULSE_LABELS: Record<number, LabelRef> = {
  [ticksOf("half")]: valueLabel("half"),
  [ticksOf("quarter")]: valueLabel("quarter"),
  [ticksOf("quarter") * 1.5]: dottedLabel("quarter"),
  [ticksOf("eighth")]: valueLabel("eighth"),
};
const PULSE_OPTION_LABELS: Record<number, LabelRef> = {
  [ticksOf("half")]: valueOptionLabel("half"),
  [ticksOf("quarter")]: valueOptionLabel("quarter"),
  [ticksOf("quarter") * 1.5]: dottedOptionLabel("quarter"),
  [ticksOf("eighth")]: valueOptionLabel("eighth"),
};
const PULSE_TIMES = [...ALL_METER_TIMES, "2/2"];

function pulseValueQuestion(): CheckpointQuestion {
  const time = randomChoice(PULSE_TIMES);
  const signature = TimeSignature.parse(time);
  const pulse = signature.pulseTicks();

  return {
    id: "pulse-value",
    promptKey: `${PREFIX}.pulseValue`,
    promptParams: { time },
    options: choose(
      toOption(String(pulse), PULSE_OPTION_LABELS[pulse]),
      Object.entries(PULSE_OPTION_LABELS).map(([ticks, label]) => toOption(ticks, label)),
    ),
    correctId: String(pulse),
    explanation: explain("readingRhythmPulseValue", { time, value: PULSE_LABELS[pulse], pulses: signature.pulsesPerMeasure() }),
  };
}

export const COMPOUND_METER_GENERATORS: QuestionGenerator[] = [pulsesInMeterQuestion, simpleOrCompoundQuestion, pulseValueQuestion];

// ── Lição: quiálteras ────────────────────────────────────────────────────────

function tripletCountQuestion(): CheckpointQuestion {
  const beats = Array.from({ length: 4 }, () => "q");
  beats[Math.floor(Math.random() * beats.length)] = "t8 t8 t8";
  const answer = TRIPLET.actual;

  return {
    id: "triplet-count",
    promptKey: `${PREFIX}.tripletCount`,
    options: numberOptions(answer, [TRIPLET.normal, 4, 6]),
    correctId: String(answer),
    explanation: explain("readingRhythmTripletCount", { answer, normal: TRIPLET.normal }),
    staff: staffOf("4/4", randomChoice(PITCHES), beats.join(" ")),
  };
}

const TRIPLET_BEAT_CELLS = ["q", "rq", "8 8", "r8 8"];

function tripletAttackCountQuestion(): CheckpointQuestion {
  const cells = shuffle(["t8 t8 t8", ...Array.from({ length: 3 }, () => randomChoice(TRIPLET_BEAT_CELLS))]);

  return attackQuestion("triplet-attack-count", "tripletAttackCount", staffOf("4/4", randomChoice(PITCHES), cells.join(" ")));
}

/** Tercina de colcheias (3 num tempo) ou de semínimas (3 em dois tempos). */
const TRIPLET_FRACTION_CASES: { value: NoteValue; rhythm: string }[] = [
  { value: "eighth", rhythm: "t8 t8 t8 q h" },
  { value: "eighth", rhythm: "q t8 t8 t8 h" },
  { value: "quarter", rhythm: "tq tq tq h" },
  { value: "quarter", rhythm: "h tq tq tq" },
];

function tripletFractionQuestion(): CheckpointQuestion {
  const { value, rhythm } = randomChoice(TRIPLET_FRACTION_CASES);
  const ticks = Duration.of(value, 0, TRIPLET).ticks();
  const answer = fraction(ticks, TICKS_PER_QUARTER);

  return {
    id: "triplet-fraction",
    promptKey: `${PREFIX}.tripletFraction`,
    promptParams: { value: pluralLabel(value) },
    options: choose(
      toOption(answer),
      ["1/2", "1/3", "1/4", "2/3", "1/6"].map((item) => toOption(item)),
    ),
    correctId: answer,
    explanation: explain("readingRhythmTripletFraction", {
      value: pluralLabel(value),
      answer,
    }),
    staff: staffOf("4/4", randomChoice(PITCHES), rhythm),
  };
}

export const TUPLETS_GENERATORS: QuestionGenerator[] = [tripletCountQuestion, tripletAttackCountQuestion, tripletFractionQuestion];

export const READING_RHYTHM_GENERATORS: Record<
  | "reading-note-values"
  | "reading-time-signatures"
  | "reading-dots-ties"
  | "reading-syncopation"
  | "reading-compound-meter"
  | "reading-tuplets",
  QuestionGenerator[]
> = {
  "reading-note-values": NOTE_VALUES_GENERATORS,
  "reading-time-signatures": TIME_SIGNATURES_GENERATORS,
  "reading-dots-ties": DOTS_TIES_GENERATORS,
  "reading-syncopation": SYNCOPATION_GENERATORS,
  "reading-compound-meter": COMPOUND_METER_GENERATORS,
  "reading-tuplets": TUPLETS_GENERATORS,
};
