# WEB_REVIEW — Revisão de UI/UX e funcionalidades (apps/web)

> Revisão das 6 páginas da aplicação (2026-07-11): **Scale Explorer**, **Chord Explorer**,
> **Mode Explorer**, **Ear Training**, **Drills** e **Learn** (+ sub-rota de lição).
> Método: leitura de código de todas as páginas/componentes + verificação ao vivo no preview
> (desktop e 375px, console, medição de overflow e navegação).
> Companions: [UI_AUDIT.md](./UI_AUDIT.md) (2026-07-08) e
> [IMPLEMENTED_FEATURES_UI_PLAN.md](./IMPLEMENTED_FEATURES_UI_PLAN.md) (2026-07-09) — a grande
> maioria dos itens desses planos **já foi implementada**; este relatório traz apenas o que
> resta deles + achados novos.
> Legenda: 🔴 Alta · 🟠 Média · ⚪ Baixa. Marque `- [x]` conforme resolver.

---

## 1. Bugs / regressões (transversais)

- [x] 🔴 **Chave i18n quebrada `show-reduced-view`** — o toggle mobile do braço renderiza a
  chave crua e loga `[intlify] Not found 'show-reduced-view' key` no console. A chave não existe
  em nenhum dos dois locales e o formato (kebab-case, sem namespace) foge da convenção
  (`fretboard.showReducedView`).
  **Onde:** `apps/web/src/modules/shared/components/fretboard-diagram/FretboardDiagram.vue:243`
  **Correção:** criar `fretboard.showReducedView` em `en.ts`/`pt.ts` e usar a chave namespaced.

- [x] 🔴 **Atalhos globais de teclado capturam digitação em inputs.** `EarTrainingPage` e
  `LessonCheckpoint` registram `keydown` no `window` sem guard de origem: com o diálogo de
  Settings aberto (ou qualquer input futuro), digitar `1–4`, `r`, Espaço ou Enter no campo
  "Nome" responde o quiz / avança a questão por baixo do diálogo. O `Flashcard.vue:26` já tem o
  guard correto (`INPUT`/`TEXTAREA`) — os outros dois não.
  **Onde:** `EarTrainingPage.vue:55-78`, `LessonCheckpoint.vue:66-82`
  **Correção:** extrair um composable `useQuizKeyboard` com o guard do Flashcard (incluindo
  `isContentEditable` e, idealmente, ignorar quando um dialog Reka está aberto) e usar nos três.

- [x] 🔴 **Scroll não reseta ao trocar de página.** O container de rolagem é o `<main
  class="overflow-auto">`, então o `scrollBehavior` do vue-router (que atua na janela) não se
  aplica: navegar de uma página rolada para outra aterrissa no meio do conteúdo. Reproduzido ao
  vivo (`main.scrollTop` permanece 800 após navegar `/` → `/modes`).
  **Onde:** `apps/web/src/layouts/app-layout/AppLayout.vue:34`, `apps/web/src/router/index.ts`
  **Correção:** num `router.afterEach`, `document.querySelector('main')?.scrollTo(0, 0)` (ou dar
  a rolagem à janela e usar `scrollBehavior`).

- [x] 🟠 **Sem rota 404** — URL desconhecida renderiza `<main>` vazio ao lado da sidebar (tela
  em branco + warning do router). Verificado ao vivo em `/nonexistent-page`.
  **Onde:** `apps/web/src/router/index.ts:5-41`
  **Correção:** rota catch-all `{ path: "/:pathMatch(.*)*" }` com `EmptyState` + link para `/`.

- [x] 🟠 **`aria-label="Toggle small"` residual nos dois toggles do braço** — boilerplate do
  shadcn sobrepõe o rótulo visível (WCAG 2.5.3). Já apontado no audit anterior e ainda presente
  (agora em dobro, com o toggle de reduced view).
  **Onde:** `FretboardDiagram.vue:226,237`
  **Correção:** remover os `aria-label` — o texto visível vira o nome acessível.

---

## 2. Pendências do audit anterior que continuam abertas

- [x] 🔴 **Notas do `FretboardDiagram` e `ChordVoicingDiagram` seguem inoperáveis por teclado**
  (`<g>` só com `@click`; sem `tabindex`, `role`, Enter/Space) e o tooltip segue hover-only.
  `ChromaticWheel` e `DrillFretboard` já foram corrigidos — falta portar o mesmo padrão (item C1
  do UI_AUDIT, WCAG 2.1.1).
  **Onde:** `FretboardDiagram.vue:266`, `ChordVoicingDiagram.vue:107`
  **Correção:** replicar o padrão do `DrillFretboard` (tabindex, role="button", aria-label
  nota+intervalo, keydown, anel de foco SVG) e disparar o tooltip também em `focusin/focusout`.

