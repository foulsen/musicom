# Plano de Implementação — Scale Explorer (apps/web)

## Contexto

O `apps/web` adota arquitetura feature-based: shell com sidebar (`AppLayout` +
`AppSidebar` + `NavigationItem` com CVA), módulo `scale-explorer` com view-model em
composable e um `RootNoteSelector` que converte `Note ↔ SingleNote` na fronteira do shadcn.
O domínio (`@music-workspace/music-theory`) é a fonte da verdade: `Note`, `Scale`
(`notes`, `degrees`, `triads`, `seventhChords` com função harmônica + tensões),
`ScalePattern` (11 padrões), `Chord`, `createScale`, `detectTwoFiveOne`, etc.

Objetivo: **(1) revisar e estabilizar o existente** e **(2) desenvolver a primeira página
guiada por mockup**, reutilizando o domínio e mantendo baixo acoplamento. O projeto também
é laboratório de tecnologias modernas de frontend — cada fase é oportunidade de exercitar
recursos atuais do ecossistema Vue quando agregarem valor sem prejudicar a clareza.

### Decisões tomadas
- **Estado**: manter o view-model em composable, refatorado para ser 100% domain-object;
  Pinia só quando o estado precisar ser compartilhado entre rotas.
- **1º milestone**: Seletores (tônica + escala/modo) → Notas/Graus → Campo Harmônico.
  **Fretboard fica para milestone próprio.**
- **Limpeza**: remover os resíduos do template Vite.

### Decisões confirmadas a partir do mockup (sessão de 2026-06-29)
- **Scale Type**: exibir os **11 patterns flat** do domínio (não o agrupamento de 9 do mockup).
- **Nomenclatura musical** (intervalos, graus, símbolo de tríade maior): **estender o domínio**
  `music-theory` — a UI não duplica regra musical.
- **Acento**: **token de marca dedicado** `--brand` (rosa) para estados selecionados; surfaces
  e shadcn seguem neutros.
- **Tema escuro por padrão** (`<html class="dark">`); sem toggle por ora.
- **Fonte**: **Cascadia Code** via `@fontsource-variable/cascadia-code`.
- **Estilo dos seletores**: usar primitivas `reka-ui` diretamente (não o wrapper shadcn
  `toggle-group`) para os cards/pill; conversão string↔domínio só nesse boundary.
- Os arquivos do mockup vivem em `apps/web/mockups/` e seus dados são **placeholder**
  (mostram C maior); a UI sempre deriva do domínio conforme a seleção.

### Achados da revisão (baseline)
- **Resíduos do template Vite** (remover): `src/components/HelloWorld.vue`,
  `src/assets/hero.png`, `src/assets/vue.svg`, `src/assets/vite.svg`.
- **`src/style.css`** mistura tokens shadcn (manter) com CSS do template (remover):
  `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks`, `.counter`, estilos de
  `code`/`h1`/`h2` do template e o `#app { width: 1126px; text-align: center; ... }`, que
  conflita com o layout de sidebar full-height.
- **`use-scale-explorer-view-model.ts`**: `selectRoot(note: string)` / `selectPattern(name:
  string)` com `new Note(note as any)` — fere domain-first e diverge do `RootNoteSelector`
  (que já usa `v-model<Note>`).
- **shadcn presente**: `button`, `card`, `separator`, `toggle`, `toggle-group`. Novos
  primitivos (ex.: `select`, `badge`) entram via CLI conforme o mockup.
- **`apps/web/mockups`** ainda não existe — fases visuais (3–5) iniciam quando o mockup for
  referenciado em um prompt.

---

## Regra permanente: arquivo de estado (`WEB_STATE.md`)

**Ao final de CADA fase concluída**, atualizar `.agents/state/WEB_STATE.md` com:
- a **última fase implementada** (status + data);
- as **observações importantes** a carregar adiante (decisões, dívidas técnicas, gotchas,
  escolhas de "laboratório");
