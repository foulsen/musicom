import {
  Clef,
  Duration,
  KeySignature,
  MAJOR_SCALE_PATTERN,
  SpelledNote,
  SpelledPitch,
  createPassage,
  createScale,
  note,
  passageAttacks,
  rest,
  type Articulation,
  type ClefName,
  type Dynamic,
  type MusicEvent,
  type Passage,
} from "@music-workspace/music-theory";

import type { LabelRef } from "@/modules/shared/application/music-terms";
import { randomChoice, randomInt, sampleDistinct, shuffle } from "@/modules/shared/application/random";

import { explain, toOption, type CheckpointQuestion, type QuestionGenerator } from "./checkpoint-kit";

/**
 * Pools de perguntas das lições avançadas de leitura (acordes na pauta, expressão, claves de dó e
 * leitura à primeira vista). Respostas vêm do domínio — `Clef`, `KeySignature`, `passageAttacks`,
 * `createScale(...).triads()` — e os textos vivem em `learn.checkpoints.readingAdvanced.*`.
 */

const PROMPT = "learn.checkpoints.readingAdvanced";
const OPTIONS = `${PROMPT}.options`;

const WHOLE = Duration.of("whole");
const HALF = Duration.of("half");
const QUARTER = Duration.of("quarter");
const EIGHTH = Duration.of("eighth");
const DOTTED_QUARTER = Duration.of("quarter", 1);

/** Rótulo traduzível de uma opção estática (`learn.checkpoints.readingAdvanced.options.<path>`). */
function optionRef(path: string): LabelRef {
  return { key: `${OPTIONS}.${path}` };
}

function promptKey(name: string): string {
  return `${PROMPT}.${name}`;
}

// ── Helpers de pauta ─────────────────────────────────────────────────────────

/** Nota na posição da pauta com o acidente que a armadura impõe àquela letra. */
function keyedPitch(clef: Clef, key: KeySignature, position: number): SpelledPitch {
  const letter = clef.pitchAt(position).spelled.letter;

  return clef.pitchAt(position, key.accidentalFor(letter));
}

function singleChordPassage(clefName: ClefName, key: KeySignature, pitches: SpelledPitch[]): Passage {
  return createPassage({ clef: clefName, fifths: key.fifths }, [
    [note(pitches.map((pitch) => pitch.toString()), WHOLE)],
  ]);
}

function singleNotePassage(clefName: ClefName, pitch: SpelledPitch, extras?: Parameters<typeof note>[2]): Passage {
  return createPassage({ clef: clefName }, [[note(pitch.toString(), WHOLE, extras)]]);
}

function letterIndex(pitch: SpelledPitch): number {
  return SpelledPitch.of(pitch.spelled.letter, 0, 0).diatonicIndex();
}

const BASIC_CLEFS: ClefName[] = ["treble", "bass"];

// ── Acordes na pauta ─────────────────────────────────────────────────────────

const INTERVAL_NUMBERS = [2, 3, 4, 5, 6, 7, 8];

function intervalOnStaffQuestion(): CheckpointQuestion {
  const clefName = randomChoice(BASIC_CLEFS);
  const clef = Clef.from(clefName);
  const distance = 1 + randomInt(7); // posições de diferença: 1 (2ª) … 7 (oitava)
  const lowPosition = randomInt(9 - distance); // as duas notas ficam dentro da pauta
  const number = distance + 1;

  const low = clef.pitchAt(lowPosition);
  const high = clef.pitchAt(lowPosition + distance);
  const path = Array.from({ length: number }, (_, step) => clef.pitchAt(lowPosition + step).spelled.letter).join(" → ");

  // distratores: os números mais próximos (errar a contagem por 1 ou 2 é o engano típico)
  const nearest = INTERVAL_NUMBERS.filter((value) => value !== number)
    .sort((a, b) => Math.abs(a - number) - Math.abs(b - number) || a - b)
    .slice(0, 4);
  const options = [number, ...sampleDistinct(nearest, 3, () => false)]
    .sort((a, b) => a - b)
    .map((value) => toOption(String(value), optionRef(`interval.n${value}`)));

  return {
    id: "interval-on-staff",
    promptKey: promptKey("intervalOnStaff"),
    options,
    correctId: String(number),
    staff: createPassage({ clef: clefName }, [[note([low.toString(), high.toString()], WHOLE)]]),
    explanation: explain("readingIntervalOnStaff", {
      path,
      size: number,
      interval: optionRef(`interval.n${number}`),
    }),
  };
}

