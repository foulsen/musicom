# Plano de melhorias — features já implementadas do FEATURE_ROADMAP

> Revisão de código (2026-07-09) das 4 entregas marcadas `[x]` no [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md):
> **Roda cromática**, **Suite de drills**, **Explorador de modos** e **Ear Training Studio**.
> Nenhuma linha implementada — apenas achados e plano. Prioridade: **P0** = bug de correção
> (o app ensina errado) · **P1** = alto valor/baixo custo · **P2** = qualidade/UX · **P3** = refactor/testes.

---

## 1. Ear Training Studio (`modules/ear-training`)

É a feature com os problemas mais sérios: **três bugs de correção musical** derivados do mesmo
padrão — converter `Note` (sem oitava) para `Pitch.from(note.value, 4)` com oitava fixa. Como
`Note.transpose` faz wrap módulo 12, qualquer sequência que cruza B→C "cai" de oitava.

### P0 — Bugs de correção

- [x] **Questão de intervalo pode tocar o intervalo errado** — `question-generators.ts:100`.
  `root.transpose(semitones)` wrapa a pitch class e o alvo é colocado na **mesma** oitava 4.
  Ex.: raiz B + M2 → alvo C#4, que é *mais grave* que B4 → o usuário ouve uma **7ª menor
  descendente** rotulada como "2ª maior". Pior: `semitones = 12` (oitava) produz a **mesma pitch
  na mesma oitava** → toca uníssono e chama de oitava.
  **Fix:** construir o alvo com `Pitch.from(root.value, 4).transpose(semitones)` (o domínio já
  tem `Pitch.transpose` correto em `pitch.ts:26`), nunca via `Note` + oitava fixa.

- [x] **Questão de escala toca com salto de oitava no meio** — `question-generators.ts:140`.
  `scale.notes()` mapeado para oitava 4: qualquer escala com raiz ≠ C desce de registro ao cruzar
  B→C (ex.: G maior toca G4 A4 B4 **C4** D4…), destruindo o contorno ascendente que o ouvido
  usa para reconhecer o padrão.
  **Fix:** derivar as pitches acumulando os semitons dos degraus a partir de `Pitch.from(root, 4)`
  (ou expor um `scale.pitchesFrom(octave)` no domínio) e fechar com a tônica na oitava acima.

