import { isGlossaryTermId, type GlossaryTermId } from "./glossary";

/**
 * Marcação inline de termos do glossário dentro de textos i18n.
 *
 * Sintaxe: `[[id]]` (usa o nome do termo) ou `[[id:texto exibido]]` (ex.: `[[degree:graus]]`).
 * Usamos `:` e não `|` porque o `|` é o separador de plural do vue-i18n.
 * Ids desconhecidos não quebram o texto: viram texto simples.
 */

export type GlossarySegment =
  | { type: "text"; text: string }
  | { type: "term"; id: GlossaryTermId; label?: string };

const MARKUP = /\[\[([A-Za-z]+)(?::([^\]]*))?\]\]/g;

export function parseGlossaryMarkup(source: string): GlossarySegment[] {
  const segments: GlossarySegment[] = [];

  function pushText(text: string) {
    if (!text) return;

    const last = segments[segments.length - 1];

    if (last?.type === "text") last.text += text;
    else segments.push({ type: "text", text });
  }

  let cursor = 0;

  for (const match of source.matchAll(MARKUP)) {
    const [raw, id, label] = match;

    pushText(source.slice(cursor, match.index));
    cursor = match.index + raw.length;

    if (isGlossaryTermId(id)) segments.push({ type: "term", id, label: label || undefined });
    else pushText(label || id);
  }

  pushText(source.slice(cursor));

  return segments;
}
