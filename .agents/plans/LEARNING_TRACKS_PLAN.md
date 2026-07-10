# Plano de Implementação — Trilhas de Aprendizado / Lições Guiadas (`/learn`)

> Feature do [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) — grandes apostas: **Trilhas de
> aprendizado / lições guiadas** `[página]` `[parcial]` `[L]`.
> Estado do desenvolvimento: [../state/WEB_STATE.md](../state/WEB_STATE.md).
> Companion: [UI_AUDIT.md](./UI_AUDIT.md).

- **Data:** 2026-07-10

## Descrição original (roadmap)

> Currículo `/learn` (Escala maior & graus → Tríades → Campo diatônico → ii-V-I → Modos). Cada
> lição = explicação curta + deep-link pré-configurando os exploradores + checkpoint de 2-3 itens
> gerado do domínio; progresso em `localStorage`.

## Tese

A feature costura as páginas que já existem (Scale/Chord/Mode Explorer, Ear Training, Drills) num
**caminho pedagógico linear**. O grosso do valor já está construído — o domínio calcula tudo
(graus, funções, ii-V-I, modos) e as visualizações já foram extraídas para componentes de
apresentação. O trabalho novo é **currículo declarativo + máquina de progresso + checkpoints
gerados do domínio**, mais uma peça de infraestrutura que hoje falta: **deep-link de entrada** nos
exploradores de Escala e Modo (só o Chord Explorer sabe se hidratar de query string).

---

## Melhorias integradas (divergências propostas vs. a descrição do roadmap)

Cada uma está incorporada ao plano abaixo; ficam listadas aqui para decisão explícita.

1. **Explorador embutido (inline-first), não só "deep-link para fora".**
   A descrição diz "deep-link pré-configurando os exploradores". Um deep-link puro **tira o usuário
   de `/learn`** e quebra o fluxo guiado (perde a lição, o checkpoint, o progresso da sessão).
   **Melhoria:** cada passo de exploração **embute a própria visualização** (componentes de
   apresentação já isolados — `ScaleNotes`, `FretboardDiagram`, `ChromaticWheel`, `HarmonicField`),
   configurada por um view-model local a partir do domínio (`createScale(root, pattern)`), e oferece
   **"Abrir no explorador completo"** como complemento (deep-link) para exploração livre. Isso é
   possível **exatamente porque** as visualizações são presentacionais e desacopladas.

2. **Deep-link é bidirecional + hidratação nos exploradores que faltam.**
   Hoje **só o Chord Explorer** lê query string
   ([use-chord-explorer-view-model.ts:56-77](../../apps/web/src/modules/chord-explorer/application/use-chord-explorer-view-model.ts)).
   Scale Explorer e Mode Explorer **não** — logo "deep-link pré-configurando os exploradores"
   simplesmente não funciona para a maior parte do currículo. **Melhoria:** definir um **contrato de
   query único** e um composable compartilhado de hidratação, e ligá-lo aos três exploradores. Ao
   sair de uma lição, anexar `?from=learn&lesson=<id>` para o explorador mostrar um banner discreto
   **"← Voltar à lição"** (deep-link de volta, não só de ida).

3. **Checkpoint reusa `AnswerOptions` + o padrão de geradores do Ear Training — sem duplicar.**
   O checkpoint é um MCQ de 2-3 itens **conceitual** (não de áudio). **Melhoria:** promover
   `AnswerOptions.vue` e os tipos `Question`/`QuizOption` para `modules/shared` (hoje vivem só em
   `ear-training`) e gerar as questões do checkpoint a partir do domínio
   (`Degree.functionName()`, `scale.seventhChords()`, `detectTwoFiveOne`, `relativeModesOf`),
   reaproveitando os helpers `random.ts` (`shuffle`/`sampleDistinct`). Um só componente de MCQ para
   Ear Training **e** trilhas.

4. **Modelo de progresso com estados e retomada, não só um booleano "concluído".**
   **Melhoria:** por lição guardar `status` (`locked` / `available` / `in-progress` / `completed`),
   passos vistos e resultado do checkpoint; trilha desbloqueia linearmente (com "pular" permitido); a
   home de `/learn` mostra **% geral** e um botão **"Continuar de onde parei"**. Persistência em
   `localStorage` via Pinia `persist: true` (padrão já usado em drills/ear-training).

5. **Currículo como dados TS tipados, não Markdown.**
   **Melhoria:** o conteúdo é um `Track[] → Lesson[] → Step[]` **tipado**, para que a config do
   explorador e a fonte do checkpoint **referenciem objetos de domínio** e sejam checadas pelo
   compilador (coerente com "domínio como fonte da verdade"). Nada de string solta de acorde/escala.