interface KeyTriad {
  key: KeySignature;
  clefName: ClefName;
  pitches: SpelledPitch[];
  degree: number;
  name: string;
}

/** Tríade diatônica em posição fundamental, sobre três linhas ou três espaços, num tom maior sorteado. */
function randomKeyTriad(fifthsRange: number): KeyTriad {
  const key = new KeySignature(randomInt(fifthsRange * 2 + 1) - fifthsRange);
  const clefName = randomChoice(BASIC_CLEFS);
  const clef = Clef.from(clefName);

  const rootPosition = randomInt(5); // a quinta fica até a posição 8 (linha superior)
  const pitches = [0, 2, 4].map((step) => keyedPitch(clef, key, rootPosition + step));

  const tonic = key.majorTonic();
  const tonicIndex = SpelledPitch.of(tonic.letter, 0, 0).diatonicIndex();
  const degree = ((((letterIndex(pitches[0]) - tonicIndex) % 7) + 7) % 7) + 1;

  // a qualidade vem das tríades da escala maior do tom; a grafia da raiz, da própria pauta
  const quality = createScale(tonic.note(), MAJOR_SCALE_PATTERN).triads()[degree - 1].quality.symbol;

  return { key, clefName, pitches, degree, name: `${pitches[0].spelled}${quality}` };
}

/** Todas as tríades diatônicas do tom, com a grafia das raízes derivada da armadura. */
function diatonicTriadNames(key: KeySignature): string[] {
  const tonic = key.majorTonic();
  const triads = createScale(tonic.note(), MAJOR_SCALE_PATTERN).triads();
  const tonicIndex = SpelledPitch.of(tonic.letter, 0, 0).diatonicIndex();

  return triads.map((chord, index) => {
    const letter = SpelledPitch.fromDiatonicIndex(tonicIndex + index).spelled.letter;

    return `${new SpelledNote(letter, key.accidentalFor(letter))}${chord.quality.symbol}`;
  });
}

function triadNameQuestion(): CheckpointQuestion {
  const triad = randomKeyTriad(2);
  const names = diatonicTriadNames(triad.key);

  const options = shuffle([triad.name, ...sampleDistinct(names, 3, (name) => name === triad.name)].map((name) => toOption(name)));

  return {
    id: "triad-name",
    promptKey: promptKey("triadName"),
    options,
    correctId: triad.name,
    staff: singleChordPassage(triad.clefName, triad.key, triad.pitches),
    explanation: explain("readingTriadName", {
      key: triad.key.majorTonic().toString(),
      degree: triad.degree,
      notes: triad.pitches.map((pitch) => pitch.spelled.toString()).join(" "),
      chord: triad.name,
    }),
  };
}

function rootOfTriadQuestion(): CheckpointQuestion {
  const triad = randomKeyTriad(3);
  const clef = Clef.from(triad.clefName);
  const [root, third, fifth] = triad.pitches.map((pitch) => pitch.spelled.toString());

  // o 4º candidato é a nota da escala logo acima da raiz — fora do acorde
  const outsider = keyedPitch(clef, triad.key, clef.staffPosition(triad.pitches[0]) + 1).spelled.toString();
  const options = shuffle([root, third, fifth, outsider].map((name) => toOption(name)));

  return {
    id: "root-of-triad",
    promptKey: promptKey("rootOfTriad"),
    options,
    correctId: root,
    staff: singleChordPassage(triad.clefName, triad.key, triad.pitches),
    explanation: explain("readingRootOfTriad", { root, third, fifth }),
  };
}

// ── Expressão ────────────────────────────────────────────────────────────────

const DYNAMICS: Dynamic[] = ["pp", "p", "mp", "mf", "f", "ff"];
const ARTICULATIONS: Articulation[] = ["staccato", "accent", "tenuto", "marcato", "fermata"];
const EXPRESSION_PITCHES = ["G4", "B4", "C5", "D5", "E5"];

