import type { MessageSchema } from "./en";

export const pt: MessageSchema = {
  nav: {
    scaleExplorer: "Explorador de Escalas",
    chordExplorer: "Explorador de Acordes",
    openSidebar: "Abrir navegação",
    closeSidebar: "Fechar navegação",
  },
  common: {
    rootNote: "Nota fundamental",
    notes: "Notas",
    shapes: "Digitações",
    fretRange: "Faixa de casas",
    frets: "{count} casas",
  },
  scaleExplorer: {
    title: "Explorador de Escalas",
    subtitle: "Escolha uma fundamental e uma escala para ver suas notas, campo harmônico e braço.",
    scaleType: "Tipo de Escala",
    harmonicField: "Campo Harmônico",
    openInChordExplorer: "Abrir no Explorador de Acordes",
    emptyShapes: {
      title: "Ainda sem digitações salvas",
      description: "Ainda não há uma digitação predefinida para {chord}, mas você pode ver as notas acima e explorá-lo no braço.",
    },
  },
  chordExplorer: {
    title: "Explorador de Acordes",
    subtitle: "Combine uma fundamental, uma família de acordes e uma qualidade para estudar suas digitações e o braço.",
    chordFamily: "Família de Acordes",
    chordQuality: "Qualidade do Acorde",
    fretboardWithChordNotes: "Braço com as notas do acorde",
    emptyShapes: {
      title: "Ainda sem digitações salvas",
      description: "Ainda não há uma digitação predefinida para {chord}, mas você pode ver as notas acima e explorá-lo no braço.",
    },
  },
  fretboard: {
    showOutOfScale: "Mostrar todas as notas",
    showOutOfChord: "Mostrar todas as notas",
  },
  tuning: {
    label: "Afinação",
    placeholder: "Selecione uma afinação",
  },
  intervals: {
    whole: "T",
    half: "ST",
    wholeHalf: "T½",
  },
};
