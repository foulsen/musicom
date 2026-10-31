import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";

import { CHORD_PATTERNS } from "@music-workspace/music-theory";

import { en } from "@/i18n/locales/en";
import { pt } from "@/i18n/locales/pt";

import { ALL_SCALE_PATTERNS } from "./scale-patterns";
import {
  chordDescriptionLabel,
  resolveLabel,
  scaleDescriptionLabel,
  type LabelRef,
} from "./music-terms";

function translator(locale: "en" | "pt") {
  const i18n = createI18n({ legacy: false, locale, fallbackLocale: false, missingWarn: false, messages: { en, pt } });
  const { t, te } = i18n.global;

  return {
    exists: (label: LabelRef) => te(label.key),
    resolve: (label: LabelRef) => resolveLabel((key, named) => t(key, named ?? {}), label),
  };
}

describe("scale and chord descriptions", () => {
  it.each(["en", "pt"] as const)("has a non-empty description for every domain pattern (%s)", (locale) => {
    const { exists, resolve } = translator(locale);

    for (const pattern of ALL_SCALE_PATTERNS) {
      const label = scaleDescriptionLabel(pattern.name);

      expect(label, `scale ${pattern.name}`).not.toBeNull();
      expect(exists(label!), `scale ${pattern.name}`).toBe(true);
      expect(resolve(label!).length, `scale ${pattern.name}`).toBeGreaterThan(20);
    }

    for (const pattern of CHORD_PATTERNS) {
      const label = chordDescriptionLabel(pattern.name);

      expect(label, `chord ${pattern.name}`).not.toBeNull();
      expect(exists(label!), `chord ${pattern.name}`).toBe(true);
      expect(resolve(label!).length, `chord ${pattern.name}`).toBeGreaterThan(20);
    }
  });

  it("returns null for unknown patterns", () => {
    expect(scaleDescriptionLabel("Whole Tone")).toBeNull();
    expect(chordDescriptionLabel("Quartal")).toBeNull();
  });

  it("does not leave orphan descriptions in either locale", () => {
    for (const locale of [en, pt]) {
      expect(Object.keys(locale.terms.descriptions.scales).sort()).toEqual(Object.keys(locale.terms.scales).sort());
      expect(Object.keys(locale.terms.descriptions.chords).sort()).toEqual(
        Object.keys(locale.terms.chordQualities).sort(),
      );
    }
  });
});
