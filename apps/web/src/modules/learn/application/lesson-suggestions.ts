/**
 * Mapeia a seleção atual de um explorador para a lição mais relevante ("Aprenda sobre isso").
 * Devolve o id da lição, ou `null` quando nenhuma cobre a seleção — aí o link cai na página das trilhas.
 */

/** Nomes (no domínio) dos modos do sistema maior, exceto Ionian/Aeolian, que têm lição própria. */
const MODE_PATTERN_NAMES = ["Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"];

export function lessonForScale(patternName: string): string | null {
  if (patternName === "Major" || patternName === "Ionian") return "major-scale";
  if (patternName === "Natural Minor" || patternName === "Aeolian") return "natural-minor";
  if (MODE_PATTERN_NAMES.includes(patternName)) return "modes";

  // Menores harmônica/melódica são variações da menor natural.
  if (patternName === "Harmonic Minor" || patternName === "Melodic Minor") return "natural-minor";

  return null;
}

/** Tríades -> lição de tríades; acordes com sétima (e as extensões/alterações construídas sobre ela) -> sétimas. */
export function lessonForChord(familyName: string): string | null {
  switch (familyName) {
    case "Triads":
    case "Add":
      return "triads";
    case "Seventh":
    case "Extended":
    case "Altered":
      return "seventh-chords";
    default:
      return null;
  }
}

/** O explorador de modos sempre leva à lição de modos. */
export function lessonForMode(): string {
  return "modes";
}

/** Rota da lição, ou da página das trilhas quando não há lição específica. */
export function lessonPath(lessonId: string | null): string {
  return lessonId ? `/learn/${lessonId}` : "/learn";
}
