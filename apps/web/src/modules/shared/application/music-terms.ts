import { useI18n } from "vue-i18n";

import { Interval, type Degree } from "@music-workspace/music-theory";

/**
 * Camada de tradução da terminologia musical.
 *
 * O domínio (`music-theory`) continua livre de i18n e devolve identificadores estáveis em
 * inglês ("Dorian", "minor third", "leading tone"…) — são os mesmos que vão para stores,
 * deep-links (`?pattern=Dorian`) e estado persistido, então **nunca** mudam. Aqui eles são
 * mapeados para chaves `terms.*` dos locales; nomes desconhecidos caem no texto cru do domínio.
 *
 * Nomes de nota e cifras (C, Dm7, Bb, C7) não passam por aqui: seguem como cifra em qualquer idioma.
 */

export type TermKind =
  | "scale"
  | "chordQuality"
  | "chordFamily"
  | "interval"
  | "harmonicFunction"
  | "degreeFunction";

// Nome do domínio -> chave dentro de `terms.<namespace>` (o nome em si pode ter espaços/símbolos).

const SCALE_KEYS: Record<string, string> = {
  Major: "major",
  Ionian: "ionian",
  Dorian: "dorian",
  Phrygian: "phrygian",
  Lydian: "lydian",
  Mixolydian: "mixolydian",
  Aeolian: "aeolian",
  Locrian: "locrian",
  "Natural Minor": "naturalMinor",
  "Harmonic Minor": "harmonicMinor",
  "Melodic Minor": "melodicMinor",
};

const CHORD_QUALITY_KEYS: Record<string, string> = {
  Major: "major",
  Minor: "minor",
  Diminished: "diminished",
  Augmented: "augmented",
  "Suspended 2nd": "suspended2",
  "Suspended 4th": "suspended4",
  Sixth: "sixth",
  "Minor Sixth": "minorSixth",
  "Major 7th": "major7",
  "Minor 7th": "minor7",
  "Dominant 7th": "dominant7",
  "Half-diminished 7th": "halfDiminished7",
  "Diminished 7th": "diminished7",
  "Minor-major 7th": "minorMajor7",
  "Dominant 9th": "dominant9",
  "Major 9th": "major9",
  "Minor 9th": "minor9",
  "Dominant 11th": "dominant11",
  "Dominant 13th": "dominant13",
  "Dominant 7♭9": "dominant7Flat9",
  "Dominant 7♯9": "dominant7Sharp9",
  "Dominant 7♭5": "dominant7Flat5",
  "Dominant 7♯5": "dominant7Sharp5",
  "Add 9": "add9",
  "Add 11": "add11",
};

const CHORD_FAMILY_KEYS: Record<string, string> = {
  Triads: "triads",
  Seventh: "seventh",
  Extended: "extended",
  Altered: "altered",
  Add: "add",
};

// Nomes em inglês devolvidos por `Interval.name()` / `Degree.intervalName()` (+ "octave", que só existe aqui).
const INTERVAL_KEYS: Record<string, string> = {
  tonic: "tonic",
  "minor second": "minorSecond",
  "major second": "majorSecond",
  "augmented second": "augmentedSecond",
  "minor third": "minorThird",
  "major third": "majorThird",
  "perfect fourth": "perfectFourth",
  "augmented fourth": "augmentedFourth",
  tritone: "tritone",
  "diminished fifth": "diminishedFifth",
  "perfect fifth": "perfectFifth",
  "augmented fifth": "augmentedFifth",
  "minor sixth": "minorSixth",
  "major sixth": "majorSixth",
  "diminished seventh": "diminishedSeventh",
  "minor seventh": "minorSeventh",
  "major seventh": "majorSeventh",
  "minor ninth": "minorNinth",
  "major ninth": "majorNinth",
  "augmented ninth": "augmentedNinth",
  "perfect eleventh": "perfectEleventh",
  "major thirteenth": "majorThirteenth",
  octave: "octave",
};