- [x] 🟠 **TuningSelector segue código morto** — componente exportado e nunca montado; os três
  exploradores hardcodam `STANDARD_GUITAR_TUNING`. Havia presets prontos (Drop D, Half Step
  Down) desde o audit de 07-08.
  **Onde:** `modules/scale-explorer/components/tuning-selector/`, view-models dos exploradores
  **Correção:** reativar no Scale Explorer (e idealmente promover a uma preferência global de
  instrumento/afinação junto do preset de timbre em Settings) — ou deletar o componente.

- [x] ⚪ **ChordCard corta em 3 voicings sem indicar que há mais** (`shapes.slice(0, 3)`).
  **Onde:** `ChordCard.vue:24`
  **Correção:** contador "+N" que expande, ou scroll horizontal de voicings.

- [x] ⚪ **Linhas do Harmonic Field sem `focus-visible:ring`** — único controle interativo do app
  sem o anel de foco padrão.
  **Onde:** `HarmonicField.vue:75`
  **Correção:** adicionar `focus-visible:ring-2 focus-visible:ring-ring outline-none`.

---

## 3. Scale Explorer (`/`)

- [x] 🟠 **Não dá para ouvir a escala inteira** — o Mode Explorer tem "Listen to Ionian"
  (`playSequence`), mas a página de escalas, onde o recurso é mais óbvio, só toca nota a nota.
  **Onde:** `ScaleExplorerPage.vue` (importa só `play`); `use-note-audio.ts:151` já expõe `playSequence`
  **Correção:** botão "Ouvir escala" no header da seção de notas, mesmo tratamento visual do
  botão do Mode Explorer (ascendente; bônus: opção ascendente+descendente).

- [x] 🟠 **Não dá para ouvir o acorde selecionado do campo harmônico** — `playChord` (com strum)
  existe e é usado no Ear Training e nas lições, mas nos três exploradores não há nenhum botão de
  play de acorde; clicar num acorde só seleciona. Item E1 do audit ficou meio-implementado.
  **Onde:** `HarmonicField.vue`, `ChordCard.vue`; `use-note-audio.ts:135`
  **Correção:** ícone ▶ em cada linha do Harmonic Field (ou no ChordCard) chamando
  `playChord(chord.pitches, { strum: true })`.

- [x] ⚪ **Layout da coluna do braço desalinhado do resto** — o bloco do fretboard usa
  `lg:p-16` dentro de um wrapper próprio enquanto as demais seções alinham à esquerda; o
  `fret-range-selector` flutua sozinho à direita sem rótulo de seção (nas outras páginas ele fica
  num header com título "Fretboard").
  **Onde:** `ScaleExplorerPage.vue:67-73`
  **Correção:** dar à seção do braço o mesmo header eyebrow (`FRETBOARD`) usado no Chord
  Explorer, com o selector alinhado no header.

---

## 4. Chord Explorer (`/chords`)

- [x] 🟠 **Acorde inteiro não é audível** — mesmo achado da seção 3, mas aqui é mais grave: é a
  página *de acordes* e não há como ouvir o acorde que está sendo estudado (nem no card de
  shapes, nem no diagrama de voicing).
  **Onde:** `ChordExplorerPage.vue`, `ChordVoicingDiagram.vue`
  **Correção:** botão ▶ "Ouvir acorde" ao lado do heading SHAPES (notas teóricas) e um play por
  voicing (pitches reais do shape, com strum) no `ChordVoicingDiagram`.

- [x] ⚪ **Qualidades exibem só a fórmula** (`1 - b3 - 5`) — para iniciante, um nome curto
  ("minor", "sus4") ajudaria; hoje o nome só aparece no chip (`Cm`).
  **Onde:** `ChordQualitySelector.vue`
  **Correção:** tooltip ou sublabel com o nome da qualidade por extenso (i18n).

---

## 5. Mode Explorer (`/modes`)

- [x] 🟠 **Caption "The notes don't change" contradiz a seção logo acima.** A frase (verdadeira
  para modos *relativos* do tom-pai) é renderizada imediatamente abaixo do painel "Compare with
  another C mode", que é uma comparação *paralela* onde as notas **mudam** (C Ionian vs C Dorian
  destaca Eb/Bb como diferentes). Ao vivo a sequência lê: comparação destacando notas diferentes
  → "as notas não mudam". Confuso para exatamente o aluno que a página quer ensinar.
  **Onde:** `ModeExplorerPage.vue:234-236` (posição), locale `modeExplorer.notesUnchangedCaption`
  **Correção:** mover a caption para junto do seletor de modos/parent key (contexto relativo) e
  dar à comparação paralela sua própria explicação ("mesma tônica, notas diferentes").

