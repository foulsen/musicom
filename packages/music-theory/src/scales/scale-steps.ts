import type { ScalePattern } from "./scale-pattern";

/**
 * Tamanho de cada passo do padrão, em semitons, de um grau ao seguinte e fechando na oitava
 * (Major -> [2, 2, 1, 2, 2, 2, 1]; Harmonic Minor -> [2, 1, 2, 2, 1, 3, 1]). A soma é sempre 12.
 */
export function scalePatternSteps(pattern: ScalePattern): number[] {
  return pattern.intervals.map((interval) => interval.semitones);
}