function dynamicMeaningQuestion(): CheckpointQuestion {
  const dynamic = randomChoice(DYNAMICS);
  const pitch = SpelledPitch.parse(randomChoice(EXPRESSION_PITCHES));

  const options = shuffle([dynamic, ...sampleDistinct(DYNAMICS, 3, (item) => item === dynamic)]).map((item) =>
    toOption(item, optionRef(`dynamic.${item}`)),
  );

  return {
    id: "dynamic-meaning",
    promptKey: promptKey("dynamicMeaning"),
    promptParams: { dynamic },
    options,
    correctId: dynamic,
    staff: singleNotePassage("treble", pitch, { dynamic }),
    explanation: explain("readingDynamic", { dynamic, meaning: optionRef(`dynamic.${dynamic}`) }),
  };
}

function articulationNameQuestion(): CheckpointQuestion {
  const articulation = randomChoice(ARTICULATIONS);
  const pitch = randomChoice(EXPRESSION_PITCHES);

  // fermata vale uma nota longa; as demais marcam quatro semínimas iguais
  const events: MusicEvent[] =
    articulation === "fermata"
      ? [note(pitch, WHOLE, { articulations: [articulation] })]
      : Array.from({ length: 4 }, () => note(pitch, QUARTER, { articulations: [articulation] }));

  const options = shuffle([articulation, ...sampleDistinct(ARTICULATIONS, 3, (item) => item === articulation)]).map((item) =>
    toOption(item, optionRef(`articulation.${item}`)),
  );

  return {
    id: "articulation-name",
    promptKey: promptKey("articulationName"),
    promptParams: { articulation },
    options,
    correctId: articulation,
    staff: createPassage({}, [events]),
    explanation: explain("readingArticulation", {
      name: optionRef(`articulation.${articulation}`),
      meaning: optionRef(`articulationMeaning.${articulation}`),
    }),
  };
}

interface TempoTerm {
  term: string;
  /** Faixa mostrada na explicação (convenção de metrônomo). */
  from: number;
  to: number;
  /** Faixa sorteada: bem dentro do termo, longe das fronteiras ambíguas. */
  pick: [number, number];
}

const TEMPO_TERMS: TempoTerm[] = [
  { term: "Largo", from: 40, to: 60, pick: [44, 58] },
  { term: "Adagio", from: 66, to: 76, pick: [68, 74] },
  { term: "Andante", from: 76, to: 108, pick: [82, 102] },
  { term: "Moderato", from: 108, to: 120, pick: [110, 118] },
  { term: "Allegro", from: 120, to: 156, pick: [126, 150] },
  { term: "Presto", from: 168, to: 200, pick: [172, 196] },
];

function tempoTermQuestion(): CheckpointQuestion {
  const tempo = randomChoice(TEMPO_TERMS);
  const bpm = tempo.pick[0] + randomInt(tempo.pick[1] - tempo.pick[0] + 1);

  const chosen = [tempo, ...sampleDistinct(TEMPO_TERMS, 3, (item) => item.term === tempo.term)];
  const options = TEMPO_TERMS.filter((item) => chosen.includes(item)).map((item) => toOption(item.term));

  return {
    id: "tempo-term",
    promptKey: promptKey("tempoTerm"),
    promptParams: { bpm },
    options,
    correctId: tempo.term,
    explanation: explain("readingTempo", { bpm, term: tempo.term, from: tempo.from, to: tempo.to }),
  };
}

// ── Claves de dó ─────────────────────────────────────────────────────────────

const MIDDLE_C = SpelledPitch.parse("C4");

/** Letras das notas entre duas posições da pauta (inclusive), na ordem em que são contadas. */
function lettersBetween(clef: Clef, fromPosition: number, toPosition: number): string {
  const step = fromPosition <= toPosition ? 1 : -1;
  const count = Math.abs(toPosition - fromPosition) + 1;

  return Array.from({ length: count }, (_, index) => clef.pitchAt(fromPosition + step * index).spelled.letter).join(" → ");
}