- [x] **Questão de acorde toca inversões acidentais** — `question-generators.ts:120`.
  Mesmo wrap: B maior vira {B4, D#4, F#4} onde D#4/F#4 estão *abaixo* da fundamental → soa uma
  inversão aleatória dependendo da raiz sorteada. Qualidades como m7 vs m7b5 ficam bem mais
  difíceis/inconsistentes do que o quiz pretende.
  **Fix:** empilhar a partir da fundamental via `Pitch.transpose` com os semitons de
  `pattern.degrees` (mesma solução dos itens acima — vale um helper único `pitchesFor(root, semitones[])`).

- [x] **Opções de escala com duplicatas sonoras** — `question-generators.ts:48-60`.
  `SCALE_OPTIONS` inclui **Major e Ionian** e **Natural Minor e Aeolian** — pares com intervalos
  idênticos (confirmado em `scale-patterns.ts`). Um distrator pode ser *aurally idêntico* à
  resposta correta: o usuário ouve, responde "Aeolian", e o app marca errado porque a resposta era
  "Natural Minor". Pergunta injusta/impossível.
  **Fix:** manter só um nome canônico por conjunto de intervalos no pool (ou agrupar aliases e
  aceitar qualquer um do grupo como correto).

### P1

- [x] **Placar por tipo de quiz** — `use-ear-training-store.ts` guarda `correct/total` globais,
  mas o próprio comentário do store diz "por tipo de quiz". Persistir `Record<QuizKind, {correct, total}>`
  (+ streak atual/recorde) e exibir o placar do quiz ativo.
- [x] **`resetScore` é dead code** — exposto pelo view-model (`use-ear-training-view-model.ts:54`)
  e não usado na página. Adicionar botão "zerar placar" (ou remover a função).
- [x] **Variar o registro** — sortear a oitava de playback (3–5) por questão, em vez de fixar 4,
  para o ouvido não ancorar em frequências absolutas.

### P2

- [x] **Progressão de dificuldade**: começar com um subconjunto de intervalos/qualidades e
  desbloquear conforme acurácia (os dados por tipo do item P1 viabilizam isso). Alternativa
  simples: seletor de "pool" (fácil/médio/difícil).
- [x] **Atalhos de teclado** (1–4 para opções, R para replay, Enter para próxima) — a página é de
  prática repetitiva; mouse-only cansa.
- [x] **Modo intervalo harmônico vs melódico** (tocar junto ou em sequência) — `playChord` já existe.
- [x] **Auto-replay da primeira questão ao entrar** não é possível (autoplay policy exige gesto);
  deixar isso explícito na UI ("clique em Play para ouvir") em vez do prompt atual estático.

---

## 2. Suite de drills (`modules/drills`)

Lógica Leitner correta e bem isolada ([leitner.ts](../../apps/web/src/modules/drills/application/leitner.ts)).
Os problemas estão na fila de revisão, no escopo do drill de braço e em UX.

### P1

- [x] **Drill de braço cobre só 5 das 12 notas** — `use-fretboard-drill.ts:10-12` deriva
  `TARGET_NOTES` das cordas soltas (E, A, D, G, B). O roadmap pede "ache todos os G" genérico;
  notas com acidente (as mais difíceis de localizar!) nunca são sorteadas.
  **Fix:** sortear de `CHROMATIC_SCALE` (12 notas), com toggle "só naturais" para iniciantes.
- [x] **Recorde global compara alvos incomparáveis** — `fretboardBestMs` é um único número, mas
  num braço de 12 casas cada pitch class aparece 6 ou 7 vezes e a dificuldade varia por nota.
  **Fix:** persistir `Record<noteValue, bestMs>` e mostrar o recorde da nota atual (mantém o
  incentivo justo; some com o viés de "só jogar quando cai E").
- [x] **Fila de flashcards instável** — `use-flashcard-drill.ts:33` usa
  `currentIndex % activeQueue.length` sobre uma fila **recomputada e re-ordenada** a cada `grade()`
  (o card sai/entra de `dueCards` e o sort por `dueAt` muda). Resultado: cartões pulados ou
  repetidos dentro da mesma sessão.
  **Fix:** materializar a fila da sessão uma vez (snapshot dos devidos ao abrir a página) e
  consumi-la como fila de verdade; erros re-enfileiram no fim.
- [x] **Feedback de áudio no drill de braço** — cada posição tem `position.pitch`; tocar a nota ao
  acertar (via `useNoteAudio.play`) reforça a associação nota↔som quase de graça e conecta com a
  tese do roadmap de que o strum/áudio é o primitivo compartilhado.

### P2

- [x] **Contador "devidos" não atualiza com o tempo** — `dueCards` depende de `Date.now()` dentro
  de `computed`, que só reavalia quando `cardStates` muda. Para sessões longas é aceitável, mas
  vale um `now` reativo (ref atualizado por minuto) para o badge não mentir.
- [x] **Ampliar os baralhos** (`flashcard-decks.ts`): hoje são ~11 intervalos + fórmulas de acorde.
  O roadmap cita também `createChord().spelledNotes()` (soletração de acordes: "C7 = C E G Bb") e
  `Interval.name()` inverso (nome → semitons). Gerar 2 baralhos novos do domínio e permitir
  escolher o baralho ativo (a UI atual mistura tudo num deck só).
- [x] **`wrongKey` não expira** — o vermelho fica até o próximo clique. Timeout curto (~600ms) ou
  limpar no próximo acerto melhora a leitura do jogo. Considerar também contar erros na pontuação
  (hoje errar não custa nada além do tempo).
- [x] **DrillFretboard sem referências visuais** — `DrillFretboard.vue` não tem marcadores de casa
  (3/5/7/9/12), nomes de corda nem espessura diferenciada; exatamente as âncoras que o aluno usa
  para se localizar. Também duplica a geometria do `FretboardDiagram` — avaliar extrair a base SVG
  compartilhada (grade + cordas + marcadores) e deixar só a camada de células clicáveis no drill.
- [x] **i18n**: `aria-label="Fretboard drill"` hardcoded em `DrillFretboard.vue:94`.

### P3

- [x] **Testes unitários**: `leitner.ts` (avanço/regressão de caixa, `dueAt`) e a fila do
  flashcard drill são lógica pura sem nenhum teste — não existe um único `*.spec.*` em `apps/web`.
  Mesmo vale para `question-generators.ts` (nº de opções, distratores distintos, resposta presente)
  e `random.ts`.

---

## 3. Explorador de modos (`modules/mode-explorer`)

Arquitetura sólida (store persistido, view-model, reuso de Notes/Fretboard/Wheel/HarmonicField).
As melhorias são de coerência e de completar a visão do roadmap.

### P1

- [x] **Roda cromática com grafia inconsistente** — o view-model já computa `spelledByPitchClass`
  (`use-mode-explorer-view-model.ts:62-68`) e usa no braço, mas `ModeExplorerPage.vue:81` não passa
  `label-by-pitch-class` à `ChromaticWheel` → o braço mostra "Bb" e a roda mostra "A#" para o mesmo
  modo. Passar o mapa (mesmo gap existe no Scale/Chord Explorer — ver seção 4).
- [x] **Botão "ouvir o modo"** — `playSequence` já existe e a página não o usa; tocar a escala do
  modo ao selecioná-lo (ou via botão) é o coração pedagógico da página ("ouvir o brilho") e custa
  ~10 linhas. Pré-requisito natural da comparação A/B.

### P2

- [x] **Eixo de brilho clicável** — a lista Lydian→Locrian (`ModeExplorerPage.vue:59-72`) é
  read-only; clicar num nome deveria selecionar o modo (é o segundo seletor natural da página, e
  hoje parece interativo mas não é).
- [x] **Comparação A/B de dois modos de mesma raiz** — registrada no próprio roadmap como não
  incluída. Com `playSequence` + régua cromática destacando o grau que muda (C Dorian vs C Aeolian:
  6ª), fecha a entrega original. Planejar como um segundo bloco da página, não outra rota.
- [x] **Toggle tríades/sétimas no Harmonic Field** — o roadmap tem item próprio para isso; o Mode
  Explorer se beneficia imediatamente (modos são o contexto onde m7b5 vs 7 importa). Implementar
  no `HarmonicField.vue` compartilhado.

### P3

- [x] **`BRIGHTNESS_ORDER` por nome-string é frágil** — `use-mode-explorer-view-model.ts:20`
  compara `pattern.name` com strings locais; se o domínio renomear um pattern, o rank quebra
  silenciosamente (`indexOf` → -1). Mover a ordem de brilho para o domínio (`modes.ts`, junto de
  `MAJOR_SCALE_MODE_PATTERNS`) ou derivá-la dos intervalos (nº de graus maiores/aumentados).
- [x] **API do view-model com duplicação** — expõe `selectParentRoot`/`selectMode` e também os
  `computed` writáveis usados via `v-model`; a página usa só um dos caminhos. Escolher um estilo
  (v-model) e remover as funções mortas.

---

## 4. Roda cromática (`modules/shared/components/chromatic-wheel`)

Componente bem construído (acessibilidade com `role`/`tabindex`/teclado, polígono de forma,
modo intervalo). Melhorias de consumo e polish.

### P1

- [x] **Nenhum consumidor passa `labelByPitchClass`** — a prop existe (`ChromaticWheel.vue:15`)
  mas Scale Explorer, Chord Explorer e Mode Explorer não a fornecem → em tons bemóis a roda rotula
  tudo com sustenidos, contradizendo o braço/notas na mesma tela (o app "ensina errado" a grafia).
  Passar o mapa de `spelledNotes()` que os três view-models já sabem calcular.

### P2

- [x] **Colisão de rótulos no modo intervalo** — com escalas de 7 notas, os textos m2/M2 (e m7/M7)
  ficam sobrepostos perto da tônica, pois todos os spokes saem do mesmo ponto. Deslocar o rótulo
  ao longo do spoke proporcionalmente (ex.: 60% do caminho + pequeno offset perpendicular
  alternado) ou renderizar os rótulos num anel externo.
- [x] **Feedback visual ao tocar** — clique toca a nota mas nada acontece visualmente; um pulso
  transitório (classe CSS por ~300ms) fecha o loop de interação. Vale o mesmo para a nota tocada
  pelo braço se houver cross-highlight no futuro (item "piano sincronizado" do roadmap).
- [x] **Oitava de playback fixa em 4** — aceitar prop opcional `playbackOctave` (o Chord Explorer
  poderia tocar no registro do voicing selecionado).

### P3

- [x] **`SHORT_INTERVAL_NAMES` duplica conhecimento do domínio** — `ChromaticWheel.vue:30-43`
  redefine a tabela de nomes curtos que `Interval` já conhece por extenso. Mover para o domínio
  (`Interval.shortName()`) — o Fretboard/painel de funções (roadmap) vai precisar dos mesmos
  rótulos R/3/5/7.

---

## 5. Transversal

### P1

- [x] **`useNoteAudio` cria um `AudioContext` por chamada do composable** — `use-note-audio.ts:4`;
  cada página que monta (`ScaleExplorer`, `ChordExplorer`, `ModeExplorer`, `EarTraining`…) instancia
  o seu, e nenhum é fechado ao desmontar. Browsers limitam AudioContexts simultâneos (~6 no Chrome);
  navegar entre páginas pode esgotar o limite e silenciar o app.
  **Fix:** singleton em escopo de módulo (um contexto para o app inteiro) — também abre caminho
  para um master gain/volume e para o scheduler do metrônomo do roadmap.

### P2

- [x] **Volume/timbre centralizados** — gain fixo `0.2` e onda `triangle` hardcoded no scheduler;
  com o singleton acima, expor master volume (persistido) beneficia todas as features de áudio.

### P3

- [x] **Zero testes em `apps/web`** — as quatro features adicionaram bastante lógica pura
  (leitner, decks, geradores de questão, random, relativeModesOf já no domínio). Montar o harness
  de teste do app (vitest, mesmo runner do domínio) e cobrir primeiro os P0 desta lista — os bugs
  de oitava do Ear Training teriam sido pegos por um teste de "pitches são estritamente ascendentes".

---

## Sequenciamento sugerido

1. **P0 do Ear Training** (helper único `pitchesFor` + dedup de escalas) — o app está ensinando
   intervalos/escalas errados hoje; é correção, não melhoria.
2. **Singleton de áudio** — pré-requisito barato de tudo que toca som (inclusive Progression
   Builder/Metrônomo do roadmap).
3. **P1 de coerência** (labels enarmônicos na roda ×3 páginas, ouvir o modo, drill com 12 notas +
   recorde por nota, fila estável de flashcards, placar por quiz).
4. **P2/P3** conforme a agenda — os refactors (SVG de braço compartilhado, `Interval.shortName()`,
   brilho no domínio) rendem mais se feitos junto das features do roadmap que tocarão nos mesmos
   arquivos (painel de funções, piano, metrônomo).