const HARMONIC_FUNCTION_KEYS: Record<string, string> = {
  Tonic: "tonic",
  Subdominant: "subdominant",
  Dominant: "dominant",
};

// Nomes devolvidos por `Degree.functionName()`.
const DEGREE_FUNCTION_KEYS: Record<string, string> = {
  tonic: "tonic",
  supertonic: "supertonic",
  mediant: "mediant",
  subdominant: "subdominant",
  dominant: "dominant",
  submediant: "submediant",
  subtonic: "subtonic",
  "leading tone": "leadingTone",
};

const TERM_TABLES: Record<TermKind, { namespace: string; keys: Record<string, string> }> = {
  scale: { namespace: "scales", keys: SCALE_KEYS },
  chordQuality: { namespace: "chordQualities", keys: CHORD_QUALITY_KEYS },
  chordFamily: { namespace: "chordFamilies", keys: CHORD_FAMILY_KEYS },
  interval: { namespace: "intervals", keys: INTERVAL_KEYS },
  harmonicFunction: { namespace: "harmonicFunctions", keys: HARMONIC_FUNCTION_KEYS },
  degreeFunction: { namespace: "degreeFunctions", keys: DEGREE_FUNCTION_KEYS },
};

// ── Rótulos traduzíveis ──────────────────────────────────────────────────────

/** Referência a uma chave i18n + parâmetros — resolvida só na renderização (o gerador não conhece o idioma). */
export interface LabelRef {
  key: string;
  params?: Record<string, string | number | TermLabel>;
  /** Quando presente, escolhe a forma plural da mensagem (`"um | {n} itens"`) e expõe `{n}`/`{count}`. */
  count?: number;
}

/**
 * Texto de UI ainda não resolvido: uma `string` é literal (cifra, nota, fórmula "1 - b3 - 5"),
 * um `LabelRef` é traduzido pelo `t` na hora de exibir. Ids de quiz/flashcard nunca são rótulos.
 */
export type TermLabel = string | LabelRef;

export type Translate = (key: string, named?: Record<string, unknown>, plural?: number) => string;

/** Chave i18n completa de um termo, ou `null` se o domínio devolveu um nome desconhecido. */
export function termKey(kind: TermKind, name: string): string | null {
  const table = TERM_TABLES[kind];
  const key = table.keys[name];

  return key ? `terms.${table.namespace}.${key}` : null;
}

/** Rótulo traduzível de um termo; nomes desconhecidos viram texto literal (fallback = string do domínio). */
export function termLabel(kind: TermKind, name: string): TermLabel {
  const key = termKey(kind, name);

  return key ? { key } : name;
}

export const scaleLabel = (name: string): TermLabel => termLabel("scale", name);
export const chordQualityLabel = (name: string): TermLabel => termLabel("chordQuality", name);
export const chordFamilyLabel = (name: string): TermLabel => termLabel("chordFamily", name);
export const harmonicFunctionLabel = (name: string): TermLabel => termLabel("harmonicFunction", name);
export const degreeFunctionLabel = (name: string): TermLabel => termLabel("degreeFunction", name);

/**
 * Chave i18n da descrição curta (caráter + uso típico) de uma escala/modo, ou `null` sem entrada.
 * Reaproveita as chaves de `SCALE_KEYS`/`CHORD_QUALITY_KEYS`: `terms.descriptions.<scales|chords>.<chave>`.
 */
export function scaleDescriptionKey(name: string): string | null {
  const key = SCALE_KEYS[name];

  return key ? `terms.descriptions.scales.${key}` : null;
}

export function chordDescriptionKey(name: string): string | null {
  const key = CHORD_QUALITY_KEYS[name];

  return key ? `terms.descriptions.chords.${key}` : null;
}

