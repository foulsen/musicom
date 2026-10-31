import type { SingleNote } from "@music-workspace/music-theory";

import type { LabelRef, TermLabel } from "@/modules/shared/application/music-terms";
import type { QuizOption } from "@/modules/shared/application/quiz";

import type { LessonContext } from "./curriculum";

export interface CheckpointQuestion {
  id: string;
  promptKey: string;
  /** Parâmetros do prompt; nomes de escala etc. vão como `TermLabel` e são traduzidos na renderização. */
  promptParams?: Record<string, string | number | TermLabel>;
  options: QuizOption[];
  correctId: string;
  /** Raciocínio por trás da resposta, montado a partir dos dados do domínio — exibido após responder. */
  explanation: LabelRef;
}

/**
 * Tônicas (tons maiores) sorteadas a cada tentativa. O domínio nomeia notas só em sustenido, então
 * tons de bemol (Bb, Eb) renderizariam com dobrados sustenidos (A# maior) — ficam de fora.
 */
export const CHECKPOINT_TONICS: SingleNote[] = ["C", "G", "D", "F", "A", "E"];

export type QuestionGenerator = (ctx: LessonContext) => CheckpointQuestion;

export function toOption(id: string, label: TermLabel = id): QuizOption {
  return { id, label };
}

/** Explicação traduzível: chave `learn.explanations.<name>` + parâmetros montados a partir do domínio. */
export function explain(name: string, params: Record<string, string | number | TermLabel> = {}): LabelRef {
  return { key: `learn.explanations.${name}`, params };
}