function cClefNoteQuestion(clefName: "alto" | "tenor"): CheckpointQuestion {
  const clef = Clef.from(clefName);
  const position = randomInt(9);
  const pitch = clef.pitchAt(position);
  const letter = pitch.spelled.letter;

  // distratores: as letras das posições vizinhas (contar a partir da linha errada é o engano típico)
  const neighbours = [-2, -1, 1, 2].map((offset) => clef.pitchAt(position + offset).spelled.letter);
  const options = shuffle([letter, ...sampleDistinct(neighbours, 3, () => false)].map((name) => toOption(name)));

  const middleCPosition = clef.staffPosition(MIDDLE_C);

  return {
    id: clefName === "alto" ? "alto-note" : "tenor-note",
    promptKey: promptKey(clefName === "alto" ? "nameAltoNote" : "nameTenorNote"),
    options,
    correctId: letter,
    staff: singleNotePassage(clefName, pitch),
    explanation: explain(clefName === "alto" ? "readingAltoNote" : "readingTenorNote", {
      path: lettersBetween(clef, middleCPosition, position),
      note: letter,
    }),
  };
}

const nameAltoNoteQuestion = (): CheckpointQuestion => cClefNoteQuestion("alto");
const nameTenorNoteQuestion = (): CheckpointQuestion => cClefNoteQuestion("tenor");

const CLEF_NAMES: ClefName[] = ["treble", "bass", "alto", "tenor"];

/** Onde o dó central cai na pauta: linha N (1 = inferior) ou a 1ª linha suplementar abaixo/acima. */
function placementOf(clef: Clef): string {
  const position = clef.staffPosition(MIDDLE_C);

  if (position < 0) return "ledgerBelow";
  if (position > 8) return "ledgerAbove";

  return `line${position / 2 + 1}`;
}

const PLACEMENTS = ["ledgerBelow", "ledgerAbove", "line2", "line3", "line4"];

function middleCLineQuestion(): CheckpointQuestion {
  const clefName = randomChoice(CLEF_NAMES);
  const clef = Clef.from(clefName);
  const placement = placementOf(clef);

  const options = shuffle([placement, ...sampleDistinct(PLACEMENTS, 3, (item) => item === placement)]).map((item) =>
    toOption(item, optionRef(`placement.${item}`)),
  );

  return {
    id: "middle-c-line",
    promptKey: promptKey("middleCLine"),
    promptParams: { clef: optionRef(`clef.${clefName}`) },
    options,
    correctId: placement,
    explanation: explain("readingMiddleC", {
      clef: optionRef(`clef.${clefName}`),
      bottom: clef.bottomLine().toString(),
      path: lettersBetween(clef, 0, clef.staffPosition(MIDDLE_C)),
      placement: optionRef(`placement.${placement}`),
    }),
  };
}

// ── Leitura à primeira vista ─────────────────────────────────────────────────

type MeterId = "2/4" | "3/4" | "4/4" | "6/8";

const METERS: MeterId[] = ["2/4", "3/4", "4/4", "6/8"];

/** Valores de um compasso inteiro (um evento por pulso ou por tempo). */
const METER_PULSES: Record<MeterId, Duration[]> = {
  "2/4": [QUARTER, QUARTER],
  "3/4": [QUARTER, QUARTER, QUARTER],
  "4/4": [QUARTER, QUARTER, QUARTER, QUARTER],
  "6/8": [DOTTED_QUARTER, DOTTED_QUARTER],
};

const STAFF_TOP = 8;

/** Melodia em passos curtos (±2 posições) dentro da pauta, com a armadura aplicada. */
function randomMelody(clef: Clef, key: KeySignature, time: MeterId, startPosition: number, measures: number): MusicEvent[][] {
  let position = startPosition;
  let first = true;

  return Array.from({ length: measures }, () =>
    METER_PULSES[time].map((duration) => {
      if (!first) position = Math.min(STAFF_TOP, Math.max(0, position + randomInt(5) - 2));
      first = false;

      return note(keyedPitch(clef, key, position).toString(), duration);
    }),
  );
}

