import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";

import { Pitch } from "@music-workspace/music-theory";

import { useStudyActivity } from "@/modules/learn/application/use-study-activity";
import { useNoteAudio } from "@/modules/shared/application/use-note-audio";

import type { TermLabel } from "@/modules/shared/application/music-terms";

import { customSetForWeakItem } from "./custom-set";
import { cadenceTimeline, timelineDurationMs } from "./cadence";
import { parseEarTrainingQuery } from "./ear-training-link";
import { clearItemStats, recordItemAnswer, weakestItems } from "./item-stats";
import {
  MIN_CUSTOM_ITEMS,
  allItemsForKind,
  generateQuestion,
  itemIdsForDifficulty,
  orderScalePitches,
  resolveIntervalDescending,
  labelForItem,
  pitchesForItem,
  pitchesForOption,
  type Difficulty,
  type IntervalDirection,
  type Question,
  type QuizKind,
  type ScaleDirection,
} from "./question-generators";
import { pickQuestionSound, sequenceGapSeconds, type QuestionSound } from "./question-sound";
import { useEarTrainingStore } from "./use-ear-training-store";

/** Duração estimada do playback (ms), já que o composable de áudio não expõe fim/Promise. `tempo` > 1 encurta a sequência. */
function estimatePlaybackDurationMs(pitchCount: number, asChord: boolean, tempo = 1): number {
  return asChord ? 700 : pitchCount * sequenceGapSeconds(tempo) * 1000 + 200;
}

/** Fundamental fixa do painel de pontos fracos: ouvir o item "puro", sem sorteio de tom. */
const WEAK_ITEM_ROOT = () => Pitch.from("C", 4);

/** Quantos pontos fracos o painel lista. */
const WEAK_ITEMS_LIMIT = 3;

export interface WeakItemView {
  id: string;
  label: TermLabel;
  /** 0..100 */
  accuracyPercent: number;
  correct: number;
  total: number;
  confusion: { id: string; label: TermLabel; count: number } | null;
}

