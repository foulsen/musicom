import { createPassage, TimeSignature, type MusicEvent, type Passage } from "@music-workspace/music-theory";

import type { RhythmLevelId } from "./reading-types";
import { RHYTHM_CELLS, type RhythmCell, type RhythmCellId } from "./rhythm-cells";

export interface RhythmLevel {
  /** Fórmulas de compasso sorteadas para a passagem. */
  times: string[];
  cells: RhythmCellId[];
}

const SIMPLE_TIMES = ["2/4", "3/4", "4/4"];

export const RHYTHM_LEVELS: Record<RhythmLevelId, RhythmLevel> = {
  quarters: { times: SIMPLE_TIMES, cells: ["q", "qr", "h", "h.", "w"] },
  eighths: { times: SIMPLE_TIMES, cells: ["q", "qr", "8-8", "h"] },
  dotted: { times: ["3/4", "4/4"], cells: ["q", "8-8", "h", "q.-8", "q~8-8", "h."] },
  sixteenths: { times: ["2/4", "4/4"], cells: ["q", "qr", "8-8", "16x4", "8-16-16", "16-16-8"] },
  syncopation: { times: ["2/4", "4/4"], cells: ["q", "8-8", "8r-8", "8-q-8", "16-8-16", "q.-8"] },
  compound: { times: ["6/8", "9/8", "12/8"], cells: ["q.", "q.r", "q-8", "8-q", "8-8-8", "8.-16-8"] },
  triplets: { times: ["2/4", "4/4"], cells: ["q", "8-8", "trip8", "h"] },
};

export const RHYTHM_MEASURES = 2;

/** Tentativas com o sorteador recebido antes de recorrer a `Math.random` (evita laço infinito com sorteadores fixos). */
const MAX_SEEDED_ATTEMPTS = 100;

type Random = () => number;

function pick<T>(items: T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

function startsWithNote(cell: RhythmCell): boolean {
  return cell.build()[0].kind === "note";
}

/** Preenche o compasso pulso a pulso com células que cabem no que resta; a primeira célula da passagem começa com som. */
function buildMeasure(level: RhythmLevel, pulses: number, isFirst: boolean, random: Random): MusicEvent[] {
  const events: MusicEvent[] = [];
  let remaining = pulses;

  while (remaining > 0) {
    const mustStartWithNote = isFirst && events.length === 0;
    const fitting = level.cells
      .map((id) => RHYTHM_CELLS[id] as RhythmCell)
      .filter((cell) => cell.pulses <= remaining && (!mustStartWithNote || startsWithNote(cell)));
    const cell = pick(fitting, random);

    events.push(...cell.build());
    remaining -= cell.pulses;
  }

  return events;
}

/** Um compasso só de pausas não tem nada para bater. */
function hasAttack(events: MusicEvent[]): boolean {
  return events.some((event) => event.kind === "note");
}

/** Gera uma passagem rítmica de 2 compassos (clave de sol, nota única B4) para o nível. */
export function generateRhythm(levelId: RhythmLevelId, random: Random = Math.random): Passage {
  const level = RHYTHM_LEVELS[levelId];
  const time = pick(level.times, random);
  const pulses = TimeSignature.parse(time).pulsesPerMeasure();

  const measures = Array.from({ length: RHYTHM_MEASURES }, (_, index) => {
    for (let attempt = 0; ; attempt++) {
      const events = buildMeasure(level, pulses, index === 0, attempt < MAX_SEEDED_ATTEMPTS ? random : Math.random);
      if (hasAttack(events)) return events;
    }
  });

  return createPassage({ clef: "treble", fifths: 0, time }, measures);
}