6. **Lição do ii-V-I é honesta sobre a dependência da flagship.**
   O alvo ideal do passo "explorar" do ii-V-I é o **Progression Builder** (flagship, ainda **não**
   construído). **Melhoria:** a lição do ii-V-I embarca **agora** uma demo de áudio inline
   (`playSequence`/`playChord` + destaque do resultado de `detectTwoFiveOne`) e **marca** seu
   deep-link de exploração para **upgrade** quando o Progression Builder existir. Sem bloquear a
   trilha.

---

## Reuso (inventário)

- **Domínio (`@music-workspace/music-theory`):** `createScale`, `createChord`, `Scale.degrees()`,
  `Degree.functionName()`, `Scale.triads()` / `seventhChords()`, `HarmonicFunction` +
  `harmonicFunction` no acorde, `detectTwoFiveOne`, `relativeModesOf`, `Interval.name()`, `Note`,
  `Pitch`. **Tudo já existe** — o checkpoint e as explicações derivam daqui.
- **Visualizações de apresentação (já isoladas):**
  `shared/components/scale-notes` (`ScaleNotes`), `shared/components/fretboard-diagram`
  (`FretboardDiagram`), `shared/components/chromatic-wheel` (`ChromaticWheel`),
  `shared/components/root-note-selector`, `shared/components/chord-card`.
  `scale-explorer/components/harmonic-field` (`HarmonicField`) — **promover a `shared`** (é
  prop-driven) para embutir na lição de campo diatônico.
- **Áudio:** `shared/application/use-note-audio` (`playChord`, `playSequence`, `strum`) — para os
  momentos "ouça" das explicações e a demo do ii-V-I.
- **UI/MCQ:** `ear-training/components/answer-options` (`AnswerOptions`) + tipos `Question`/
  `QuizOption` — **promover a `shared`**; helpers `shared/application/random` (`shuffle`,
  `sampleDistinct`, `randomChoice`).
- **Infra:** `router/index.ts` (padrão de rota + `titleKey`), `navigation/navigation.ts` +
  `navigation-item`, `i18n` (`en.ts` = schema, `pt.ts` = espelho), padrão store `persist: true`,
  layout `AppLayout`, chips `ChipToggleGroup`.

## Lacunas / a construir

- **Módulo `modules/learn`** (application / components / pages / types).
- **Contrato de deep-link + composable de hidratação** e sua ligação em Scale e Mode Explorer
  (Chord Explorer já tem — alinhar ao contrato). Banner **"Voltar à lição"**.
- **Promoções para `shared`:** `AnswerOptions` + tipos `Question`/`QuizOption`; `HarmonicField`.
- **Currículo tipado** (`curriculum.ts`) + **gerador de checkpoint** (`checkpoint-generators.ts`).
- **Store de progresso** (`use-learn-store.ts`) + **view-model** (`use-learn-view-model.ts`).
- **Rota `/learn`**, item de navegação, chaves i18n (`learn.*`, `nav.learn`).

---

## Contrato de deep-link (query string)

Um único contrato para os três exploradores. Todos os campos são opcionais; ausentes mantêm o
estado persistido do explorador. Origem única: `modules/shared/application/explorer-deeplink.ts`.

| Param            | Alvo                         | Exemplo         |
|------------------|------------------------------|-----------------|
| `root`           | todos                        | `C`, `F#`       |
| `pattern`        | Scale / Mode Explorer        | `Major`, `Dorian` |
| `family`, `quality` | Chord Explorer (já existe) | `Triads`, `Major 7` |
| `tuning`         | todos (quando reativado)     | `Drop D`        |
| `degree`         | destaque de grau/acorde no campo | `5`         |
| `from`, `lesson` | retorno guiado               | `learn`, `major-scale` |

- **`buildExplorerLink(target, config)`** → objeto de rota (`{ path, query }`) para o botão "Abrir no
  explorador completo".
- **`useExplorerDeeplink(apply)`** → composable `onMounted` que lê a query, chama `apply(config)`, e
  faz `router.replace` limpando os params de config (preservando `from`/`lesson`). Espelha o que o
  Chord Explorer já faz, generalizado. Scale/Mode Explorer passam a usá-lo (hoje **ignoram** a query).
- Banner **"← Voltar à lição"** renderiza quando `from=learn`; volta para `/learn/<lesson>`.

---

## Modelo de dados (currículo + progresso)

`modules/learn/types/curriculum.ts` (tipado; conteúdo em `application/curriculum.ts`):

