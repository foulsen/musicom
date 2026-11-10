import type { DeepStringify } from "../deep-stringify";
import type { readingShellEn } from "./practice-shell.en";

export const readingShellPt: DeepStringify<typeof readingShellEn> = {
  title: "Leitura de partitura",
  subtitle: "Leia notas e ritmos na pauta e ouça o que você leu.",
  tabs: {
    notes: "Notas",
    rhythm: "Ritmo",
    dictation: "Ditado",
    keys: "Armaduras",
  },
  level: "Nível",
};