- [x] 🟠 **Sem controle de casas no braço** — o store do Mode Explorer tem `fretCount` e o
  view-model o expõe, mas a página não renderiza o `FretRangeSelector` que Scale e Chord têm.
  Controle "fantasma": estado existe, UI não.
  **Onde:** `ModeExplorerPage.vue:248` (sem selector), `use-mode-explorer-store.ts:10`
  **Correção:** renderizar `<fret-range-selector v-model="fretCount" />` no header do braço,
  como nas outras páginas.

- [x] ⚪ **Pílulas de brilho com fundo hsl inline** — `brightnessTint()` gera
  `hsl(… / 0.16)` fixo, fora dos tokens de tema; no tema claro o tint fica quase invisível e a
  técnica destoa do design system.
  **Onde:** `ModeExplorerPage.vue:73-77`
  **Correção:** manter, mas derivar a opacidade/luminosidade de um token (ou validar contraste
  nos dois temas).

- [x] ⚪ **Nomes de modo não traduzidos** — decisão adiada registrada no plano de 07-09; registro
  para não se perder (afeta `ModeSelector`, brilho e comparação).

---

## 6. Ear Training (`/ear-training`)

- [x] 🟠 **Atalhos de teclado existem mas são indescobríveis.** A página implementa `1–4`,
  `R` (replay) e Enter/Espaço, mas nada na UI os menciona — enquanto Flashcards e Checkpoint
  mostram hint ("Space to reveal · 1 = Again…"). Quem mais se beneficia (prática repetitiva)
  nunca descobre.
  **Onde:** `EarTrainingPage.vue:55-78`; strings de hint já existem como padrão em
  `drills.flashcards.shortcutHint` / `learn.checkpointShortcutHint`
  **Correção:** linha `text-xs text-muted-foreground` sob as opções: "1–4 respondem · R repete ·
  Enter avança" (i18n nos dois locales).

- [x] ⚪ **Sem auto-play da questão seguinte.** Após "Next", o aluno precisa clicar Play de novo;
  como o gesto do clique em "Next" já satisfaz a autoplay policy, a próxima questão pode tocar
  sozinha (mantendo o primeiro play manual).
  **Onde:** `use-ear-training-view-model.ts` (`newQuestion`)
  **Correção:** tocar automaticamente em `newQuestion()` quando `hasPlayedFirst`.

- [x] ⚪ **Placar não indica que é por tipo de quiz.** O placar persiste por tipo (bom), mas ao
  alternar Intervals → Scales o número muda sem explicação.
  **Onde:** `EarTrainingPage.vue:110-114`
  **Correção:** rótulo "Score (Intervals): 3/4" ou tooltip.

---

## 7. Drills (`/drills`)

- [x] 🟠 **Drill de braço no mobile exige rolagem horizontal durante um jogo cronometrado.**
  O `DrillFretboard` mantém orientação horizontal com `overflow-x-auto` (único overflow da app a
  375px, verificado ao vivo), enquanto o `FretboardDiagram` das outras páginas vira vertical
  abaixo de `md`. Procurar notas contra o relógio rolando a tela é frustrante.
  **Onde:** `DrillFretboard.vue` (sem modo vertical); comparar com `FretboardDiagram.vue:49`
  **Correção:** portar o modo vertical (`useMediaQuery`) para o `DrillFretboard` — a geometria
  along/across do `FretboardDiagram` já resolve isso e os dois componentes merecem uma base comum.

