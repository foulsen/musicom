import type { TermLabel } from "./music-terms";

export interface QuizOption {
  /** Identificador estável (semitons, nome do padrão no domínio…) — nunca o rótulo traduzido. */
  id: string;
  /** Literal (nota, cifra) ou referência i18n resolvida só na renderização (`useMusicTerms().label`). */
  label: TermLabel;
}
