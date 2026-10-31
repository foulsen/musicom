import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import {
  ALTERED_FAMILY,
  CHORD_FAMILIES,
  CHORD_PATTERNS,
  DOMINANT,
  Degree,
  Interval,
  SUBDOMINANT,
  TONIC,
} from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";

import { ALL_SCALE_PATTERNS } from "./scale-patterns";
import {
  chordFamilyLabel,
  chordQualityLabel,
  degreeFunctionLabel,
  harmonicFunctionLabel,
  intervalLabel,
  resolveLabel,
  scaleLabel,
  semitonesLabel,
  termKey,
  termLabel,
  withSemitonesLabel,
  type TermLabel,
} from "./music-terms";

/** `resolveLabel` ligado a um i18n real (en/pt de verdade), sem precisar montar um app Vue. */
function translator(locale: "en" | "pt") {
  const i18n = createI18n({ legacy: false, locale, fallbackLocale: "en", messages: { en, pt } });
  const { t } = i18n.global;

  return (label: TermLabel) =>
    resolveLabel(
      (key, named, plural) => (plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural)),
      label,
    );
}

const inEn = translator("en");
const inPt = translator("pt");

/** Todos os valores de grau que o domínio sabe nomear (tabela privada de `Degree`). */
const DEGREE_VALUES = [
  "1", "b2", "2", "#2", "b3", "3", "4", "#4", "b5", "5", "#5", "b6", "6", "bb7", "b7", "7",
  "b9", "9", "#9", "11", "13",
];

describe("termLabel / termKey", () => {
  it("falls back to the raw domain string when the name is unknown", () => {
    expect(termKey("scale", "Whole Tone")).toBeNull();
    expect(termLabel("scale", "Whole Tone")).toBe("Whole Tone");
    expect(inPt(termLabel("scale", "Whole Tone"))).toBe("Whole Tone");
    expect(inPt(intervalLabel("seventeenth"))).toBe("seventeenth");
  });

  it("resolves a few names in pt and en", () => {
    expect(inPt(scaleLabel("Dorian"))).toBe("Dórico");
    expect(inEn(scaleLabel("Dorian"))).toBe("Dorian");
    expect(inPt(scaleLabel("Natural Minor"))).toBe("Menor natural");
    expect(inPt(chordQualityLabel("Dominant 7th"))).toBe("Sétima da dominante");
    expect(inPt(chordQualityLabel("Half-diminished 7th"))).toBe("Meio-diminuto");
    expect(inPt(chordFamilyLabel("Seventh"))).toBe("Tétrades");
    expect(inEn(chordFamilyLabel("Seventh"))).toBe("Seventh");
    expect(inPt(harmonicFunctionLabel("Tonic"))).toBe("Tônica");
    expect(inPt(degreeFunctionLabel("leading tone"))).toBe("sensível");
    expect(inEn(degreeFunctionLabel("leading tone"))).toBe("leading tone");
  });

  it("leaves literal strings (notes, chord symbols) untouched", () => {
    expect(inPt("Dm7")).toBe("Dm7");
  });
});

describe("intervalLabel", () => {
  it("accepts degrees, intervals and semitone counts", () => {
    expect(inPt(intervalLabel(new Degree("b3")))).toBe("terça menor");
    expect(inPt(intervalLabel(new Interval(6)))).toBe("trítono");
    expect(inPt(intervalLabel(7))).toBe("quinta justa");
    expect(inEn(intervalLabel(4))).toBe("major third");
  });

  it("names 12 semitones as an octave (the domain folds it into the tonic)", () => {
    expect(inPt(intervalLabel(12))).toBe("oitava");
    expect(inEn(intervalLabel(12))).toBe("octave");
  });
});

describe("semitones labels", () => {
  it("pluralizes per locale", () => {
    expect(inPt(semitonesLabel(1))).toBe("1 semitom");
    expect(inPt(semitonesLabel(3))).toBe("3 semitons");
    expect(inEn(semitonesLabel(1))).toBe("1 semitone");
    expect(inEn(semitonesLabel(3))).toBe("3 semitones");
  });

  it("resolves nested labels", () => {
    const label = withSemitonesLabel(intervalLabel(new Degree("b3")), 3);

    expect(inPt(label)).toBe("terça menor — 3 semitons");
    expect(inEn(label)).toBe("minor third — 3 semitones");
    expect(inPt(withSemitonesLabel("b3", 3))).toBe("b3 — 3 semitons");
  });
});

describe("coverage of the domain vocabulary", () => {
  const everyDomainName: [string, TermLabel][] = [
    ...ALL_SCALE_PATTERNS.map((pattern): [string, TermLabel] => ["scale", scaleLabel(pattern.name)]),
    ...CHORD_PATTERNS.map((pattern): [string, TermLabel] => ["chordQuality", chordQualityLabel(pattern.name)]),
    ...CHORD_FAMILIES.map((family): [string, TermLabel] => ["chordFamily", chordFamilyLabel(family.name)]),
    ...[TONIC, SUBDOMINANT, DOMINANT].map((fn): [string, TermLabel] => [
      "harmonicFunction",
      harmonicFunctionLabel(fn.name),
    ]),
    ...Array.from({ length: 13 }, (_, semitones): [string, TermLabel] => ["interval", intervalLabel(semitones)]),
    ...DEGREE_VALUES.map((value): [string, TermLabel] => ["interval", intervalLabel(new Degree(value))]),
    // Extensões (9, 11, 13) não têm função de grau: `functionName()` devolve o próprio valor.
    ...DEGREE_VALUES.filter((value) => new Degree(value).position() <= 7).map((value): [string, TermLabel] => [
      "degreeFunction",
      degreeFunctionLabel(new Degree(value).functionName()),
    ]),
  ];

  it.each([
    ["en", inEn],
    ["pt", inPt],
  ] as const)("has a translation for every name the domain can produce (%s)", (_locale, resolve) => {
    for (const [kind, label] of everyDomainName) {
      // Um rótulo que ficou string é um nome sem entrada na tabela (cairia no texto cru do domínio).
      expect(typeof label, `${kind}: ${JSON.stringify(label)}`).toBe("object");
      expect(resolve(label)).not.toMatch(/^terms\./);
    }
  });

  it("covers the altered family patterns", () => {
    ALTERED_FAMILY.patterns.forEach((pattern) => {
      expect(termKey("chordQuality", pattern.name)).not.toBeNull();
    });
  });
});
