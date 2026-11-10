import type { DeepStringify } from "../deep-stringify";
import type { readingRhythmEn } from "./practice-rhythm.en";

export const readingRhythmPt: DeepStringify<typeof readingRhythmEn> = {
  levels: {
    quarters: "Semínimas e mínimas",
    eighths: "Colcheias",
    dotted: "Pontuadas e ligadas",
    sixteenths: "Semicolcheias",
    syncopation: "Síncopes",
    compound: "Compasso composto",
    triplets: "Tercinas",
  },
  staffLabel: "Ritmo para bater em {time}",
  bpm: "Andamento",
  bpmValue: "{bpm} BPM",
  metronome: "Metrônomo",
  start: "Começar",
  listen: "Ouvir",
  next: "Próximo ritmo",
  tap: "Bater",
  tapHint: "Toque em Começar, espere a contagem e bata cada nota do ritmo no tempo certo.",
  runningHint: "Bata cada nota no tempo. As pausas ficam em silêncio.",
  listeningHint: "Ouça o ritmo e acompanhe as notas destacadas.",
  tapCount: "{count} batidas",
  shortcutHint: "Espaço bate (ou começa) · L ouve · Enter para o próximo ritmo",
  result: {
    accuracy: "Precisão: {percent}%",
    summary: "{hits} de {total} notas acertadas · {extra} batidas extras",
    best: "Melhor neste nível: {percent}%",
    newBest: "Novo recorde!",
    legend: "Notas verdes foram acertadas, notas vermelhas foram perdidas.",
  },
};
