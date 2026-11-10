import type { DeepStringify } from "../deep-stringify";
import type { readingKeysEn } from "./practice-keys.en";

export const readingKeysPt: DeepStringify<typeof readingKeysEn> = {
  levels: {
    "up-to-2": "Até 2 sustenidos/bemóis",
    "up-to-4": "Até 4 sustenidos/bemóis",
    all: "Todos os tons",
  },
  promptName: {
    major: "Qual tom maior tem esta armadura de clave?",
    minor: "Qual tom menor tem esta armadura de clave?",
  },
  promptSignature: "Qual é a armadura de clave de {key}?",
  major: "{tonic} maior",
  minor: "{tonic} menor",
  sharps: "{count} sustenido | {count} sustenidos",
  flats: "{count} bemol | {count} bemóis",
  noAccidentals: "Nenhum sustenido ou bemol",
  feedback: "{signature} → {major} / {minor}",
  staffLabel: "Armadura de clave: {signature}",
  questionStaffLabel: "Armadura de clave a identificar",
  score: "{correct}/{total} acertos",
  resetScore: "Zerar o placar de armaduras",
  shortcutHint: "Atalhos: 1-4 para responder, Enter ou Espaço para a próxima pergunta.",
  correct: "Correto!",
  incorrect: "Quase.",
  next: "Próxima",
};