```ts
type StepKind = "concept" | "explore" | "checkpoint";

interface ConceptStep {
  kind: "concept";
  bodyKey: string;              // chave i18n do texto curto
  // "ouça" opcional: pitches derivados do domínio para tocar o exemplo
  listen?: (ctx: LessonContext) => Pitch[];
  visualization?: InlineViz;    // ScaleNotes | ChromaticWheel | Fretboard configurado
}

interface ExploreStep {
  kind: "explore";
  viz: InlineViz;               // visualização embutida (inline-first)
  deeplink: ExplorerLinkConfig; // botão "abrir no explorador completo"
}

interface CheckpointStep {
  kind: "checkpoint";
  generate: (ctx: LessonContext) => CheckpointQuestion[]; // 2-3 itens do domínio
}

interface Lesson {
  id: string;                   // slug: "major-scale", "triads", ...
  titleKey: string; summaryKey: string;
  context: LessonContext;       // { root, pattern } base da lição (ex.: C Major)
  steps: Step[];
  prerequisiteId?: string;      // gating linear
}

interface Track { id: string; titleKey: string; lessons: Lesson[]; }
```

`use-learn-store.ts` (Pinia, `persist: true`):

```ts
state: () => ({
  // por lição: passos concluídos + resultado do checkpoint
  progress: {} as Record<string, {
    completedStepIds: string[];
    checkpoint?: { correct: number; total: number };
    status: "available" | "in-progress" | "completed";
  }>,
  lastVisitedLessonId: null as string | null,
})
```

Derivados no view-model: `status` por lição (`locked` se prereq não concluído), `%` da trilha,
lição de "continuar". Ações: `markStepDone`, `recordCheckpoint`, `resetProgress`.

---

## Arquitetura do módulo

```
apps/web/src/modules/learn/
  application/
    curriculum.ts               # dados das 5 lições (tipados, referenciam domínio)
    checkpoint-generators.ts    # gera CheckpointQuestion[] do domínio (reusa random.ts)
    use-learn-store.ts          # progresso persistido
    use-learn-view-model.ts     # status/% /gating/continuar + navegação entre passos
    checkpoint-generators.test.ts
  components/
    lesson-stepper/             # trilho de passos (concept→explore→checkpoint) + progresso
    concept-panel/              # texto curto + botão "ouça"
    inline-explorer/            # embute ScaleNotes/Fretboard/ChromaticWheel/HarmonicField
    lesson-checkpoint/          # usa <answer-options> compartilhado; placar 2-3 itens
    track-map/                  # home: cartões de lição com estado (locked/done) + %
  pages/
    LearnPage.vue               # home da trilha (/learn)
    LessonPage.vue              # uma lição (/learn/:lessonId)
```

Promoções para `shared` (pré-requisito de reuso):
- `shared/components/answer-options/` (mover de `ear-training`; atualizar import lá).
- `shared/application/quiz.ts` — tipos `Question`/`QuizOption` (hoje em `question-generators.ts`).
- `shared/components/harmonic-field/` (mover de `scale-explorer`; atualizar imports).

---

## Currículo (as 5 lições)

Cada lição: **contexto base** · **conceito** (texto + "ouça") · **explorar** (viz embutida +
deep-link) · **checkpoint** (fonte no domínio). Base sugerida: tudo em **C** para consistência.

1. **Escala maior & graus** — base `C Major`.
   - Conceito: fórmula T-T-ST-T-T-T-ST; "ouça" = `playSequence` da escala ascendente.
   - Explorar: `ScaleNotes` + `Fretboard` embutidos (graus destacados). Deep-link → `/?root=C&pattern=Major`.
   - Checkpoint: "Qual é o Ndº grau de C maior?" (respostas de `scale.degrees()` / `spelledNotes()`);
     "Qual grau é a sensível?" via `Degree.functionName()`.

2. **Tríades** — base `C Major`.
   - Conceito: empilhar 1-3-5; "ouça" = `playChord` de C maior (`strum`).
   - Explorar: `HarmonicField` em modo tríades embutido; card do acorde selecionado. Deep-link →
     Chord Explorer `/chords?root=C&family=Triads&quality=Major`.
   - Checkpoint: "Que notas formam a tríade do Ndº grau?" a partir de `scale.triads()[n].spelledNotes()`.

3. **Campo diatônico (harmônico)** — base `C Major`.
   - Conceito: os 7 acordes do tom + funções (Tônica/Subdominante/Dominante) via `harmonicFunction`.
   - Explorar: `HarmonicField` embutido colorido por função (tríades↔sétimas). Deep-link → Scale Explorer.
   - Checkpoint: "Qual a função de Gm7 em… / qual grau é dominante?" de `Degree.functionName()` +
     `harmonicFunction`.

4. **ii-V-I** — base `C Major` (**depende parcialmente da flagship**).
   - Conceito: por que Dm7-G7-Cmaj7 "puxa" para casa; "ouça" = `playSequence`/`playChord` dos 3
     acordes em ordem, destacando o resultado de `detectTwoFiveOne` sobre **essa** ordem.
   - Explorar: **demo inline agora**; deep-link marcado **`TODO → Progression Builder`** (flagship).
   - Checkpoint: "Qual acorde é o V em C? / o ii?" via graus; "esta sequência é um ii-V-I?" com
     `detectTwoFiveOne`.