function accidentalsLabel(key: KeySignature): string | LabelRef {
  return key.fifths === 0 ? optionRef("noAccidentals") : key.accidentals().map(String).join(" ");
}

function keyAndMeterQuestion(): CheckpointQuestion {
  const fifths = randomInt(7) - 3;
  const key = new KeySignature(fifths);
  const time = randomChoice(METERS);
  const clefName = randomChoice(BASIC_CLEFS);
  const clef = Clef.from(clefName);

  const melody = randomMelody(clef, key, time, randomInt(7), 2);

  const combos = [-2, -1, 0, 1, 2]
    .map((delta) => fifths + delta)
    .filter((value) => value >= -3 && value <= 3)
    .flatMap((value) => METERS.map((meter) => ({ fifths: value, time: meter })))
    .filter((combo) => !(combo.fifths === fifths && combo.time === time));

  // um distrator só com o tom errado, um só com a fórmula errada e um com os dois errados
  const distractors = [
    randomChoice(combos.filter((combo) => combo.time === time)),
    randomChoice(combos.filter((combo) => combo.fifths === fifths)),
    randomChoice(combos.filter((combo) => combo.time !== time && combo.fifths !== fifths)),
  ];

  const idOf = (combo: { fifths: number; time: string }) => `${combo.fifths}|${combo.time}`;
  const labelOf = (combo: { fifths: number; time: string }): LabelRef => ({
    key: `${OPTIONS}.keyTime`,
    params: { key: new KeySignature(combo.fifths).majorTonic().toString(), time: combo.time },
  });

  const correct = { fifths, time };
  const options = shuffle([correct, ...distractors].map((combo) => toOption(idOf(combo), labelOf(combo))));

  return {
    id: "key-and-meter",
    promptKey: promptKey("keyAndMeter"),
    options,
    correctId: idOf(correct),
    staff: createPassage({ clef: clefName, fifths, time }, melody),
    explanation: explain("readingKeyAndMeter", {
      accidentals: accidentalsLabel(key),
      key: key.majorTonic().toString(),
      time,
    }),
  };
}

function firstNoteNameQuestion(): CheckpointQuestion {
  const key = new KeySignature(randomInt(7) - 3);
  const clefName = randomChoice(BASIC_CLEFS);
  const clef = Clef.from(clefName);
  const time = randomChoice(METERS);

  // na maior parte das vezes a primeira nota é uma das que a armadura altera — é o que o exercício testa
  const altered = Array.from({ length: 9 }, (_, position) => position).filter(
    (position) => key.accidentalFor(clef.pitchAt(position).spelled.letter) !== 0,
  );
  const position = altered.length > 0 && Math.random() < 0.75 ? randomChoice(altered) : randomInt(9);

  const first = keyedPitch(clef, key, position);
  const letter = first.spelled.letter;
  const answer = first.spelled.toString();

  // distratores: a letra sem a armadura (esquecer a armadura) e as notas das posições vizinhas
  const candidates = [letter, ...[-2, -1, 1, 2].map((offset) => keyedPitch(clef, key, position + offset).spelled.toString())];
  const distinct = [...new Set(candidates)].filter((name) => name !== answer);
  const forgotKey: string[] = distinct.includes(letter) ? [letter] : [];
  const others = distinct.filter((name) => !forgotKey.includes(name));
  const wrong = [...forgotKey, ...sampleDistinct(others, 3 - forgotKey.length, () => false)];
  const options = shuffle([answer, ...wrong].map((name) => toOption(name)));

  const melody = randomMelody(clef, key, time, position, 2);

  return {
    id: "first-note-name",
    promptKey: promptKey("firstNoteName"),
    options,
    correctId: answer,
    staff: createPassage({ clef: clefName, fifths: key.fifths, time }, melody),
    explanation: explain(answer === letter ? "readingFirstNote" : "readingFirstNoteAltered", {
      clef: optionRef(`clef.${clefName}`),
      letter,
      note: answer,
      accidentals: accidentalsLabel(key),
    }),
  };
}

