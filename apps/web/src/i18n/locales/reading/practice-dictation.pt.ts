import type { DeepStringify } from "../deep-stringify";
import type { readingDictationEn } from "./practice-dictation.en";

export const readingDictationPt: DeepStringify<typeof readingDictationEn> = {
  levels: {
    steps: "Graus conjuntos",
    thirds: "Terças",
    leaps: "Saltos",
    minor: "Menor",
  },
  levelLabel: "Nível do ditado",
  prompt: "Qual partitura você ouviu?",
  firstPlayHint: "Aperte Play para ouvir a frase (antes vem uma contagem).",
  play: "Play",
  replay: "Ouvir de novo",
  optionLabel: "Opção {number}",
  optionsLabel: "Opções de partitura",
  correct: "Correto!",
  incorrect: "Quase — a partitura destacada é a frase que você ouviu.",
  next: "Próxima",
  score: "Placar: {correct}/{total}",
  resetScore: "Zerar placar",
  shortcutHint: "1–3 para responder · R repete · Enter/Espaço para a próxima",
};