- [x] ⚪ **Flashcards: prompt sem pergunta.** O card mostra só "b2" — o aluno precisa inferir o
  que se pede (nome? semitons?). Decks diferentes pedem respostas diferentes.
  **Onde:** `flashcard-decks.ts`, `Flashcard.vue:61`
  **Correção:** linha de contexto acima do prompt por deck ("Quantos semitons?", "Que intervalo
  é este?") via chave i18n do deck.

- [x] ⚪ **Note ID não toca a nota da resposta.** Revelar a resposta sem ouvir a nota desperdiça
  a chance de ligar visão→som (o app tem áudio em tudo que é lugar).
  **Onde:** `DrillsPage.vue:215-268` (seção noteId)
  **Correção:** ao responder, tocar a pitch alvo (`play(target.pitch)`).

---

## 8. Learn (`/learn` e `/learn/:lessonId`)

- [x] 🟠 **"Continue" não retoma o passo — sempre recomeça a lição do passo 0.** O progresso por
  passo existe (`markStepDone`), mas `stepIndex` reseta a 0 a cada visita. Numa lição de 6+
  passos, sair e voltar significa re-clicar Next N vezes.
  **Onde:** `use-lesson-view-model.ts:28-37`
  **Correção:** inicializar `stepIndex` no primeiro passo não concluído (dados já estão no
  `use-learn-store`).

- [x] 🟠 **Concluir uma lição não dá nenhum feedback.** No último passo, "Finish" faz
  `router.push("/learn")` seco — sem resumo do checkpoint, sem "lição concluída", sem indicar o
  próximo desbloqueio. O momento de recompensa (o ponto central de um trilho gamificado) não existe.
  **Onde:** `use-lesson-view-model.ts:109-112`
  **Correção:** passo final de conclusão (score do checkpoint + "próxima lição desbloqueada:
  Triads" + CTA direto para ela) antes de voltar ao mapa.

- [x] ⚪ **Score dos checkpoints é gravado mas nunca exibido.** `recordCheckpoint` persiste
  `correct/total` e nada na UI mostra (nem no card do TrackMap, nem ao revisitar).
  **Onde:** `use-learn-store.ts`, `TrackMap.vue`
  **Correção:** badge discreto no card ("Checkpoint 3/3") — também dá razão para revisitar.

- [x] ⚪ **Título da aba genérico na lição** — `document.title` fica "Learning Tracks · MUSICOM"
  em qualquer lição (meta da rota é estática).
  **Onde:** `router/index.ts:36-40`
  **Correção:** setar o título com o nome da lição no `afterEach` (ou na própria página).

- [x] ⚪ **Stepper de pontos não é navegável** — os dots indicam posição mas não são clicáveis
  para voltar a um passo já visto (a única volta é Previous repetido).
  **Onde:** `LessonStepper.vue`
  **Correção:** dots já concluídos viram botões (`<button>` + aria-label do tipo de passo).

---

## 9. Chrome / Settings / geral

- [x] ⚪ **Tema sem opção "System"** — só light/dark manual; o padrão de mercado é seguir o SO
  (`prefers-color-scheme`) até o usuário escolher.
  **Onde:** `SettingsDialog.vue:144-158`, `use-theme-store.ts`
  **Correção:** terceiro chip "System" que aplica via media query e reage a mudanças do SO.

- [x] ⚪ **Status de sync invisível fora do Settings.** O indicador (dot + label) está enterrado
  no fim do diálogo; um erro de sync passa despercebido indefinidamente.
  **Onde:** `SettingsDialog.vue:183-186`, `AppSidebar.vue:70-86`
  **Correção:** refletir estados `error`/`offline` num dot sobre o avatar do rodapé da sidebar
  (verde/âmbar não precisam aparecer).

- [x] ⚪ **SettingsDialog pode estourar a altura em telas baixas** — `max-w-md` centrado, muitas
  seções, sem `max-h`/`overflow-y-auto` (ex.: mobile landscape ~400px de altura).
  **Onde:** `SettingsDialog.vue:67-69`
  **Correção:** `max-h-[85vh] overflow-y-auto`.

- [x] ⚪ **Rotas lazy sem estado de loading** — em conexão lenta o `<main>` fica em branco
  durante o chunk (item do audit anterior, segue aberto; baixa prioridade em dev/local).
  **Onde:** `router/index.ts`, `AppLayout.vue`
  **Correção:** `<Suspense>`/fallback com skeleton mínimo no `router-view`.

---

## 10. Sugestões de novas funcionalidades (backlog de produto)

Ordenadas por relação valor/custo, aproveitando o que já existe:

1. **Play de acorde em todos os exploradores** (itens 3/4 acima) — `playChord` pronto; só UI.
2. **Preferência global de afinação/instrumento** — unifica o TuningSelector morto com o preset
   de timbre já existente no Settings; os 3 exploradores e os drills passam a respeitar.
3. **"Praticar isto" — ponte explorador → drills/ear-training.** O app tem deep-links
   explorador↔lição; falta a ponte para a prática: no Scale Explorer, "treinar estas notas no
   braço" (drill filtrado pela escala); no Chord Explorer, "adivinhar esta qualidade de ouvido".
4. **Retomar lição + celebração de conclusão** (item 8) — completa o loop do Learn.
5. **Compartilhar seleção** — botão "copiar link" nos exploradores usando o esquema de query do
   `explorer-deeplink.ts` (hoje o estado vive só no store persistido; URLs não são
   compartilháveis).
6. **Novos trilhos no Learn** — o Fundamentals termina em Modes; candidatos naturais com o domínio
   atual: pentatônicas/blues, inversões, progressões (o `detectTwoFiveOne` do domínio segue sem UI).

---

## Prioridade sugerida de ataque

1. **Seção 1 inteira** (bugs: i18n quebrada, keyboard-capture, scroll, 404, aria-label) — tudo
   pequeno e de correção mecânica.
2. **Áudio de acorde nos exploradores** (3/4) + **fret-range no Modes** (5) — inconsistências que
   um usuário nota em minutos de uso.
3. **Learn: retomar passo + feedback de conclusão** (8) — maior ganho de retenção.
4. **A11y do FretboardDiagram/ChordVoicingDiagram** (2) — última grande dívida do audit original.
5. Restante das seções por severidade.
