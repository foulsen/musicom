import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import {
  CHROMATIC_SCALE,
  Fretboard,
  Note,
  STANDARD_GUITAR_TUNING,
  type FretPosition,
  type SingleNote,
} from "@music-workspace/music-theory";

import { useStudyActivity } from "@/modules/learn/application/use-study-activity";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import { NOTE_ID_LEVELS, noteIdPool, type NoteIdLevelId } from "./note-id-levels";
import { chooseNoteIdPosition, positionKey, recordAnswer, summarizeByString } from "./note-id-sampling";
import { notePath } from "./note-path";
import { useDrillsStore } from "./use-drills-store";

/** As 12 notas cromáticas, sempre na mesma ordem — ordem fixa ajuda a memorizar a posição dos botões. */
export const NOTE_OPTIONS: SingleNote[] = [...CHROMATIC_SCALE];

/** Uma casa por vez, na afinação padrão: o jogo inverso do "find all" — aqui a posição é dada, a nota é a resposta. */
export function useNoteIdDrill() {
  const store = useDrillsStore();
  const { noteIdScore, noteIdStreak, noteIdBestStreak, noteIdStats, noteIdLevel, noteIdNaturalsOnly } =
    storeToRefs(store);
  const { play } = useNoteAudio();
  const { recordActivity } = useStudyActivity();

  const fretboard = new Fretboard(STANDARD_GUITAR_TUNING, 12);
  const positions = fretboard.positions();

  /** Posições sorteáveis no nível/filtro ativos. */
  const pool = computed(() => noteIdPool(positions, noteIdLevel.value, noteIdNaturalsOnly.value));

  /** Amostragem adaptativa: posições com mais erros (ou ainda inéditas) saem mais; nenhuma some (piso de peso). */
  const target = ref<FretPosition>(chooseNoteIdPosition(pool.value, noteIdStats.value));
  const selectedNote = ref<SingleNote | null>(null);

  const isAnswered = computed(() => selectedNote.value !== null);
  const isCorrect = computed(
    () => selectedNote.value !== null && target.value.pitch.note.equals(Note.from(selectedNote.value)),
  );

  /** De onde vem a nota da casa-alvo: corda solta + casas, passo a passo (para o feedback depois de responder). */
  const explanation = computed(() =>
    notePath(positions[target.value.string][0].pitch.note, target.value.fret),
  );

  /** Acerto por corda nas posições do nível ativo, da mais grave à mais aguda (rótulo = nota da corda solta). */
  const stringSummary = computed(() =>
    summarizeByString(pool.value, noteIdStats.value).map((entry) => ({
      ...entry,
      openNote: positions[entry.string][0].pitch.note.value,
      /** Numeração de violão: 6 = corda mais grave. */
      stringNumber: positions.length - entry.string,
    })),
  );

  function newRound() {
    target.value = chooseNoteIdPosition(pool.value, noteIdStats.value, Math.random, positionKey(target.value));
    selectedNote.value = null;
  }

  function setLevel(level: NoteIdLevelId) {
    if (noteIdLevel.value === level) return;

    noteIdLevel.value = level;
    newRound();
  }

  function setNaturalsOnly(value: boolean) {
    noteIdNaturalsOnly.value = value;
    newRound();
  }

  function answer(note: SingleNote) {
    if (isAnswered.value) return;

    selectedNote.value = note;
    recordActivity();
    noteIdScore.value.total += 1;

    const correct = target.value.pitch.note.equals(Note.from(note));
    noteIdStats.value = recordAnswer(noteIdStats.value, target.value, correct);

    if (correct) {
      noteIdScore.value.correct += 1;
      noteIdStreak.value += 1;
      noteIdBestStreak.value = Math.max(noteIdBestStreak.value, noteIdStreak.value);
    } else {
      noteIdStreak.value = 0;
    }

    play(target.value.pitch);
  }

  function resetScore() {
    noteIdScore.value.correct = 0;
    noteIdScore.value.total = 0;
  }

  return {
    positions,
    target,
    selectedNote,
    isAnswered,
    isCorrect,
    explanation,
    levels: NOTE_ID_LEVELS,
    level: noteIdLevel,
    setLevel,
    naturalsOnly: noteIdNaturalsOnly,
    setNaturalsOnly,
    stringSummary,
    score: noteIdScore,
    streak: noteIdStreak,
    bestStreak: noteIdBestStreak,
    newRound,
    answer,
    resetScore,
  };
}
