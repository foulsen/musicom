import { SpelledPitch } from "../notes/spelled-pitch";
import { Clef, ClefName } from "./clef";
import { Duration } from "./duration";
import { KeySignature } from "./key-signature";
import { TimeSignature } from "./time-signature";

export type Articulation = "staccato" | "accent" | "tenuto" | "marcato" | "fermata";
export type Dynamic = "pp" | "p" | "mp" | "mf" | "f" | "ff";

export interface NoteEvent {
  kind: "note";
  pitches: SpelledPitch[];
  duration: Duration;
  tieToNext?: boolean;
  articulations?: Articulation[];
  dynamic?: Dynamic;
}

export interface RestEvent {
  kind: "rest";
  duration: Duration;
}

export type MusicEvent = NoteEvent | RestEvent;

export interface Measure {
  events: MusicEvent[];
}

export interface Passage {
  clef: Clef;
  key: KeySignature;
  time: TimeSignature;
  measures: Measure[];
}

export type AccidentalMark = "#" | "b" | "n" | "##" | "bb";

export interface Attack {
  /** Posição em ticks desde o início da passagem. */
  tick: number;
  /** Ticks da própria nota somados aos das continuações ligadas por ligadura. */
  durationTicks: number;
  measureIndex: number;
  eventIndex: number;
  event: NoteEvent;
}

export function note(
  pitches: string | string[],
  duration: Duration,
  extras: Pick<NoteEvent, "tieToNext" | "articulations" | "dynamic"> = {},
): NoteEvent {
  const list = Array.isArray(pitches) ? pitches : [pitches];

  return { kind: "note", pitches: list.map((text) => SpelledPitch.parse(text)), duration, ...extras };
}

export function rest(duration: Duration): RestEvent {
  return { kind: "rest", duration };
}

export function createPassage(
  options: { clef?: ClefName; fifths?: number; time?: string },
  measures: MusicEvent[][],
): Passage {
  return {
    clef: Clef.from(options.clef ?? "treble"),
    key: new KeySignature(options.fifths ?? 0),
    time: TimeSignature.parse(options.time ?? "4/4"),
    measures: measures.map((events) => ({ events })),
  };
}

export function measureTicks(measure: Measure): number {
  return measure.events.reduce((total, event) => total + event.duration.ticks(), 0);
}

export function isMeasureComplete(measure: Measure, time: TimeSignature): boolean {
  return measureTicks(measure) === time.measureTicks();
}

export function passageTotalTicks(passage: Passage): number {
  return passage.measures.length * passage.time.measureTicks();
}

/** Ataques da passagem: ignora pausas e notas que continuam uma ligadura. */
export function passageAttacks(passage: Passage): Attack[] {
  const attacks: Attack[] = [];
  let tick = 0;
  let tiedFromPrevious = false;

  passage.measures.forEach((measure, measureIndex) => {
    measure.events.forEach((event, eventIndex) => {
      const ticks = event.duration.ticks();

      if (event.kind === "rest") {
        tiedFromPrevious = false;
      } else if (tiedFromPrevious && attacks.length > 0) {
        attacks[attacks.length - 1].durationTicks += ticks;
        tiedFromPrevious = event.tieToNext === true;
      } else {
        attacks.push({ tick, durationTicks: ticks, measureIndex, eventIndex, event });
        tiedFromPrevious = event.tieToNext === true;
      }

      tick += ticks;
    });
  });

  return attacks;
}

/** `bpm` conta pulsos (semínima pontuada nos compostos). */
export function secondsPerTick(bpm: number, time: TimeSignature): number {
  return 60 / (bpm * time.pulseTicks());
}

function markFor(accidental: number): AccidentalMark {
  switch (accidental) {
    case 0:
      return "n";
    case 1:
      return "#";
    case -1:
      return "b";
    case 2:
      return "##";
    case -2:
      return "bb";
    default:
      throw new RangeError(`Unsupported accidental: ${accidental}`);
  }
}

/** Acidente desenhado por evento/altura: armadura + acidentes anteriores no mesmo compasso, por letra+oitava. */
export function measureAccidentalMarks(measure: Measure, key: KeySignature): (AccidentalMark | null)[][] {
  const state = new Map<string, number>();

  return measure.events.map((event) => {
    if (event.kind === "rest") return [];

    return event.pitches.map((pitch) => {
      const slot = `${pitch.spelled.letter}${pitch.octave}`;
      const current = state.get(slot) ?? key.accidentalFor(pitch.spelled.letter);

      if (pitch.spelled.accidental === current) return null;

      state.set(slot, pitch.spelled.accidental);
      return markFor(pitch.spelled.accidental);
    });
  });
}

/**
 * Acidente efetivo (que soa) de cada altura. As alturas sempre guardam a grafia
 * que soa, então é o próprio acidente da altura; existe para que a UI nunca
 * reimplemente a regra do compasso em perguntas do tipo "qual nota soa?".
 */
export function effectiveAccidental(
  measure: Measure,
  _key: KeySignature,
  eventIndex: number,
  pitchIndex: number,
): number {
  const event = measure.events[eventIndex];
  if (!event || event.kind !== "note" || !event.pitches[pitchIndex]) {
    throw new RangeError(`No pitch at event ${eventIndex}, pitch ${pitchIndex}`);
  }

  return event.pitches[pitchIndex].spelled.accidental;
}

export function eventKey(measureIndex: number, eventIndex: number): string {
  return `${measureIndex}:${eventIndex}`;
}

function eventSignature(event: MusicEvent): string {
  const { value, dots, tuplet } = event.duration;
  const tupletPart = tuplet ? ".t" : "";
  const tail = `${value}.${dots}${tupletPart}`;

  if (event.kind === "rest") return `r.${tail}`;

  const pitches = event.pitches.map((pitch) => pitch.toString()).join("+");
  return `${pitches}.${tail}${event.tieToNext ? "~" : ""}`;
}

/** Assinatura determinística, ex.: "treble|0|4/4|E4.quarter.0 r.quarter.0|…". */
export function passageSignature(passage: Passage): string {
  const measures = passage.measures.map((measure) => measure.events.map(eventSignature).join(" "));

  return `${passage.clef.name}|${passage.key.fifths}|${passage.time}|${measures.join("|")}`;
}