/** Compasso preenchido com semínimas, pares de colcheias, mínimas e pausas de semínima. */
function randomRhythmMeasure(beats: number, pitches: string[]): MusicEvent[] {
  const events: MusicEvent[] = [];
  const pitch = () => randomChoice(pitches);
  let remaining = beats;

  while (remaining > 0) {
    const kinds = ["quarter", "quarter", "eighths", "eighths"];
    if (remaining >= 2) kinds.push("half");
    if (remaining >= 2) kinds.push("rest");
    const kind = randomChoice(kinds);

    if (kind === "half") {
      events.push(note(pitch(), HALF));
      remaining -= 2;
    } else if (kind === "eighths") {
      events.push(note(pitch(), EIGHTH), note(pitch(), EIGHTH));
      remaining -= 1;
    } else if (kind === "rest") {
      events.push(rest(QUARTER));
      remaining -= 1;
    } else {
      events.push(note(pitch(), QUARTER));
      remaining -= 1;
    }
  }

  return events;
}

const RHYTHM_PITCHES = ["E4", "G4", "A4", "B4", "C5", "D5"];

/** Dois compassos com exatamente uma ligadura entre notas de mesma altura (a 2ª recebe a altura da 1ª). */
function randomTiedPassage(): { passage: Passage; noteheads: number } {
  for (let attempt = 0; attempt < 30; attempt++) {
    const beats = randomChoice([3, 4]);
    const measures = [randomRhythmMeasure(beats, RHYTHM_PITCHES), randomRhythmMeasure(beats, RHYTHM_PITCHES)];

    const slots = measures.flatMap((events, measureIndex) => events.map((_, eventIndex) => ({ measureIndex, eventIndex })));
    const candidates = slots.slice(0, -1).filter((slot, index) => {
      const current = measures[slot.measureIndex][slot.eventIndex];
      const following = slots[index + 1];

      return current.kind === "note" && measures[following.measureIndex][following.eventIndex].kind === "note";
    });
    if (candidates.length === 0) continue;

    const chosen = randomChoice(candidates);
    const next = slots[slots.indexOf(chosen) + 1];
    const current = measures[chosen.measureIndex][chosen.eventIndex];
    const following = measures[next.measureIndex][next.eventIndex];
    if (current.kind !== "note" || following.kind !== "note") continue;

    measures[chosen.measureIndex][chosen.eventIndex] = { ...current, tieToNext: true };
    measures[next.measureIndex][next.eventIndex] = { ...following, pitches: current.pitches };

    return {
      passage: createPassage({ time: beats === 3 ? "3/4" : "4/4" }, measures),
      noteheads: measures.flat().filter((event) => event.kind === "note").length,
    };
  }

  throw new Error("could not build a rhythm passage with a tie");
}

function attackCountQuestion(): CheckpointQuestion {
  const { passage, noteheads } = randomTiedPassage();
  const attacks = passageAttacks(passage).length;

  // distratores: contar cabeças de nota (esquecer a ligadura) e erros de ±1
  const others = [...new Set([attacks - 1, attacks + 1, attacks + 2, attacks + 3, noteheads + 1])].filter(
    (value) => value > 0 && value !== attacks && value !== noteheads,
  );
  const wrong = [noteheads, ...sampleDistinct(others, 2, () => false)];
  const options = [attacks, ...wrong].sort((a, b) => a - b).map((value) => toOption(String(value)));

  return {
    id: "attack-count",
    promptKey: promptKey("attackCount"),
    options,
    correctId: String(attacks),
    staff: passage,
    explanation: explain("readingAttackCount", { noteheads, attacks }),
  };
}

// ── Pools por lição ──────────────────────────────────────────────────────────

export const READING_ADVANCED_GENERATORS: Record<
  "reading-chords" | "reading-expression" | "reading-c-clefs" | "reading-sight-reading",
  QuestionGenerator[]
> = {
  "reading-chords": [intervalOnStaffQuestion, triadNameQuestion, rootOfTriadQuestion],
  "reading-expression": [dynamicMeaningQuestion, articulationNameQuestion, tempoTermQuestion],
  "reading-c-clefs": [nameAltoNoteQuestion, nameTenorNoteQuestion, middleCLineQuestion],
  "reading-sight-reading": [keyAndMeterQuestion, firstNoteNameQuestion, attackCountQuestion],
};