- a **próxima fase**.

`WEB_STATE.md` é a fonte da verdade sobre "onde paramos"; este arquivo é o plano completo.
Toda sessão deve ler o estado antes de prosseguir e gravá-lo ao terminar uma fase.

---

## Fases

> Fases 0–2 não dependem do mockup. Fases 3–5 são guiadas pelo mockup
> (`apps/web/mockups`) e iniciam quando ele for referenciado. Fase 6 é milestone futuro.

### Fase 0 — Revisão & Baseline
- Consolidar os achados acima neste arquivo.
- Confirmar que o dev server sobe (`pnpm web`) e a rota `/` renderiza o shell.
- Inicializar `WEB_STATE.md`.

### Fase 1 — Limpeza & Fundação
- Remover resíduos do template Vite (HelloWorld + assets hero/vue/vite).
- Enxugar `src/style.css`: **manter** `@import "tailwindcss"`, `tw-animate-css`,
  `@custom-variant dark`, tokens de cor em `:root`, bloco `.dark`, `@theme inline` e
  `@layer base`; **remover** o CSS do template (incl. `#app` centralizado) e substituir por
  um reset mínimo de app shell, deixando o layout a cargo do `AppLayout` (`flex h-screen`).
- Garantir os diretórios `.agents/plans` e `.agents/state`.

### Fase 2 — Camada de aplicação (domain-first)
- Refatorar `use-scale-explorer-view-model.ts`:
  - `selectRoot(note: Note)` e `selectPattern(pattern: ScalePattern)` (sem `string`/`as any`);
  - `selectedRoot`, `selectedPattern`, `scale`, `notes`, `degrees`, `progressions` como
    `computed`/`ref` sobre objetos de domínio;
  - alinhar com o `RootNoteSelector` (`v-model<Note>`).
- Pinia permanece configurado porém não utilizado (decisão registrada no estado).

### Fase 3 — Seletor de Escala/Modo *(mockup)*
- `modules/scale-explorer/components/scale-pattern-selector/`
  (`ScalePatternSelector.vue` + `index.ts`), padrão shadcn (CVA no `index.ts` se houver
  variantes). Trabalha com `ScalePattern`; conversão para primitivo só na fronteira do
  componente shadcn. Liga ao view-model via `v-model<ScalePattern>` / `selectPattern`.

### Fase 4 — Notas & Graus *(mockup)*
- Componente exibindo `scale.degrees()` (nota + grau). Estado derivado via `computed`;
  sem regra musical na UI.

### Fase 5 — Campo Harmônico *(mockup)*
- Componente consumindo `scale.seventhChords()` (e/ou `triads()`): nome do acorde, grau,
  função harmônica e tensões. Cards com o shadcn `Card`; `badge`/`select` via CLI se preciso.

### Fase 6 — Fretboard *(milestone futuro)*
- Placeholder em `ScaleExplorerPage.vue`. Plano próprio (SVG/canvas, interatividade).

**Convenções (todas as fases):** arquivos PascalCase; tags kebab-case; imports por
diretório; um componente por responsabilidade; `src/components/ui` exclusivo do shadcn;
sem estrutura especulativa. **Ao final de cada fase, atualizar `WEB_STATE.md`.**

---

## Verificação

- **Build/Types**: `pnpm --filter web build` (vue-tsc) sem erros após Fases 1–2.
- **Runtime**: `pnpm web`, abrir `/` — sidebar full-height (sem o centramento 1126px),
  `RootNoteSelector` alterando a tônica.
- **Domain-first**: nenhuma regra musical reimplementada na UI; `grep` por `as any` no
  módulo `scale-explorer` vazio após a Fase 2.
- **Fases visuais (3–5)**: comparar com o mockup; dados vindos de `scale.*`; conversões para
  primitivo só na fronteira do shadcn.
- **Estado**: `WEB_STATE.md` reflete a última fase + observações ao concluir cada fase.
