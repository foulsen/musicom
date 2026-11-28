import type { Pitch } from "@music-workspace/music-theory";

import type { TimedPitch } from "@/modules/shared/application/use-note-audio";

type TriadQuality = "major" | "minor" | "diminished";

/** Acorde de uma progressão: fundamental em semitons a partir da tônica + qualidade da tríade. */
interface ProgressionChord {
  root: number;
  quality: TriadQuality;
}

export interface ProgressionItem {
  /** Id estável (ASCII) — vai para stats, confusões e preferências sincronizadas. */
  id: string;
  /** Cifragem em algarismos romanos: notação igual em qualquer idioma, exibida como texto literal. */
  label: string;
  chords: readonly ProgressionChord[];
}

const TRIAD_INTERVALS: Record<TriadQuality, readonly number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
};

const M = "major";
const m = "minor";

/**
 * Progressões por nível (fácil ⊂ médio ⊂ difícil, cumulativo; >= 4 por nível para ter 3 distratores).
 * Fácil: cadências e o "pop" clássico; médio: mesmas funções em outra ordem; difícil: empréstimo modal e menor.
 */
export const PROGRESSION_ENTRIES: [ProgressionItem, number][] = [
  [{ id: "I-IV-V-I", label: "I–IV–V–I", chords: [{ root: 0, quality: M }, { root: 5, quality: M }, { root: 7, quality: M }, { root: 0, quality: M }] }, 1],
  [{ id: "I-V-vi-IV", label: "I–V–vi–IV", chords: [{ root: 0, quality: M }, { root: 7, quality: M }, { root: 9, quality: m }, { root: 5, quality: M }] }, 1],
  [{ id: "I-vi-IV-V", label: "I–vi–IV–V", chords: [{ root: 0, quality: M }, { root: 9, quality: m }, { root: 5, quality: M }, { root: 7, quality: M }] }, 1],
  [{ id: "ii-V-I", label: "ii–V–I", chords: [{ root: 2, quality: m }, { root: 7, quality: M }, { root: 0, quality: M }] }, 1],
  [{ id: "vi-IV-I-V", label: "vi–IV–I–V", chords: [{ root: 9, quality: m }, { root: 5, quality: M }, { root: 0, quality: M }, { root: 7, quality: M }] }, 2],
  [{ id: "I-IV-vi-V", label: "I–IV–vi–V", chords: [{ root: 0, quality: M }, { root: 5, quality: M }, { root: 9, quality: m }, { root: 7, quality: M }] }, 2],
  [{ id: "I-iii-IV-V", label: "I–iii–IV–V", chords: [{ root: 0, quality: M }, { root: 4, quality: m }, { root: 5, quality: M }, { root: 7, quality: M }] }, 2],
  [{ id: "IV-I-V-vi", label: "IV–I–V–vi", chords: [{ root: 5, quality: M }, { root: 0, quality: M }, { root: 7, quality: M }, { root: 9, quality: m }] }, 2],
  [{ id: "I-bVII-IV-I", label: "I–♭VII–IV–I", chords: [{ root: 0, quality: M }, { root: 10, quality: M }, { root: 5, quality: M }, { root: 0, quality: M }] }, 3],
  [{ id: "I-IV-iv-I", label: "I–IV–iv–I", chords: [{ root: 0, quality: M }, { root: 5, quality: M }, { root: 5, quality: m }, { root: 0, quality: M }] }, 3],
  [{ id: "i-bVI-bIII-bVII", label: "i–♭VI–♭III–♭VII", chords: [{ root: 0, quality: m }, { root: 8, quality: M }, { root: 3, quality: M }, { root: 10, quality: M }] }, 3],
  [{ id: "i-iv-v-i", label: "i–iv–v–i", chords: [{ root: 0, quality: m }, { root: 5, quality: m }, { root: 7, quality: m }, { root: 0, quality: m }] }, 3],
];

export function progressionItem(id: string): ProgressionItem | undefined {
  return PROGRESSION_ENTRIES.find(([item]) => item.id === id)?.[0];
}

/** Faixa das vozes superiores em semitons da tônica: perto dela, sem subir demais. */
const UPPER_VOICES_MAX = 16;
const UPPER_VOICES_MIN = -5;
/** A voz superior mais grave fica ao menos uma terça menor acima do baixo, para o baixo não embolar. */
const MIN_GAP_ABOVE_BASS = 3;

/** Tríade da fundamental em posição fechada, em semitons da tônica, na inversão `inversion` (0..2). */
function closeTriad(chord: ProgressionChord, inversion: number): number[] {
  const root = TRIAD_INTERVALS[chord.quality].map((interval) => chord.root + interval);

  return [...root.slice(inversion), ...root.slice(0, inversion).map((offset) => offset + 12)];
}

function movement(from: readonly number[], to: readonly number[]): number {
  return to.reduce((total, offset, index) => total + Math.abs(offset - from[index]), 0);
}

/**
 * Voicing por condução de vozes: de todas as inversões/oitavas da tríade dentro da faixa,
 * escolhe a que menos move as vozes em relação ao acorde anterior. A primeira se compara à
 * tríade da tônica, então a progressão começa perto dela e nunca "pula" de registro.
 */
function smoothVoicing(chord: ProgressionChord, previous: readonly number[], lowest: number): number[] {
  let best: number[] | null = null;
  let bestCost = Infinity;

  for (let inversion = 0; inversion < 3; inversion++) {
    const base = closeTriad(chord, inversion);

    for (const shift of [-24, -12, 0, 12, 24]) {
      const voicing = base.map((offset) => offset + shift);
      if (voicing[0] < lowest || voicing[2] > UPPER_VOICES_MAX) continue;

      const cost = movement(previous, voicing);
      if (cost < bestCost) {
        best = voicing;
        bestCost = cost;
      }
    }
  }

  // A faixa tem mais de uma oitava de largura, então sempre há candidato; o fallback só satisfaz o tipo.
  return best ?? closeTriad(chord, 0);
}

/**
 * Acordes da progressão na tonalidade de `tonic`: cada um é `[baixo, ...tríade]`, ascendente.
 * O baixo é a fundamental uma oitava abaixo da tônica; `null` para id desconhecido.
 */
export function progressionChords(id: string, tonic: Pitch): Pitch[][] | null {
  const item = progressionItem(id);
  if (!item) return null;

  let previous: readonly number[] = TRIAD_INTERVALS.major;

  return item.chords.map((chord) => {
    const bass = chord.root - 12;
    const upper = smoothVoicing(chord, previous, Math.max(UPPER_VOICES_MIN, bass + MIN_GAP_ABOVE_BASS));
    previous = upper;

    return [bass, ...upper].map((offset) => tonic.transpose(offset));
  });
}

const CHORD_STEP_SECONDS = 0.9;
const CHORD_DURATION_SECONDS = 0.85;

/**
 * Linha do tempo da progressão: um acorde por passo, em sequência.
 * `tempo` é um fator de velocidade (1 = normal; > 1 mais rápido), como em `cadenceTimeline`.
 */
export function progressionTimeline(id: string, tonic: Pitch, tempo = 1): TimedPitch[] {
  const chords = progressionChords(id, tonic) ?? [];

  return chords.flatMap((chord, index) =>
    chord.map((pitch) => ({
      pitch,
      offsetSeconds: (index * CHORD_STEP_SECONDS) / tempo,
      durationSeconds: CHORD_DURATION_SECONDS / tempo,
    })),
  );
}
