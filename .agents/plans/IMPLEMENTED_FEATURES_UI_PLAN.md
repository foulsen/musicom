# Plano de melhorias de UI/UX — features já implementadas do FEATURE_ROADMAP

> Revisão de UI (2026-07-09) das 4 entregas marcadas `[x]` no [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md):
> **Roda cromática**, **Suite de drills**, **Explorador de modos** e **Ear Training Studio**.
> Escopo: **apenas visualização e experiência de usuário** — bugs de lógica/correção musical estão no
> plano irmão [IMPLEMENTED_FEATURES_IMPROVEMENT_PLAN.md](./IMPLEMENTED_FEATURES_IMPROVEMENT_PLAN.md).
> Companion: [UI_AUDIT.md](./UI_AUDIT.md) (padrões A–E citados abaixo valem também para estas páginas).
> Severidade no padrão do audit: 🔴 Alta · 🟠 Média · ⚪ Baixa.
>
> **Status (2026-07-09):** 29/33 itens implementados. 4 adiados intencionalmente:
> transposição animada da roda cromática (exigiria redesenho da geometria fixa dos nós),
> tradução dos nomes de modo (decisão pendente do audit maior), a nota de prioridade da
> sidebar mobile (sem correção própria — só registro, tratada no audit A1), e o composable
> unificado de pulso de nota (cada área já implementou seu próprio pulso ad hoc; baixo ganho
> para o risco de mais um refactor agora).

---

## 1. Roda cromática (`shared/components/chromatic-wheel/ChromaticWheel.vue`)

- [x] 🔴 **Foco de teclado invisível nos nós SVG.** Os `<g>` têm `tabindex="0"`/`role="button"`
  (bom!), mas a classe é `outline-none` **sem nenhum estilo `focus-visible` substituto** — quem
  navega por Tab não vê onde está (regressão do padrão C do audit).
  **Onde:** `ChromaticWheel.vue:165`
  **Correção:** anel de foco SVG — um `<circle>` extra com `stroke-ring` renderizado quando o grupo
  tem `:focus-visible` (via classe `group` + `group-focus-visible:opacity-100`), raio `NOTE_RADIUS + 3`.

