import type { DeepStringify } from "../deep-stringify";
import type { readingNotesEn } from "./practice-notes.en";

export const readingNotesPt: DeepStringify<typeof readingNotesEn> = {
  levels: {
    "treble-staff": "Clave de sol",
    "treble-ledger": "Linhas suplementares (sol)",
    "bass-staff": "Clave de fá",
    "bass-ledger": "Linhas suplementares (fá)",
    "grand-staff": "As duas claves",
    accidentals: "Acidentes",
    "key-signatures": "Armaduras de clave",
    "c-clefs": "Claves de dó",
  },
  clefs: {
    treble: "de sol",
    bass: "de fá",
    alto: "de dó na terceira linha",
    tenor: "de dó na quarta linha",
  },
  prompt: "Que nota é esta?",
  hint: "Diga o nome da nota, sem a oitava. Aperte A–G para responder.",
  hintAccidentals: "Diga o nome da nota, sem a oitava. Escolha ♭ ♮ ♯ (teclas 1, 2, 3) e responda com A–G.",
  hintKey: "A armadura de clave vale: diga a nota como ela soa. Escolha ♭ ♮ ♯ (teclas 1, 2, 3) e responda com A–G.",
  staffAria: "Pauta com clave {clef} e uma nota para nomear",
  letters: "Nome da nota",
  accidental: {
    label: "Acidente",
    flat: "Bemol",
    natural: "Bequadro",
    sharp: "Sustenido",
  },
  correct: "Certo! É {note}.",
  wrong: "Quase. É {note}.",
  next: "Próxima nota",
  score: "Placar",
  accuracy: "{percent}% de acertos",
  streak: "Sequência {count}",
  bestStreak: "Melhor sequência: {count}",
};
