import {
  Clef,
  Duration,
  KeySignature,
  SpelledNote,
  SpelledPitch,
  createPassage,
  passageSignature,
  type MusicEvent,
  type Passage,
} from "@music-workspace/music-theory";

import type { DictationLevelId } from "./reading-types";

/** Andamento da reprodução do ditado (pulsos por minuto). */
export const DICTATION_BPM = 80;

/** Faixa de posições na pauta de sol (0 = 1ª linha) em que as notas do ditado ficam. */
const MIN_POSITION = -2;
const MAX_POSITION = 10;

const OPTION_COUNT = 3;
const BEATS_PER_MEASURE = 4;

type BeatKind = "quarter" | "pair" | "dotted";

/**
 * Uma célula rítmica e os graus (offsets diatônicos a partir da tônica) das suas notas:
 * semínima (1 tempo), par de colcheias (1 tempo) ou semínima pontuada + colcheia (2 tempos).
 */
interface Beat {
  kind: BeatKind;
  offsets: number[];
}

interface DictationLevelConfig {
  mode: "major" | "minor";
  fifths: readonly number[];
  measures: number;
  /** Células sorteadas (a última da melodia é sempre uma semínima). */
  beatKinds: readonly BeatKind[];
  /** Saltos permitidos entre notas vizinhas, em graus. */
  deltas: readonly number[];
  /** Intervalo de graus permitido em relação à tônica. */
  minOffset: number;
  maxOffset: number;
  /** Graus em que a melodia pode terminar. */
  endOffsets: readonly number[];
  /** Se a primeira nota é sempre a tônica. */
  startsOnTonic: boolean;
  /** Se um distrator pode trocar o ritmo de um tempo. */
  rhythmSwap: boolean;
  /** Se o 7º grau pode ser elevado (sensível). */
  raisedSeventh: boolean;
}

const DICTATION_LEVELS: Record<DictationLevelId, DictationLevelConfig> = {
  steps: {
    mode: "major",
    fifths: [0],
    measures: 1,
    beatKinds: ["quarter"],
    deltas: [-1, 1],
    minOffset: 0,
    maxOffset: 4,
    endOffsets: [0, 1, 2, 3, 4],
    startsOnTonic: true,
    rhythmSwap: false,
    raisedSeventh: false,
  },
  thirds: {
    mode: "major",
    fifths: [-1, 0, 1],
    measures: 2,
    beatKinds: ["quarter", "pair"],
    deltas: [-2, -1, 1, 2],
    minOffset: 0,
    maxOffset: 7,
    endOffsets: [0, 7],
    startsOnTonic: false,
    rhythmSwap: false,
    raisedSeventh: false,
  },
  leaps: {
    mode: "major",
    fifths: [-2, -1, 0, 1, 2],
    measures: 2,
    beatKinds: ["quarter", "pair", "dotted"],
    deltas: [-4, -3, -2, -1, 1, 2, 3, 4],
    minOffset: -3,
    maxOffset: 7,
    endOffsets: [0, 4, 7],
    startsOnTonic: false,
    rhythmSwap: true,
    raisedSeventh: false,
  },
  minor: {
    mode: "minor",
    fifths: [0, -1, 1],
    measures: 2,
    beatKinds: ["quarter", "pair", "dotted"],
    deltas: [-3, -2, -1, 1, 2, 3],
    minOffset: -3,
    maxOffset: 7,
    endOffsets: [0, 7],
    startsOnTonic: false,
    rhythmSwap: true,
    raisedSeventh: true,
  },
};

/**
 * Tônica (oitava da letra) de cada armadura. Maiores na oitava 4; as menores ficam onde cabem
 * na faixa da pauta (A4, D4, E4 — Lá3 ficaria duas linhas suplementares abaixo do limite).
 */
const MINOR_TONIC_OCTAVE: Record<string, number> = { A: 4, D: 4, E: 4 };

export interface DictationQuestion {
  answer: Passage;
  /** 3 passagens distintas (por `passageSignature`), embaralhadas, incluindo `answer`. */
  options: Passage[];
}

function tonicFor(config: DictationLevelConfig, key: KeySignature): SpelledPitch {
  const tonic: SpelledNote = key.tonic(config.mode);
  const octave = config.mode === "minor" ? (MINOR_TONIC_OCTAVE[tonic.letter] ?? 4) : 4;

  return SpelledPitch.of(tonic.letter, tonic.accidental, octave);
}