- [x] 🔴 **Sem feedback visual ao tocar uma nota.** Clique/Enter só emite áudio — quem está sem som
  (ou surdo) não recebe nada; e nada sinaliza que os círculos são clicáveis além do cursor.
  **Onde:** `ChromaticWheel.vue:93-95,162-202`
  **Correção:** pulso transitório na nota tocada (~300ms: scale/glow via classe temporária ou
  `<animate>`) + microdica "clique para ouvir" no header (mesmo tratamento do item C3/E "sem
  confirmação visual" do audit — resolver com o mesmo componente/composable de pulso).

- [x] 🟠 **Rótulos de intervalo colidem no modo intervalo.** Todos os spokes saem da tônica; para
  escalas de 7 notas os textos `m2/M2` (e `m7/M7`) se sobrepõem entre si e com o polígono
  (font-size 10, sem fundo).
  **Onde:** `ChromaticWheel.vue:148-157`
  **Correção:** posicionar o rótulo a ~62% do spoke com offset perpendicular alternado, e dar um
  "halo" ao texto (`paint-order: stroke` + stroke na cor do background) para legibilidade sobre o
  polígono.

- [ ] 🟠 **Transposição sem animação — a tese pedagógica se perde.** O roadmap vende "o polígono
  mantém a forma ao transpor", mas ao trocar a raiz o polígono simplesmente pisca para a nova
  posição; a *rotação* (que é o que ensina) nunca é vista.
  **Onde:** `ChromaticWheel.vue:86-91,135`
  **Correção:** transição CSS no path (`transition: d` não anima; usar `transform: rotate()` num
  `<g>` que embrulha polígono+spokes, rotacionando `30° × Δsemitons`, com os nós fixos) — a forma
  visivelmente "gira" ao mudar raiz/modo.

- [x] 🟠 **Tônica não se distingue por forma, só por cor.** `fill-brand` vs `fill-brand-soft` é a
  única diferença — fraca para daltônicos e em telas ruins (WCAG 1.4.1: cor como único meio).
  **Onde:** `ChromaticWheel.vue:173-185`
  **Correção:** raio maior para a tônica (ex.: 24 vs 20) e/ou anel duplo; opcionalmente rotular
  "R" pequeno sob o nome da nota.

- [x] ⚪ **Rótulos do toggle pouco descritivos.** "Chromatic" descreve a roda inteira, não o modo
  (que é apenas "sem spokes").
  **Onde:** `ChromaticWheel.vue:111-122`; strings em `i18n/locales/*`
  **Correção:** renomear para "Notes" / "Intervals" (e PT "Notas" / "Intervalos").

- [x] ⚪ **Polígono sem legenda.** Usuário novo não sabe o que a forma rosa significa.
  **Onde:** `ChromaticWheel.vue:135`
  **Correção:** caption de 1 linha sob o SVG ("A forma da escala — repare que ela gira, não muda,
  ao transpor"), `text-xs text-muted-foreground`.

---

## 2. Suite de drills (`modules/drills`)

### Drill de braço

- [x] 🔴 **Braço "pelado": sem nomes de corda, sem marcadores de casa, sem indicação de corda solta.**
  Para *localizar* notas o aluno precisa das âncoras que todo braço real tem: bolinhas nas casas
  3/5/7/9/12, nomes das cordas (E A D G B e) à esquerda e distinção da coluna de cordas soltas
  (hoje é só um círculo flutuando antes do nut).
  **Onde:** `DrillFretboard.vue:87-145`
  **Correção:** adicionar marcadores de casa (círculos muted entre as cordas), rótulos de corda na
  margem esquerda, cabeçalho "0"/“open” na coluna solta e espessura de linha crescente para cordas
  graves — idealmente extraindo a base SVG do `FretboardDiagram` (grade+marcadores) para um
  componente compartilhado, deixando no drill só a camada de células clicáveis.

- [x] 🔴 **Células do drill inoperáveis por teclado e mudas para leitor de tela.** Círculos `<circle>`
  com `@click` apenas — sem `tabindex`, `role`, `aria-label` nem Enter/Space (mesmo padrão C1 do
  audit; aqui é pior porque o drill é *o* conteúdo da página). O `aria-label` do SVG ainda é
  hardcoded em inglês ("Fretboard drill").
  **Onde:** `DrillFretboard.vue:132-142` e `:94`
  **Correção:** cada célula vira controle (`tabindex="0"`, `role="button"`,
  `:aria-label` "corda X, casa Y"), com anel de foco SVG; mover o rótulo do SVG para i18n;
  anunciar acertos/erros numa região `aria-live="polite"` ("3 de 7 encontradas").

- [x] 🟠 **Alvo de toque de 24px.** `NOTE_RADIUS = 12` → círculos de 24px, quase metade do alvo
  mínimo recomendado (44px) — errar o dedo no celular vira "resposta errada".
  **Onde:** `DrillFretboard.vue:20`
  **Correção:** área de hit invisível maior por célula (círculo transparente r≈20 por cima) mantendo
  o visual; conferir a 375px (o `overflow-x-auto` já existe, mas falta *affordance* de scroll —
  gradiente de fade na borda direita ou dica "arraste →").

- [x] 🟠 **Feedback de jogo cru.** O erro pinta a célula até o próximo clique (sem expirar); acerto
  não tem micro-animação; progresso `(3/7)` é texto inline; o cronômetro é um `<p>` pequeno que
  **aparece e some**, deslocando o layout; e a conclusão é uma frase no mesmo slot do enunciado —
  não há momento de "vitória".
  **Onde:** `DrillsPage.vue:68-103`, `DrillFretboard.vue:80-84`
  **Correção:** shake/fade-out de ~500ms no erro; pop no acerto; barra de progresso fina sob o braço;
  cronômetro `font-mono tabular-nums` com slot reservado (sem layout shift) ao lado do botão;
  cartão de conclusão dedicado (tempo, delta vs recorde, CTA "Jogar de novo" + "Nova nota").

- [x] 🟠 **Estado inicial não convida.** Antes do primeiro "Start", a página mostra o braço inteiro
  clicável mas inerte (cliques são ignorados silenciosamente — `guess` retorna sem feedback).
  **Onde:** `use-fretboard-drill.ts:70`, `DrillsPage.vue:68-103`
  **Correção:** dim no braço (`opacity-50 pointer-events-none`) até o start, com overlay "Pressione
  Start" — ou o primeiro clique em qualquer célula inicia o jogo.

### Flashcards

- [x] 🟠 **Modo "prática livre" invisível.** Quando nada está devido, a fila cai para o baralho
  inteiro sem avisar — o contador diz "0 due of 24" mas os cartões continuam vindo, parecendo bug.
  **Onde:** `use-flashcard-drill.ts:25-28`, `DrillsPage.vue:105-119`
  **Correção:** banner/chip de estado ("Tudo revisado! 🎉 Praticando o baralho completo — próxima
  revisão em Xh") diferenciando revisão devida de prática livre.

- [x] 🟠 **Cartão sem contexto de progresso.** Não mostra a caixa Leitner do cartão (1–5), quantos
  restam na sessão, nem qualquer sensação de avanço; e a revelação é um "pop" seco (o texto da
  resposta aparece empurrando os botões).
  **Onde:** `Flashcard.vue`, `DrillsPage.vue:105-119`
  **Correção:** indicador de caixa (5 pontinhos, preenchidos até o nível), contador "cartão 3 de 12",
  transição de revelação (fade/flip curto) com altura estável (a resposta já reserva espaço).

- [x] ⚪ **Atalhos de teclado.** Espaço = revelar, `1`/`2` = errei/acertei — prática repetitiva pede
  mão no teclado (mesma família do item de atalhos do Ear Training).
  **Onde:** `DrillsPage.vue` (handler de teclado na seção flashcards)

### Página

- [x] 🟠 **A aba ativa (braço × flashcards) não sobrevive a navegação nem é linkável.** `section` é
  um `ref` local — voltar à página sempre reabre "fretboard", e não dá para linkar `/drills#flashcards`.
  **Onde:** `DrillsPage.vue:14`
  **Correção:** persistir no store de drills já existente ou refletir em `route.query.tab`.

---

## 3. Explorador de modos (`modules/mode-explorer`)

- [x] 🔴 **Eixo de brilho parece interativo mas não é.** As pílulas Lydian→Locrian usam o mesmo
  visual de chip dos toggle-groups selecionáveis da página (borda + `bg-card/40`, estado ativo
  `bg-brand-soft`) — o usuário clica e nada acontece. É *affordance* enganosa, e o eixo é o
  seletor de modo mais intuitivo da página.
  **Onde:** `ModeExplorerPage.vue:59-72`
  **Correção:** torná-lo clicável (seleciona o modo correspondente — mapear nome→índice) **e**
  gradiente visual de brilho (claro→escuro no fundo das pílulas) com extremos rotulados
  "☀ mais brilhante / 🌙 mais escuro"; setinha ou underline no ativo.

- [x] 🔴 **Grafias divergentes lado a lado.** O braço usa `spelledByPitchClass` mas a roda cromática
  não recebe `label-by-pitch-class` → mesma tela mostra "Bb" no braço e "A#" na roda (o view-model
  já computa o mapa; é só passar a prop). Vale igualmente para Scale e Chord Explorer.
  **Onde:** `ModeExplorerPage.vue:81`; idem `ScaleExplorerPage.vue:63`, `ChordExplorerPage.vue:66`
  **Correção:** passar `:label-by-pitch-class="spelledByPitchClass"` nas três páginas (expor o mapa
  nos view-models que ainda não expõem).

- [x] 🟠 **"Root" ambíguo.** O `RootNoteSelector` genérico seleciona a raiz do **tom-pai maior**,
  mas o usuário acaba de escolher "D Dorian" e vê "Root: C" — sem rótulo explicando a relação,
  parece contradição.
  **Onde:** `ModeExplorerPage.vue:48`; título do heading em `RootNoteSelector.vue`
  **Correção:** prop de título no `RootNoteSelector` ("Parent key (major)" / "Tom-pai (maior)") +
  linha-resumo sob os seletores: "D Dorian = notas de C maior começando no 2º grau".

- [x] 🟠 **A grande ideia (mesmas notas, tônica girando) não é comunicada.** Ao trocar de modo, o
  braço mantém as mesmas posições e só recolore a tônica — visualmente parece que "nada mudou".
  Sem transição nem texto, o insight central da página passa batido.
  **Onde:** `ModeExplorerPage.vue:75-83`
  **Correção:** animar a mudança de tônica (pulso na nova tônica no braço + rotação da roda — ver
  item da roda) e caption fixa: "As notas não mudam — só o ponto de partida".

- [x] 🟠 **Seletor de modo: 7 cartões grandes em grid de 4 → linha órfã e página longa.** No xl são
  4+3 cartões (buraco visual); no mobile é uma coluna de 7 cartões antes de qualquer conteúdo.
  **Onde:** `ModeSelector.vue:34-53`
  **Correção:** compactar — uma linha de 7 chips (nome + grau) com wrap no mobile, ou
  `grid-cols-7` no xl com cartões menores; o detalhe (root do modo) pode viver na linha-resumo do
  item anterior em vez de dentro de cada cartão.

- [ ] ⚪ **Nomes de modo não traduzem.** "Ionian/Dorian…" vêm de `pattern.name` (domínio, EN) —
  aceitável como termo técnico, mas o eixo de brilho e o seletor deveriam usar o mesmo caminho de
  i18n do resto se o produto for PT (decisão pendente do audit B).
  **Onde:** `ModeSelector.vue:46`, `ModeExplorerPage.vue:70`

---

## 4. Ear Training Studio (`modules/ear-training`)

- [x] 🔴 **Resultado sem `aria-live` e foco perdido ao responder.** Ao clicar numa opção, todos os
  botões ficam `disabled` (o foco do teclado evapora) e o "Correct!/Not quite" é um `<p>` comum —
  leitores de tela não anunciam nada (WCAG 4.1.3).
  **Onde:** `EarTrainingPage.vue:87-99`, `AnswerOptions.vue:37`
  **Correção:** região `aria-live="polite"` para o resultado; em vez de `disabled`, usar
  `aria-disabled` + ignorar cliques (mantém foco e permite ler as opções); mover o foco para o
  botão "Next" após responder.

- [x] 🔴 **Layout shift a cada resposta.** O bloco resultado+Next só existe após responder — a
  página cresce e os botões pulam; em seguida "Next" recolhe tudo de novo. Em uso repetitivo
  (dezenas de questões) o alvo do mouse nunca fica parado.
  **Onde:** `EarTrainingPage.vue:87-99`
  **Correção:** reservar o slot do rodapé do cartão (altura fixa, `visibility` em vez de `v-if`)
  para que Play/opções/Next fiquem sempre nas mesmas coordenadas.

- [x] 🟠 **O botão Play é pequeno demais para ser o centro da experiência.** Ouvir é a ação nº 1 e
  o replay é um botão secundário no canto; não há indicação visual de "tocando agora" nem contagem
  de quantas vezes ouviu.
  **Onde:** `EarTrainingPage.vue:70-77`
  **Correção:** botão Play grande e primário (ícone + "Ouvir de novo"), estado "tocando" (ícone
  animado/ondas) durante o playback — o scheduler sabe a duração total, dá para expor um
  `isPlaying` do composable de áudio.

- [x] 🟠 **Sem atalhos de teclado.** `1–4` responder, `R` replay, `Enter`/`Espaço` próxima — o quiz
  é a página mais repetitiva do app e hoje exige mouse para tudo.
  **Onde:** `EarTrainingPage.vue`
  **Correção:** handler de teclado na página + hint discreto nos botões (kbd `1`…`4` no canto de
  cada opção).

- [x] 🟠 **Feedback de erro não ensina.** Errou → a certa acende verde e a sua acende vermelho, mas
  não há como **re-ouvir comparando** ("era uma 6ª maior — ouça a diferença") nem estatística de
  quais intervalos você mais erra.
  **Onde:** `EarTrainingPage.vue:87-99`, `use-ear-training-view-model.ts`
  **Correção:** no estado errado, botões "ouvir sua resposta" / "ouvir a correta" (gerar as pitches
  da opção escolhida); placar por tipo já está no plano irmão — na UI, mostrar acurácia % e streak
  ao lado do score.

- [x] 🟠 **Placar é texto solto e sem hierarquia.** "7 / 10" não diz o que é sem ler a chave i18n;
  não há % nem streak nem reset visível (a função existe e não tem botão).
  **Onde:** `EarTrainingPage.vue:59-61`
  **Correção:** mini-stat ("Acertos 7/10 · 70% · 🔥3") com botão de reset discreto (ícone) —
  consome o `resetScore` órfão apontado no plano irmão.

- [x] ⚪ **Primeira visita silenciosa.** Entra-se na página com uma pergunta "armada" e nenhum som
  (autoplay bloqueado); o prompt "What interval is this?" se refere a algo que ainda não tocou.
  **Onde:** `EarTrainingPage.vue:64-78`
  **Correção:** estado inicial explícito: "Clique em ▶ para ouvir a primeira questão" (o prompt da
  pergunta só aparece após o primeiro play).

---

## 5. Transversal às quatro features

- [x] 🟠 **Chip de toggle duplicado em 5+ arquivos.** A mesma string de ~20 classes do
  toggle-group (borda, `data-[state=on]:bg-brand-soft`…) está copiada em `ChromaticWheel`,
  `EarTrainingPage`, `DrillsPage`, `ModeSelector` e nos seletores antigos — qualquer ajuste de
  design agora exige 5 edições (e o audit D1 já pede a unificação do estado "selecionado").
  **Onde:** `ChromaticWheel.vue:111-122`, `EarTrainingPage.vue:49-57`, `DrillsPage.vue:54-65`, `ModeSelector.vue:39-43`
  **Correção:** extrair um `SegmentedControl`/`ChipToggleGroup` compartilhado (wrapper fino de
  reka-ui com as classes canônicas e `aria-labelledby` embutido).

- [x] 🟠 **Títulos de aba/rota.** As 3 rotas novas (`/modes`, `/ear-training`, `/drills`) herdam o
  `<title>` "web" do scaffold — item B do audit, agora com 3 páginas a mais.
  **Onde:** `router/index.ts`, `index.html:7`
  **Correção:** `route.meta.title` + guard (resolve para as 5 rotas de uma vez).

- [x] 🟠 **Sidebar fixa no mobile atinge as novas páginas com mais força.** O drill de braço e o
  quiz são as telas mais "de celular" do app (prática rápida), e são as que mais sofrem com os
  ~119px úteis (audit A1). Nenhuma correção nova aqui — só registrar que a prioridade do A1 sobe
  agora que existem páginas de prática.
  **Onde:** `AppLayout.vue`/`AppSidebar.vue` (audit A1)

- [x] ⚪ **Pulso visual de nota unificado.** Roda, braço do drill, ScaleNotes e (futuro) piano
  precisam do mesmo feedback "nota soando"; implementar uma vez (composable
  `useNotePulse`/classe utilitária) e reusar — evita 4 variações do mesmo efeito.
  **Onde:** consumidores de `useNoteAudio`

---

## Sequenciamento sugerido

1. **A11y das novas superfícies** (foco visível na roda, células do drill operáveis, `aria-live`
   no quiz) — mesmas classes de problema do audit C, melhor resolver com os mesmos padrões/PR.
2. **Feedback e estabilidade de layout** (pulso de nota unificado, slots reservados no quiz e no
   cronômetro, feedback de acerto/erro do drill) — é o que mais muda a *sensação* de qualidade.
3. **Affordances enganosas e contexto** (eixo de brilho clicável, "parent key" rotulado, prática
   livre sinalizada, braço com marcadores/cordas).
4. **Consolidação** (SegmentedControl compartilhado, grafia enarmônica na roda ×3 páginas, títulos
   de rota) — baixo risco, alto ganho de coesão; casa com o bloco D do audit.
