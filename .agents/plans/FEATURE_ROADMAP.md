# FEATURE_ROADMAP — Próximos passos (apps/web)

> Roadmap para atacar ponto a ponto. Marque `- [x]` conforme entregar.
> Companion: [UI_AUDIT.md](./UI_AUDIT.md) (pontos de UI a melhorar).
> Estado do desenvolvimento: [../state/WEB_STATE.md](../state/WEB_STATE.md).

- **Data:** 2026-07-08
- **Método:** ideação paralela em 4 lentes independentes (aproveitar-domínio, pedagogia,
  músico-prático, dataviz) → 28 ideias → deduplicação e priorização por impacto × esforço.
- **Legenda:** `[domínio]` = quanto o pacote `music-theory` já suporta (**já existe** / **parcial**
  / **novo**) · `[esforço]` S/M/L.
- **Tese central:** o **domínio está bem à frente da UI**. Há três "features fantasma" já
  implementadas no domínio e nunca renderizadas — **afinações** (TUNINGS), **funções harmônicas +
  tensões** (harmony) e **detecção de ii-V-I** (`detectTwoFiveOne`). Muito valor destrava a custo ~zero.

---

## 🚩 Aposta principal (flagship)

- [ ] **Progression Builder & Player com detecção de ii-V-I ao vivo** — `[página]` `[já existe]` `[L]`
  O app já embarca todo o módulo `harmony` (`ChordProgression`, `detectTwoFiveOne`,
  `HarmonicFunction`, `Tension`) e o view-model **já computa** `detectTwoFiveOne(scale.seventhChords())`
  — mas descarta o resultado; e como os acordes vêm em ordem de grau (1,2,3…7), um 2-5-1 **nunca**
  aparece consecutivo → a detecção sobre esse input é um **no-op silencioso**.
  **O que fazer:** página onde o usuário **sequencia** acordes diatônicos num `Chord[]` real (arrastar
  do Harmonic Field / `scale.seventhChords()`), roda a detecção sobre **essa** ordem, destaca cada
  II-V-I, define tempo e **ouve em loop** (strum + metrônomo), com templates I-IV-V / I-V-vi-IV /
  ii-V-I de um clique e animação de condução de vozes.
  **Valor:** transforma código morto na feature-carro-chefe; primeiro motivo para voltar todo dia.
  Vira também a casa do metrônomo, do looping e da animação de voice-leading.

---

## ✅ Quick wins (domínio já suporta · esforço S)

- [ ] **Reativar o TuningSelector** (Drop D / Half Step Down) — `[feature]` `[já existe]` `[S]`
  Descomentar o bloco em `ScaleExplorerPage.vue:47-51` e ligar `v-model`/`:tunings`; `availableTunings`,
  `selectedTuning` e `fretboard = computed(new Fretboard(selectedTuning))` já existem. Expor tuning
  também no Chord Explorer. *(fecha o gap E3 do UI_AUDIT)*

- [ ] **Botão "tocar acorde" (strum) em todo ChordCard** — `[feature]` `[já existe]` `[S]`
  Cada nota do shape já carrega um `Pitch` concreto (`chord-cards.ts` via `Fretboard.pitchAt`). Um
  `strum()` no `useNoteAudio` (stagger ~25ms, reusando a envelope atual) vira o **primitivo de áudio**
  de todas as features seguintes. *(fecha o gap E1)*

- [ ] **Painel "por que este acorde pertence ao tom"** — `[feature]` `[já existe]` `[S]`
  Ao selecionar um acorde do Harmonic Field, renderizar o que o domínio já calcula e a UI joga fora:
  `Degree.functionName()` (tônica/supertônica/…), `HarmonicFunction` (Tônica/Subdominante/Dominante),
  o empilhamento 1-3-5(-7) com `SpelledNote`, as `Tension[]` (9/11/#11/13) e o ii-V-I. *(surfaces das
  3 features fantasma; quase zero código de domínio)*