5. **Modos** — base `C` (tom-pai).
   - Conceito: mesmas notas, tônica diferente; eixo de brilho Lydian→Locrian.
   - Explorar: anel de modos embutido (reusa peça do Mode Explorer). Deep-link → `/modes?root=C&pattern=Dorian`.
   - Checkpoint: "Dorian é o Ndº grau de qual maior? / qual nota muda de Aeolian p/ Dorian?" via
     `relativeModesOf`.

---

## Fases de implementação (commits por parte — Conventional Commits, `main`)

Ordem pensada para destravar o resto cedo e manter cada commit verificável.

- **Fase 0 — Promoções para `shared` (refactor puro).** Mover `AnswerOptions` + tipos de quiz e
  `HarmonicField` para `shared`; reapontar imports em `ear-training`/`scale-explorer`. Sem mudança de
  comportamento. `refactor(shared): promote answer-options and harmonic-field for reuse`.

- **Fase 1 — Deep-link compartilhado.** `explorer-deeplink.ts` (`buildExplorerLink` +
  `useExplorerDeeplink`); ligar em Scale e Mode Explorer; alinhar Chord Explorer ao contrato; banner
  "Voltar à lição". Verificável isolado (colar URL com `?root=…&pattern=…`).
  `feat(explorers): hydrate scale/mode explorers from query (deep-link contract)`.

- **Fase 2 — Esqueleto do módulo + rota + navegação.** `modules/learn`, rota `/learn` +
  `/learn/:lessonId`, item de nav (`nav.learn`, ícone Lucide ex.: `GraduationCap`), `LearnPage`
  placeholder. `feat(learn): scaffold learning tracks route and navigation`.

- **Fase 3 — Progresso + currículo tipado.** `curriculum.ts` (as 5 lições, sem checkpoints ainda),
  `use-learn-store.ts`, `use-learn-view-model.ts` (status/gating/%/continuar), `track-map` na home.
  `feat(learn): curriculum data model and persisted progress`.

- **Fase 4 — Lição: conceito + explorar (inline).** `LessonPage`, `lesson-stepper`, `concept-panel`
  ("ouça" via `use-note-audio`), `inline-explorer` (embute as vizs configuradas) + botão "abrir no
  explorador completo". `feat(learn): guided lesson flow with inline explorers`.

- **Fase 5 — Checkpoints gerados do domínio.** `checkpoint-generators.ts` (+ teste), `lesson-checkpoint`
  reusando `<answer-options>`; grava resultado e conclui a lição; desbloqueia a próxima.
  `feat(learn): domain-generated lesson checkpoints`.

- **Fase 6 — Polimento.** i18n completo (pt/en), a11y (foco/teclado no padrão do Ear Training),
  estados vazios, responsivo, atualizar `WEB_STATE.md` e marcar `- [x]` no roadmap.
  `style(learn): a11y, i18n and responsive polish`.

> **Regra permanente:** ao final de cada fase, atualizar `.agents/state/WEB_STATE.md` (última fase,
> status, data) como nos demais planos.

---

## i18n, a11y e testes

- **i18n:** `nav.learn` + bloco `learn.*` em `en.ts` (schema) e `pt.ts` (espelho): títulos/resumos de
  trilha e lições, corpos dos conceitos, rótulos de checkpoint, estados (bloqueado/concluído),
  "continuar", "abrir no explorador", "voltar à lição". Nomes musicais (notas/acordes/intervalos) vêm
  do domínio, **não** se traduzem.
- **A11y:** reusar o padrão do `EarTrainingPage`/`AnswerOptions` — foco move para "Próximo" ao
  responder, atalhos 1-N, `aria-disabled` em vez de `disabled`, `role="status"` no feedback. Stepper
  navegável por teclado; estados de lição anunciados.
- **Testes:** unitário em `checkpoint-generators.test.ts` (resposta correta ∈ opções, N distratores
  distintos, todos derivados do domínio) espelhando `question-generators`/`leitner` já existentes.
  Verificação manual via preview (fluxo de uma lição ponta-a-ponta + deep-link ida/volta).

## Riscos / dependências

- **ii-V-I ↔ Progression Builder (flagship):** lição entrega demo inline agora; deep-link fica
  marcado para upgrade. Não bloqueia.
- **Promoções de componente (Fase 0):** mexem em imports de `ear-training`/`scale-explorer` — manter
  como refactor isolado e verificar as duas páginas antes de seguir.
- **Contrato de deep-link:** Chord Explorer já limpa a query no `onMounted`; ao generalizar, preservar
  `from`/`lesson` para o botão de volta não sumir.
- **Escopo:** MVP = as 5 lições do roadmap. Estrutura fica pronta para trilhas futuras (intervalos,
  leitura em pauta) sem retrabalho.
