/**
 * Registro dos termos do glossário.
 *
 * Os textos (nome e definição) ficam nos locales, em `glossary.<id>.term` e `glossary.<id>.definition`;
 * aqui vivem só os identificadores estáveis, usados pelo marcador `[[id:texto]]` e pelo componente
 * `GlossaryTerm`. Ao adicionar um id, crie as duas entradas (pt e en) — o teste garante isso.
 */
export const GLOSSARY_TERM_IDS = [
  "degree",
  "tone",
  "semitone",
  "interval",
  "tonic",
  "octave",
  "key",
  "enharmonic",
  "triad",
  "seventhChord",
  "leadingTone",
  "harmonicFunction",
  "harmonicField",
  "mode",
  "relative",
  "parentKey",
  "chordSymbol",
  "degreeNotation",
  "shape",
  "tuning",
  "staff",
  "clef",
  "ledgerLine",
  "accidental",
  "keySignature",
  "measure",
  "timeSignature",
  "beat",
  "noteValue",
  "tie",
  "tuplet",
  "syncopation",
  "dynamics",
  "articulation",
] as const;

export type GlossaryTermId = (typeof GLOSSARY_TERM_IDS)[number];

const KNOWN_IDS: ReadonlySet<string> = new Set(GLOSSARY_TERM_IDS);

export function isGlossaryTermId(value: string): value is GlossaryTermId {
  return KNOWN_IDS.has(value);
}

export const glossaryTermKey = (id: GlossaryTermId) => `glossary.${id}.term`;

export const glossaryDefinitionKey = (id: GlossaryTermId) => `glossary.${id}.definition`;