- [ ] **Destacar o papel das notas no braço (R/3/5/7)** — `[feature]` `[já existe]` `[S]`
  Classificar cada posição por distância à fundamental (Root/3ª/5ª/7ª), colorir e apagar não-acordes
  atrás de um toggle; botão de arpejo. Base da habilidade arpejo/CAGED.

- [ ] **Capo & Transpose** — `[feature]` `[parcial]` `[S]`
  Afinação com capo via `STANDARD_GUITAR_TUNING.strings.map(s => s.transpose(n))` alimentando o
  `Fretboard`; "forma que você toca" vs "tom que soa" (shift global via `Note.transpose`).

---

## 🔨 Médio (esforço M)

- [ ] **Círculo de Quintas interativo** — `[visualização]` `[parcial]` `[M]`
  Anel SVG de 12 fatias (mesma geometria computada do `FretboardDiagram`): maiores via
  `Note.transpose(7)`, relativas menores via `transpose(9)`. Clicar chama `selectRoot()/selectPattern()`
  e reconfigura o app; centro mostra a armadura contada de `createScale(root,MAJOR).spelledNotes()`.
  Também é o treinador de armaduras e a porta de entrada "escolher um tom" que falta.

- [x] **Roda cromática / de intervalos** — `[visualização]` `[já existe]` `[M]`
  12 notas num relógio, sombreadas por `scale.contains()`; modo intervalo desenha spokes
  (`root.distanceTo(note) → Interval.name()`); o acorde selecionado vira um polígono que mantém a
  forma ao transpor (ensina que acordes/escalas são formas transponíveis).
  *(implementado: `ChromaticWheel.vue` em `modules/shared/components`, embutido no Scale e Chord Explorer.)*

- [ ] **Teclado de piano sincronizado com o braço** — `[visualização]` `[já existe]` `[M]`
  Teclado SVG de 1-2 oitavas destacado por `scale.contains`, tônica na cor da marca, clique-para-tocar
  via `Pitch`+`useNoteAudio`; ref compartilhado de "pitch class destacada" faz cross-highlight fret↔tecla.

- [ ] **Harmonic Field de sétimas colorido por função** — `[visualização]` `[já existe]` `[M]`
  Toggle tríades/sétimas em `HarmonicField.vue` (troca `scale.triads()` por `scale.seventhChords()`),
  agrupando/colorindo por `harmonicFunction` (Tônica/Subdominante/Dominante).

- [ ] **"Que escala serve neste acorde?"** — `[página]` `[parcial]` `[M]`
  Inverso do campo harmônico: escolhe um acorde, itera os 11 patterns × raízes filtrando por
  `scale.contains()` cobrir todas as notas do acorde; resultado acende a escala no braço com as notas
  do acorde enfatizadas. Companheiro de improviso.

- [x] **Songbook + "Abrir no Chord Explorer"** — `[feature]` `[parcial]` `[M]`
  Biblioteca em `localStorage` de setups nomeados (root + pattern + tuning + capo), serializada de
  primitivas e re-hidratada via `createScale/createChord`; cada item faz deep-link no explorador certo.
  *(fecha os gaps E2 persistência e E5 cross-link de uma vez)*

- [x] **Suite de drills** (braço + flashcards SRS) — `[feature]` `[parcial]` `[M]`
  Jogo cronometrado no braço ("ache todos os G", validado por `Fretboard.positions()`/`Scale.contains()`)
  + baralho Leitner gerado do domínio (`ChordPattern.degrees`, `createChord().spelledNotes`,
  `Interval.name()`); pontuação persistida.
  *(implementado: página `/drills`, `modules/drills` — Leitner box genérico em `leitner.ts`, baralho
  gerado de `CHORD_PATTERNS`/`Degree` em `flashcard-decks.ts`, jogo de braço em `DrillFretboard.vue`.)*

