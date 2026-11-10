import {
  eventKey,
  measureAccidentalMarks,
  type ClefName,
  type Dynamic,
  type MusicEvent,
  type NoteValue,
  type Passage,
  type SpelledPitch,
  type Tuplet,
} from "@music-workspace/music-theory";

/** Descrição pura (sem VexFlow) do que será desenhado: o componente/renderer só traduz isto para a lib. */
export interface VexNoteSpec {
  /** `eventKey(compasso, evento)`: liga o desenho aos destaques. */
  key: string;
  /** Alturas em ordem crescente (VexFlow ordena os acordes e os índices dos modificadores seguem essa ordem). */
  keys: string[];
  duration: string;
  dots: number;
  isRest: boolean;
  /** Um item por altura de `keys` (vazio nas pausas): marca desenhada ou null. */
  accidentals: (string | null)[];
  articulations: string[];
  dynamic: Dynamic | null;
  tieToNext: boolean;
  tuplet: Tuplet | null;
}

export interface VexMeasureSpec {
  notes: VexNoteSpec[];
}

export interface VexPassageSpec {
  clef: ClefName;
  /** Tônica maior da armadura: "C", "G", "F#", "Bb"… */
  keySpec: string;
  timeSpec: string | null;
  /** Se a fórmula de compasso é composta (agrupa as barras de 3 em 3 colcheias). */
  compound: boolean;
  measures: VexMeasureSpec[];
}

const DURATION_CODES: Record<NoteValue, string> = {
  whole: "w",
  half: "h",
  quarter: "q",
  eighth: "8",
  sixteenth: "16",
  "thirty-second": "32",
};

/** Posição de pausa na linha do meio de cada clave. */
const REST_KEYS: Record<ClefName, string> = {
  treble: "b/4",
  bass: "d/3",
  alto: "c/4",
  tenor: "a/3",
};

const ARTICULATION_CODES = {
  staccato: "a.",
  accent: "a>",
  tenuto: "a-",
  marcato: "a^",
  fermata: "a@a",
} as const;

function vexKey(pitch: SpelledPitch): string {
  const { letter, accidental } = pitch.spelled;
  const symbol = accidental > 0 ? "#" : "b";

  return `${letter.toLowerCase()}${symbol.repeat(Math.abs(accidental))}/${pitch.octave}`;
}

function compareByStaffPosition(a: { pitch: SpelledPitch }, b: { pitch: SpelledPitch }): number {
  return a.pitch.diatonicIndex() - b.pitch.diatonicIndex() || a.pitch.midi() - b.pitch.midi();
}

function toNoteSpec(
  event: MusicEvent,
  key: string,
  clef: ClefName,
  marks: (string | null)[],
): VexNoteSpec {
  const { value, dots, tuplet } = event.duration;

  if (event.kind === "rest") {
    return {
      key,
      keys: [REST_KEYS[clef]],
      duration: `${DURATION_CODES[value]}r`,
      dots,
      isRest: true,
      accidentals: [],
      articulations: [],
      dynamic: null,
      tieToNext: false,
      tuplet,
    };
  }

  const sorted = event.pitches
    .map((pitch, index) => ({ pitch, mark: marks[index] ?? null }))
    .sort(compareByStaffPosition);

  return {
    key,
    keys: sorted.map(({ pitch }) => vexKey(pitch)),
    duration: DURATION_CODES[value],
    dots,
    isRest: false,
    accidentals: sorted.map(({ mark }) => mark),
    articulations: (event.articulations ?? []).map((articulation) => ARTICULATION_CODES[articulation]),
    dynamic: event.dynamic ?? null,
    tieToNext: event.tieToNext === true,
    tuplet,
  };
}

export function toVexflowSpec(passage: Passage, options: { showTimeSignature: boolean }): VexPassageSpec {
  const clef = passage.clef.name;

  return {
    clef,
    keySpec: passage.key.majorTonic().toString(),
    timeSpec: options.showTimeSignature ? passage.time.toString() : null,
    compound: passage.time.isCompound(),
    measures: passage.measures.map((measure, measureIndex) => {
      const marks = measureAccidentalMarks(measure, passage.key);

      return {
        notes: measure.events.map((event, eventIndex) =>
          toNoteSpec(event, eventKey(measureIndex, eventIndex), clef, marks[eventIndex] ?? []),
        ),
      };
    }),
  };
}