/** Descrição traduzível de uma escala/modo; `null` quando o padrão não tem descrição. */
export function scaleDescriptionLabel(name: string): LabelRef | null {
  const key = scaleDescriptionKey(name);

  return key ? { key } : null;
}

export function chordDescriptionLabel(name: string): LabelRef | null {
  const key = chordDescriptionKey(name);

  return key ? { key } : null;
}

/** Nome do intervalo em inglês (domínio) a partir de semitons — 12 vira "octave" (o domínio dobra para "tonic"). */
export function intervalDomainName(semitones: number): string {
  return semitones === 12 ? "octave" : new Interval(semitones).name();
}

/** Intervalo por grau (`Degree`), semitons (`number`, 12 = oitava), `Interval` ou nome já em inglês. */
export function intervalLabel(source: Degree | Interval | number | string): TermLabel {
  if (typeof source === "string") return termLabel("interval", source);
  if (typeof source === "number") return termLabel("interval", intervalDomainName(source));
  if (source instanceof Interval) return termLabel("interval", source.name());

  return termLabel("interval", source.intervalName());
}

/** "3 semitons" — plural resolvido pelo vue-i18n. */
export function semitonesLabel(semitones: number): LabelRef {
  return { key: "terms.semitones", count: semitones };
}

/** "terça menor — 3 semitons" / "b3 — 3 semitons". */
export function withSemitonesLabel(name: TermLabel, semitones: number): LabelRef {
  return { key: "terms.withSemitones", params: { name, semitones: semitonesLabel(semitones) } };
}

/** Resolve um `TermLabel` (recursivamente nos parâmetros) com a função `t` do idioma ativo. */
export function resolveLabel(translate: Translate, label: TermLabel): string {
  if (typeof label === "string") return label;

  const named: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(label.params ?? {})) {
    named[name] = typeof value === "object" ? resolveLabel(translate, value) : value;
  }

  if (label.count === undefined) return translate(label.key, named);

  return translate(label.key, { ...named, count: label.count, n: label.count }, label.count);
}

// ── Composable ───────────────────────────────────────────────────────────────

type Named<T> = T | string;

function nameOf(value: Named<{ name: string }>): string {
  return typeof value === "string" ? value : value.name;
}

/**
 * Nomes traduzidos da terminologia musical para exibição. Aceita tanto o objeto do domínio quanto
 * o nome-identificador (string); o que não tiver tradução volta como o texto cru do domínio.
 */
export function useMusicTerms() {
  const { t, te } = useI18n();

  const translate: Translate = (key, named, plural) =>
    plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural);

  /** Resolve qualquer `TermLabel` (rótulo de opção de quiz, prompt/resposta de flashcard…). */
  function label(value: TermLabel): string {
    return resolveLabel(translate, value);
  }

  /** Resolve a descrição se a chave existir no idioma ativo; senão `null` (a UI simplesmente omite o texto). */
  function description(key: string | null): string | null {
    return key && te(key) ? t(key) : null;
  }

  return {
    label,
    scaleDescription: (pattern: Named<{ name: string }>) => description(scaleDescriptionKey(nameOf(pattern))),
    chordDescription: (pattern: Named<{ name: string }>) => description(chordDescriptionKey(nameOf(pattern))),
    scaleName: (pattern: Named<{ name: string }>) => label(scaleLabel(nameOf(pattern))),
    chordQualityName: (pattern: Named<{ name: string }>) => label(chordQualityLabel(nameOf(pattern))),
    chordFamilyName: (family: Named<{ name: string }>) => label(chordFamilyLabel(nameOf(family))),
    intervalName: (source: Degree | Interval | number | string) => label(intervalLabel(source)),
    harmonicFunctionName: (fn: Named<{ name: string }>) => label(harmonicFunctionLabel(nameOf(fn))),
    degreeFunctionName: (degree: Degree | string) =>
      label(degreeFunctionLabel(typeof degree === "string" ? degree : degree.functionName())),
  };
}