- [x] **Explorador de modos** — `[visualização]` `[parcial]` `[M]`
  Os 7 modos de um tom-pai como um anel de 7 notas onde selecionar um modo apenas gira a tônica e
  recolore os graus; régua cromática comparando dois modos de mesma raiz (C Dorian vs C Aeolian)
  destacando o grau que muda, com áudio A/B e eixo de "brilho" (Lydian→Locrian).
  *(implementado: página `/modes`, novo helper de domínio `relativeModesOf()` em
  `packages/music-theory/src/scales/modes.ts` + `modules/mode-explorer` (seletor de modo, eixo de
  brilho, reaproveita Notes/Fretboard/Roda Cromática/Harmonic Field). Comparação A/B entre dois modos
  não incluída nesta rodada.)*

- [ ] **Metrônomo & looper** — `[feature]` `[novo]` `[M]`
  Barra de transporte (BPM, compasso, tap-tempo, acento no 1, count-in) num scheduler de `AudioContext`
  modelado na envelope atual; também é o relógio que avança a progressão 1 acorde/compasso.

---

## 🚀 Grandes apostas (esforço L)

- [ ] **Progression Builder & Player** — `[página]` `[já existe]` `[L]` — *ver flagship acima.*

- [x] **Ear Training Studio** — `[página]` `[parcial]` `[L]`
  `/ear-training` com quizzes de intervalo, qualidade de acorde e reconhecimento de escala: toca notas
  via `Note.transpose`+`Pitch.frequency`, `createChord(...)` arpejado/strummed, ou `createScale(...)`
  ascendente; opções rotuladas por `Interval.name()`/`ChordPattern.name`/`ScalePattern.name`, com
  feedback, replay e placar. Único código novo de áudio: um scheduler multi-pitch (compartilhado com `strum()`).
  *(implementado: `use-note-audio.ts` ganhou `playChord()`/`playSequence()` (scheduler multi-pitch
  compartilhado); `modules/ear-training` com gerador de questões, placar persistido e página com replay.)*

- [x] **Trilhas de aprendizado / lições guiadas** — `[página]` `[parcial]` `[L]`
  Currículo `/learn` (Escala maior & graus → Tríades → Campo diatônico → ii-V-I → Modos). Cada lição =
  explicação curta + deep-link pré-configurando os exploradores + checkpoint de 2-3 itens gerado do
  domínio; progresso em `localStorage`.
  *(implementado: ver `.agents/plans/LEARNING_TRACKS_PLAN.md`. Rotas `/learn` e `/learn/:lessonId`,
  `modules/learn` — currículo tipado com 5 lições (conceito + exploração inline + checkpoint de 2
  perguntas geradas do domínio), progresso persistido com gating linear, exploradores embutidos via
  `InlineExplorer` reaproveitando `ScaleNotes`/`ChromaticWheel`/`HarmonicField`/`ChordCard`. Deep-link
  bidirecional novo (`shared/application/explorer-deeplink.ts`) também hidrata Scale/Mode Explorer, que
  antes ignoravam a query string. ii-V-I entrega demo de áudio inline; deep-link para a flagship
  Progression Builder fica marcado como TODO até ela existir.)*

- [ ] **Renderização em pauta (staff notation)** — `[visualização]` `[parcial]` `[L]`
  Pauta SVG em clave de sol desenhando a escala (horizontal) ou o acorde (empilhado vertical): posição
  por `SpelledNote.letter` + `Pitch.octave` (com linhas suplementares), acidentes por
  `SpelledNote.accidental`, armadura agrupada. É a única representação que o app não tem e valoriza a
  grafia enarmônica (D# vs Eb) que o domínio já computa.

---

## Sequenciamento sugerido
1. **Quick wins de áudio + afinação + painel de função** — destravam valor imenso a custo ~zero e
   surfacem as 3 features fantasma.
2. **Círculo de Quintas** — porta de entrada "escolher um tom" + treinador de armaduras.
3. **Progression Builder (flagship)** — o grande salto de "referência" para "instrumento de prática diária".
4. Depois: Ear Training / Trilhas / demais visualizações conforme prioridade.

> Dependências úteis: `strum()`/scheduler multi-pitch é pré-requisito de Progression Player, Ear
> Training e Metrônomo — vale construí-lo primeiro e bem. Persistência (Songbook) destrava trilhas
> com progresso.