export function useEarTrainingViewModel() {
  const store = useEarTrainingStore();
  const { scores, streak, bestStreak, difficulty, intervalPlaybackMode, intervalDirection, scaleDirection, varySound } =
    storeToRefs(store);

  const { playChord, playSequence, playTimeline } = useNoteAudio();
  const { recordActivity } = useStudyActivity();

  const kind = ref<QuizKind>("interval");

  /** Todos os itens do tipo ativo, para o seletor "Personalizar". */
  const allItems = computed(() => allItemsForKind(kind.value));

  /** Seleção do tipo ativo, só com ids que ainda existem (ids antigos/sincronizados desconhecidos são ignorados). */
  const customItemIds = computed(() => {
    const selected = new Set(store.customItems[kind.value] ?? []);

    return allItems.value.map((item) => item.id).filter((id) => selected.has(id));
  });

  const customActive = computed(() => store.customActive[kind.value] === true);

  function freshQuestion(): Question {
    const generated = generateQuestion(kind.value, difficulty.value, {
      stats: store,
      intervalDirection: intervalDirection.value,
      // Com "Personalizar" desligado a dificuldade manda, mesmo que haja uma seleção guardada.
      customItemIds: customActive.value ? customItemIds.value : undefined,
    });

    // Com "Variar som" desligado a questão não carrega som: tudo toca como sempre, no instrumento do usuário.
    return varySound.value ? { ...generated, sound: pickQuestionSound() } : generated;
  }

  const question = ref(freshQuestion());
  const selectedOptionId = ref<string | null>(null);

  /** Liga durante o playback (estimado) para animar o botão Play; nunca tocou = estado inicial silencioso. */
  const isPlaying = ref(false);
  const hasPlayedFirst = ref(false);
  let playingTimeout: ReturnType<typeof setTimeout> | null = null;

  const isAnswered = computed(() => selectedOptionId.value !== null);
  const isCorrect = computed(() => selectedOptionId.value === question.value.correctId);

  /** Placar do tipo de quiz ativo (cada tipo persiste o seu, não um total global). */
  const score = computed(() => {
    // Placar salvo antes de um tipo de quiz existir não tem a chave dele.
    scores.value[kind.value] ??= { correct: 0, total: 0 };

    return scores.value[kind.value];
  });

  /** Contexto de playback além das alturas: direção do intervalo, tônica da cadência e som sorteado. */
  interface PlayContext {
    descending?: boolean;
    tonic?: Pitch;
    sound?: QuestionSound;
  }

  function playPitches(rawPitches: Pitch[], asChord: boolean, playedKind: QuizKind = kind.value, context: PlayContext = {}) {
    if (playingTimeout) clearTimeout(playingTimeout);

    isPlaying.value = true;
    hasPlayedFirst.value = true;

    // Sem som sorteado, `instrument` fica indefinido e o áudio usa o ajuste global; tempo 1 = andamento atual.
    const tempo = context.sound?.tempo ?? 1;
    const soundOptions = { instrument: context.sound?.instrument };

    let durationMs: number;

    if (playedKind === "scaleDegree" && context.tonic) {
      // Graus: cadência I–IV–V–I fixa o tom antes da nota-alvo.
      const timeline = cadenceTimeline(context.tonic, rawPitches, tempo);
      void playTimeline(timeline, [], soundOptions);
      durationMs = timelineDurationMs(timeline) + 200;
    } else {
      // Escalas e intervalos são gerados ascendentes; a direção é aplicada só na hora de tocar,
      // para que a fundamental (`pitches[0]`) continue sendo a referência de "ouvir sua resposta".
      let pitches = rawPitches;
      if (playedKind === "scale") pitches = orderScalePitches(rawPitches, scaleDirection.value);
      if (playedKind === "interval" && !asChord && context.descending) pitches = [...rawPitches].reverse();

      if (asChord) {
        playChord(pitches, { strum: true, ...soundOptions });
      } else {
        playSequence(pitches, { gapSeconds: sequenceGapSeconds(tempo), ...soundOptions });
      }

      durationMs = estimatePlaybackDurationMs(pitches.length, asChord, tempo);
    }

    playingTimeout = setTimeout(() => {
      isPlaying.value = false;
    }, durationMs);
  }

  /** Som da questão — só vale com "Variar som" ligado, então desligar a opção volta ao som padrão na hora. */
  const activeSound = computed(() => (varySound.value ? question.value.sound : undefined));

  /** Repetir e comparar respostas usam o mesmo som da questão, para a comparação ser justa. */
  function questionContext(): PlayContext {
    return { descending: question.value.descending, tonic: question.value.tonic, sound: activeSound.value };
  }

  function isChordPlayback(playedKind: QuizKind, playback: Question["playback"]) {
    return playback === "chord" || (playedKind === "interval" && intervalPlaybackMode.value === "harmonic");
  }

  function asChordPlayback() {
    return isChordPlayback(question.value.kind, question.value.playback);
  }

  /** Intervalo tocado junto (harmônico) quando o usuário escolhe esse modo; o resto segue o playback da questão. */
  function replay() {
    playPitches(question.value.pitches, asChordPlayback(), question.value.kind, questionContext());
  }

  /** Reouve a opção escolhida ou a correta, para comparar após errar (não altera o placar). */
  function playOption(optionId: string) {
    playPitches(pitchesForOption(question.value, optionId), asChordPlayback(), question.value.kind, questionContext());
  }

  function playYourAnswer() {
    if (selectedOptionId.value) playOption(selectedOptionId.value);
  }

  function playCorrectAnswer() {
    playOption(question.value.correctId);
  }

  /** Pontos fracos do tipo de quiz ativo (mín. de tentativas e ordenação em `weakestItems`). */
  const weakItems = computed<WeakItemView[]>(() => {
    const activeKind = kind.value;

    return weakestItems(store, activeKind, WEAK_ITEMS_LIMIT).map((item) => ({
      id: item.id,
      label: labelForItem(activeKind, item.id),
      accuracyPercent: Math.round(item.accuracy * 100),
      correct: item.correct,
      total: item.total,
      confusion: item.topConfusion
        ? { ...item.topConfusion, label: labelForItem(activeKind, item.topConfusion.id) }
        : null,
    }));
  });

  /** Toca um item (ou sua confusão) isolado, numa fundamental fixa — para comparar de ouvido. */
  function playItem(itemId: string) {
    const pitches = pitchesForItem(kind.value, itemId, WEAK_ITEM_ROOT());
    if (!pitches) return;

    playPitches(pitches, isChordPlayback(kind.value, kind.value === "chordQuality" ? "chord" : "sequence"), kind.value, {
      descending: intervalDirection.value === "descending",
      tonic: WEAK_ITEM_ROOT(),
    });
  }

  onUnmounted(() => {
    if (playingTimeout) clearTimeout(playingTimeout);
  });

  // Deep-link das lições (`?quiz=<tipo>&difficulty=<nível>`): aplica na montagem — sem tocar o áudio,
  // já que ninguém interagiu ainda — e limpa a query, como os exploradores fazem.
  const route = useRoute();
  const router = useRouter();

  onMounted(() => {
    const config = parseEarTrainingQuery(route.query);

    if (config.kind) kind.value = config.kind;
    if (config.difficulty) difficulty.value = config.difficulty;
    if (config.kind || config.difficulty) {
      question.value = freshQuestion();
      selectedOptionId.value = null;
    }

    if ("quiz" in route.query || "difficulty" in route.query) {
      const { quiz: _quiz, difficulty: _difficulty, ...rest } = route.query;
      router.replace({ query: rest });
    }
  });

  function newQuestion() {
    question.value = freshQuestion();
    selectedOptionId.value = null;
    replay();
  }

  function selectKind(next: QuizKind) {
    if (kind.value === next) return;

    kind.value = next;
    newQuestion();
  }

  function selectDifficulty(next: Difficulty) {
    if (difficulty.value === next) return;

    difficulty.value = next;
    newQuestion();
  }

  function storeCustomItems(forKind: QuizKind, ids: string[]) {
    store.customItems = { ...store.customItems, [forKind]: ids };
  }

  /**
   * Liga/desliga "Personalizar" no tipo ativo. Ao ligar com menos de `MIN_CUSTOM_ITEMS` itens escolhidos,
   * parte do pool da dificuldade atual, para o modo já nascer utilizável.
   */
  function setCustomActive(active: boolean) {
    if (customActive.value === active) return;

    if (active && customItemIds.value.length < MIN_CUSTOM_ITEMS) {
      storeCustomItems(kind.value, itemIdsForDifficulty(kind.value, difficulty.value));
    }

    store.customActive = { ...store.customActive, [kind.value]: active };
    newQuestion();
  }

  /** Marca/desmarca um item. Com o modo ligado, não deixa cair abaixo do mínimo e re-sorteia a questão. */
  function toggleCustomItem(id: string) {
    const current = customItemIds.value;

    if (current.includes(id)) {
      if (customActive.value && current.length <= MIN_CUSTOM_ITEMS) return;

      storeCustomItems(kind.value, current.filter((item) => item !== id));
    } else {
      const next = new Set([...current, id]);

      storeCustomItems(kind.value, allItems.value.map((item) => item.id).filter((itemId) => next.has(itemId)));
    }

    // Com o modo desligado a seleção só é guardada: a questão atual não depende dela.
    if (customActive.value) newQuestion();
  }

  /** Atalho dos pontos fracos: liga "Personalizar" com o item, sua confusão e os outros pontos fracos. */
  function drillWeakItem(itemId: string) {
    const weak = weakItems.value.find((item) => item.id === itemId);
    if (!weak) return;

    storeCustomItems(
      kind.value,
      customSetForWeakItem({
        itemId,
        confusionId: weak.confusion?.id,
        otherWeakIds: weakItems.value.filter((item) => item.id !== itemId).map((item) => item.id),
        poolIds: itemIdsForDifficulty(kind.value, difficulty.value),
        validIds: allItems.value.map((item) => item.id),
      }),
    );
    store.customActive = { ...store.customActive, [kind.value]: true };
    newQuestion();
  }

  /** Vale já para a questão atual: re-sorteia só a direção, sem trocar o intervalo. */
  function selectIntervalDirection(next: IntervalDirection) {
    intervalDirection.value = next;

    if (question.value.kind === "interval") {
      question.value = { ...question.value, descending: resolveIntervalDescending(next) };
    }
  }

  function selectScaleDirection(next: ScaleDirection) {
    scaleDirection.value = next;
  }

  /** Vale a partir da próxima questão; a atual segue com o som que já tem. */
  function toggleVarySound() {
    varySound.value = !varySound.value;
  }

  function selectIntervalPlaybackMode(next: "harmonic" | "melodic") {
    intervalPlaybackMode.value = next;
  }

  function answer(optionId: string) {
    if (isAnswered.value) return;

    selectedOptionId.value = optionId;
    recordActivity();
    score.value.total += 1;
    recordItemAnswer(store, kind.value, question.value.correctId, optionId);

    if (optionId === question.value.correctId) {
      score.value.correct += 1;
      streak.value += 1;
      bestStreak.value = Math.max(bestStreak.value, streak.value);
    } else {
      streak.value = 0;
    }
  }

  /** Zera o placar (acertos/total) e o histórico por item só do tipo de quiz ativo. */
  function resetScore() {
    score.value.correct = 0;
    score.value.total = 0;
    clearItemStats(store, kind.value);
  }

  return {
    kind,
    question,
    selectedOptionId,
    isAnswered,
    isCorrect,
    score,
    streak,
    bestStreak,
    difficulty,
    intervalPlaybackMode,
    intervalDirection,
    scaleDirection,
    varySound,
    activeSound,
    isPlaying,
    hasPlayedFirst,
    weakItems,
    customActive,
    customItemIds,
    allItems,

    replay,
    newQuestion,
    selectKind,
    selectDifficulty,
    setCustomActive,
    toggleCustomItem,
    drillWeakItem,
    selectIntervalPlaybackMode,
    selectIntervalDirection,
    selectScaleDirection,
    toggleVarySound,
    answer,
    resetScore,
    playYourAnswer,
    playCorrectAnswer,
    playItem,
  };
}