/** Pitch do grau `offset` a partir da tônica, com a armadura (e a sensível elevada, se for o caso). */
function pitchAt(config: DictationLevelConfig, key: KeySignature, tonic: SpelledPitch, offset: number): SpelledPitch {
  const natural = SpelledPitch.fromDiatonicIndex(tonic.diatonicIndex() + offset);
  const raised = config.raisedSeventh && (((offset % 7) + 7) % 7 === 6) ? 1 : 0;

  return natural.withAccidental(key.accidentalFor(natural.spelled.letter) + raised);
}

function isInRange(pitch: SpelledPitch): boolean {
  const position = Clef.TREBLE.staffPosition(pitch);

  return position >= MIN_POSITION && position <= MAX_POSITION;
}

function randomInt(count: number, random: () => number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[randomInt(items.length, random)];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = randomInt(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

const NOTES_PER_BEAT: Record<BeatKind, number> = { quarter: 1, pair: 2, dotted: 2 };
const SPAN_IN_BEATS: Record<BeatKind, number> = { quarter: 1, pair: 1, dotted: 2 };

function beatDurations(kind: BeatKind): Duration[] {
  switch (kind) {
    case "quarter":
      return [Duration.of("quarter")];
    case "pair":
      return [Duration.of("eighth"), Duration.of("eighth")];
    case "dotted":
      return [Duration.of("quarter", 1), Duration.of("eighth")];
  }
}

/** Células até completar os compassos; a pontuada não cruza a barra e o último tempo é sempre semínima. */
function pickBeatKinds(config: DictationLevelConfig, random: () => number): BeatKind[] {
  const total = config.measures * BEATS_PER_MEASURE;
  const kinds: BeatKind[] = [];

  for (let position = 0; position < total; ) {
    const remainingInMeasure = BEATS_PER_MEASURE - (position % BEATS_PER_MEASURE);
    const remaining = total - position;
    const candidates = config.beatKinds.filter(
      (kind) => SPAN_IN_BEATS[kind] <= remainingInMeasure && (remaining > 1 ? SPAN_IN_BEATS[kind] < remaining : kind === "quarter"),
    );
    const kind = pick(candidates, random);

    kinds.push(kind);
    position += SPAN_IN_BEATS[kind];
  }

  return kinds;
}

/** Graus sorteados em passeio aleatório; `null` se a rejeição esgotar as tentativas. */
function walkOffsets(config: DictationLevelConfig, count: number, allowed: Set<number>, random: () => number) {
  const deltas = config.deltas;

  for (let attempt = 0; attempt < 200; attempt++) {
    const offsets: number[] = new Array<number>(count);
    let ok = true;

    if (config.startsOnTonic) {
      // Passeio para a frente, a partir da tônica; o fim é livre dentro de `endOffsets`.
      offsets[0] = 0;
      for (let index = 1; index < count && ok; index++) {
        const options = deltas.map((delta) => offsets[index - 1] + delta).filter((offset) => allowed.has(offset));
        if (options.length === 0) ok = false;
        else offsets[index] = pick(options, random);
      }
      if (ok && !config.endOffsets.includes(offsets[count - 1])) ok = false;
    } else {
      // Passeio para trás, a partir do fim, que precisa ser um dos graus de repouso.
      const ends = config.endOffsets.filter((offset) => allowed.has(offset));
      if (ends.length === 0) return null;
      offsets[count - 1] = pick(ends, random);
      for (let index = count - 2; index >= 0 && ok; index--) {
        const options = deltas.map((delta) => offsets[index + 1] + delta).filter((offset) => allowed.has(offset));
        if (options.length === 0) ok = false;
        else offsets[index] = pick(options, random);
      }
    }

    if (ok) return offsets;
  }

  return null;
}

function buildBeats(kinds: BeatKind[], offsets: number[]): Beat[] {
  let cursor = 0;

  return kinds.map((kind) => {
    const count = NOTES_PER_BEAT[kind];
    const beat = { kind, offsets: offsets.slice(cursor, cursor + count) };
    cursor += count;

    return beat;
  });
}

function toPassage(config: DictationLevelConfig, key: KeySignature, tonic: SpelledPitch, beats: Beat[]): Passage {
  const measures: MusicEvent[][] = [];
  let position = 0;

  beats.forEach((beat) => {
    const measureIndex = Math.floor(position / BEATS_PER_MEASURE);
    measures[measureIndex] ??= [];
    position += SPAN_IN_BEATS[beat.kind];

    const durations = beatDurations(beat.kind);
    beat.offsets.forEach((offset, noteIndex) => {
      measures[measureIndex].push({
        kind: "note",
        pitches: [pitchAt(config, key, tonic, offset)],
        duration: durations[noteIndex],
      });
    });
  });

  return createPassage({ clef: "treble", fifths: key.fifths, time: "4/4" }, measures);
}

/** Cópia da melodia com uma única alteração: um grau ±1 ou (quando o nível permite) uma célula com outro ritmo. */
function mutate(
  config: DictationLevelConfig,
  beats: Beat[],
  isAllowedOffset: (offset: number) => boolean,
  random: () => number,
): Beat[] | null {
  const copy = beats.map((beat) => ({ kind: beat.kind, offsets: [...beat.offsets] }));
  const useRhythm = config.rhythmSwap && random() < 0.5;

  if (useRhythm) {
    const index = randomInt(copy.length, random);
    const beat = copy[index];

    if (beat.kind === "dotted") {
      // pontuada + colcheia -> duas semínimas, mesmas alturas
      copy.splice(index, 1, { kind: "quarter", offsets: [beat.offsets[0]] }, { kind: "quarter", offsets: [beat.offsets[1]] });
      return copy;
    }
    if (beat.kind === "pair") {
      beat.kind = "quarter";
      beat.offsets = [beat.offsets[0]];
      return copy;
    }

    // semínima -> par de colcheias: a nota nova é vizinha por grau da original
    const neighbours = [beat.offsets[0] - 1, beat.offsets[0] + 1].filter(isAllowedOffset);
    if (neighbours.length === 0) return null;
    beat.kind = "pair";
    beat.offsets = [beat.offsets[0], pick(neighbours, random)];
    return copy;
  }

  const flat = copy.flatMap((beat, beatIndex) => beat.offsets.map((_, noteIndex) => ({ beatIndex, noteIndex })));
  const target = pick(flat, random);
  const current = copy[target.beatIndex].offsets[target.noteIndex];
  const candidates = [current - 1, current + 1].filter(isAllowedOffset);
  if (candidates.length === 0) return null;

  copy[target.beatIndex].offsets[target.noteIndex] = pick(candidates, random);
  return copy;
}

/**
 * Sorteia um ditado: a frase tocada (`answer`) e 3 opções de partitura (a certa + 2 distratores
 * que mudam exatamente uma coisa nela), embaralhadas.
 */
export function generateDictation(levelId: DictationLevelId, random: () => number = Math.random): DictationQuestion {
  const config = DICTATION_LEVELS[levelId];
  const key = new KeySignature(pick(config.fifths, random));
  const tonic = tonicFor(config, key);

  const isAllowedOffset = (offset: number) => isInRange(pitchAt(config, key, tonic, offset));
  const allowedForWalk = new Set<number>();
  for (let offset = config.minOffset; offset <= config.maxOffset; offset++) {
    if (isAllowedOffset(offset)) allowedForWalk.add(offset);
  }

  // Sorteia ritmo + graus até a melodia caber (raro falhar: só quando a faixa da pauta aperta o nível).
  let beats: Beat[] | null = null;
  for (let attempt = 0; attempt < 50 && !beats; attempt++) {
    const kinds = pickBeatKinds(config, random);
    const noteCount = kinds.reduce((total, kind) => total + NOTES_PER_BEAT[kind], 0);
    const offsets = walkOffsets(config, noteCount, allowedForWalk, random);
    if (offsets) beats = buildBeats(kinds, offsets);
  }
  if (!beats) throw new Error(`Could not generate a dictation for level "${levelId}"`);

  const answer = toPassage(config, key, tonic, beats);
  const seen = new Set([passageSignature(answer)]);
  const options: Passage[] = [answer];

  for (let attempt = 0; attempt < 200 && options.length < OPTION_COUNT; attempt++) {
    const changed = mutate(config, beats, isAllowedOffset, random);
    if (!changed) continue;

    const passage = toPassage(config, key, tonic, changed);
    const signature = passageSignature(passage);
    if (seen.has(signature)) continue;

    seen.add(signature);
    options.push(passage);
  }

  if (options.length < OPTION_COUNT) throw new Error(`Could not generate distractors for level "${levelId}"`);

  return { answer, options: shuffle(options, random) };
}
