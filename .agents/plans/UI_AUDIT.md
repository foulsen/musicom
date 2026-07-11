# UI_AUDIT — Avaliação de UI/UX (apps/web)

> Avaliação para atacar ponto a ponto. Marque `- [x]` conforme resolver.
> Companion: [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) (próximos passos).
> Estado do desenvolvimento: [../state/WEB_STATE.md](../state/WEB_STATE.md).

- **Data:** 2026-07-08
- **Método:** auditoria multiagente em 5 dimensões (design visual, layout/responsividade,
  acessibilidade, conteúdo/i18n, interação) + passe de verificação adversarial. 58 achados no
  total, 24 confirmados de forma independente. Os itens marcados **✔ ao vivo** foram conferidos
  no preview (DOM/inspect a 375px e desktop).
- **Legenda de severidade:** 🔴 Alta · 🟠 Média · ⚪ Baixa
- **Fora de escopo (decisões intencionais já registradas):** tema dark-only sem toggle; hex do
  `--brand` ainda amostrado; raízes só com sustenido.

---

## A. Responsividade / mobile — *a área mais crítica*

- [ ] 🔴 **Sidebar fixa (`w-64`, 256px) nunca colapsa.** ✔ ao vivo: a 375px sobram **119px** para
  o `<main>` (após `p-8`, ~55px reais) — é a causa raiz de quase todos os problemas mobile.
  **Onde:** `apps/web/src/layouts/app-layout/AppLayout.vue:8`, `.../app-sidebar/AppSidebar.vue:12`
  **Correção:** esconder abaixo de `md` (`hidden md:flex`) + top-bar com hamburger abrindo drawer
  (reka-ui Dialog/Sheet) ou rail de ícones; `<main>` ganha largura total no mobile.

- [ ] 🔴 **Root note: 12 pills numa única linha `flex` sem wrap.** ✔ ao vivo: ~10px por pill no
  mobile (`C#`/`G#` ilegíveis); sem `max-w`, esticam demais no desktop.
  **Onde:** `apps/web/src/modules/shared/components/root-note-selector/RootNoteSelector.vue:30`
  **Correção:** `grid grid-cols-6 sm:grid-cols-12` (2 linhas no mobile) + cap de largura no container.

- [ ] 🔴 **Fretboard SVG encolhe em vez de rolar.** viewBox ~692u colapsa para <300px → notas com
  raio ~5px, muito abaixo do alvo de toque (44px).
  **Onde:** `apps/web/src/modules/shared/components/fretboard-diagram/FretboardDiagram.vue:149`
  **Correção:** envolver o SVG em `overflow-x-auto` + `min-width`; manter `max-w-3xl` como teto no desktop.

- [ ] 🟠 **`p-8` fixo nas páginas** agrava o aperto no mobile.
  **Onde:** `ScaleExplorerPage.vue:32`, `ChordExplorerPage.vue:28`
  **Correção:** `p-4 sm:p-6 lg:p-8`.

---

## B. Idioma e conteúdo — *mistura PT/EN*

- [ ] 🔴 **Estado vazio em PT numa UI toda em inglês:** "Sem digitação predefinida para {chord}."
  — nas duas páginas; caso comum (maioria dos acordes sem voicing salvo); lê-se como bug.
  **Onde:** `ScaleExplorerPage.vue:66`, `ChordExplorerPage.vue:53`
  **Correção:** decidir o idioma do produto e centralizar a string (ex.: "No saved shapes for {chord} yet.").

- [ ] 🟠 **Toggle "Show notes out of scale" hard-coded** — no Chord Explorer não há escala; as notas
  ocultas são as fora do **acorde**.
  **Onde:** `FretboardDiagram.vue:147`
  **Correção:** rótulo por prop ("outside the chord" / "outside the scale") ou frase neutra ("Show all notes").

- [ ] 🟠 **Placeholder PT latente** "Escolha a afinação" no TuningSelector (surge ao reativá-lo).
  **Onde:** `apps/web/src/modules/scale-explorer/components/tuning-selector/TuningSelector.vue:44`
  **Correção:** "Select a tuning".

- [ ] 🟠 **Intervalos `T / ST / T½`** (convenção brasileira) sob rótulos em inglês; e o `default`
  retorna minúsculo `"{n}st"`, inconsistente com o `ST` maiúsculo.
  **Onde:** `ScalePatternSelector.vue:31-41`
  **Correção:** padronizar uma convenção EN (`W/H` ou soletrado) e alinhar o case do default.

- [ ] 🟠 **Títulos de página sem subtítulo** que oriente o aprendiz; e o **`<title>` da aba é "web"**
  (scaffold; sem título por rota).
  **Onde:** `index.html:7`; páginas em `ScaleExplorerPage.vue:33`, `ChordExplorerPage.vue:29`
  **Correção:** subtítulo muted por página; título-base "MUSICOM" + títulos por rota via `route.meta` + guard.

- [ ] ⚪ **Casing inconsistente do mesmo conceito:** sidebar minúsculo (`scale explorer`), H1
  `UPPERCASE`, headings ora Title Case ora sentence case.
  **Onde:** `navigation.ts:6,11`; H1 em `ScaleExplorerPage.vue:34`; headings de seção diversos
  **Correção:** escolher UMA convenção (recomendo Title Case nos nomes de navegação/título; sentence
  case nos headings de seção) e aplicar; remover `uppercase`.

- [ ] ⚪ **Headings "Family"/"Chord" ambíguos** — "Chord" seleciona a *qualidade* dentro da família.
  **Onde:** `ChordQualitySelector.vue:37`, `ChordFamilySelector.vue:31`
  **Correção:** "Chord Family" e "Chord Quality" (ou "Quality"/"Type").

---

## C. Acessibilidade (a11y)

- [ ] 🔴 **Notas do fretboard e dos voicings não são operáveis por teclado.** ✔ ao vivo: 48 grupos
  `<g>` com `tabindex=null`/`role=null`, sem `aria-label` nem Enter/Space (WCAG 2.1.1, 4.1.2).
  **Onde:** `FretboardDiagram.vue:168`, `ChordVoicingDiagram.vue:147`
  **Correção:** cada nota vira controle real: `tabindex="0"`, `role="button"`, `:aria-label` (nota +
  intervalo), handler `@keydown.enter/.space`, e anel de foco (outline SVG).

- [ ] 🔴 **SVG `role="img"` com label genérico** ("Fretboard") colapsa todo o conteúdo — leitor de
  tela não recebe nenhuma nota (WCAG 1.1.1, 1.3.1).
  **Onde:** `FretboardDiagram.vue:149`, `ChordVoicingDiagram.vue:94`
  **Correção:** expor as notas como controles rotulados (item acima) ou `aria-label` dinâmico / lista
  visualmente-oculta com as notas da seleção atual.

- [ ] 🔴 **Feedback apenas sonoro ao tocar** (sem pulso visual nem `aria-live`) — exclui surdos/quem
  está com som desligado (WCAG 1.1.1, 4.1.3).
  **Onde:** `use-note-audio.ts:6-27`
  **Correção:** highlight/pulso transitório na nota clicada + região `aria-live="polite"` anunciando
  a nota tocada.

- [ ] 🟠 **`aria-label="Toggle small"`** — sobra de boilerplate que sobrepõe o rótulo visível.
  ✔ ao vivo. (WCAG 4.1.2 / 2.5.3)
  **Onde:** `FretboardDiagram.vue:142`
  **Correção:** remover o `aria-label` (o texto visível vira o nome acessível) ou igualá-lo ao texto.

- [ ] 🟠 **Tooltip só no `hover`** (sem `focus`/toque) — WCAG 1.4.13.
  **Onde:** `FretboardDiagram.vue:168,178-186`
  **Correção:** disparar também em `@focusin/@focusout`; expor o mesmo texto via `aria-label`.

- [ ] 🟠 **Toggle-groups sem nome acessível** — o `<h2>` não é associado ao grupo.
  **Onde:** `RootNoteSelector.vue:30`, `ScalePatternSelector.vue:53`, `ChordFamilySelector.vue:34`,
  `ChordQualitySelector.vue:41`
  **Correção:** dar `id` ao `<h2>` e `:aria-labelledby` no `ToggleGroupRoot`.

- [ ] 🟠 **Dois `<h1>` por página** (marca + título) e **sem skip-link** sobre a nav persistente
  (WCAG 2.4.1); `<main>` sem nome acessível.
  **Onde:** `AppSidebar.vue:18` + `ScaleExplorerPage.vue:34` / `ChordExplorerPage.vue:30`
  **Correção:** um único `h1` por view (marca vira logotipo, não heading); "Skip to main content"
  visualmente-oculto; `aria-label` no `<main>`.

- [ ] ⚪ **Foco do Harmonic Field inconsistente** — botões sem `focus-visible:ring` como o resto.
  **Onde:** `HarmonicField.vue:28`
  **Correção:** aplicar o mesmo `focus-visible:ring-2 focus-visible:ring-ring`.

---

## D. Design system / consistência visual

- [ ] 🔴 **Dois "idiomas" de seleção** para a mesma interação: toggle-groups usam contorno tênue
  (`border-brand` + `bg-brand/10`, quase invisível no dark) e o Harmonic Field usa chip sólido
  (`bg-brand-soft`).
  **Onde:** `HarmonicField.vue:30-43` vs `RootNoteSelector.vue:39` / `ScalePatternSelector.vue:62` /
  `ChordFamilySelector.vue:44` / `ChordQualitySelector.vue:50`
  **Correção:** padronizar UM tratamento de "selecionado" (recomendo o chip sólido) em todos.

- [ ] 🟠 **Superfícies inconsistentes:** tiles `bg-card/40`, Harmonic Field sem superfície, e o
  `ChordCard` é `bg-transparent` + `rounded-3xl` (24px, **fora** da escala de tokens) — um "card"
  que não é card.
  **Onde:** `ChordCard.vue:28`, `HarmonicField.vue:29`, seletores tile
  **Correção:** definir UMA receita de superfície (ex.: `bg-card/40 border rounded-lg`) e reusar.

- [ ] 🟠 **Raios de canto inconsistentes** (`rounded-md/lg/xl/3xl` + `rx=6` hard-coded); `rounded-3xl`
  não tem token e cai no default 24px.
  **Onde:** `RootNoteSelector.vue:33,39`, `HarmonicField.vue:29`, `ChordCard.vue:28`, `FretboardDiagram.vue:180`
  **Correção:** restringir à escala `sm/md/lg/xl`; derivar o `rx` do SVG da mesma escala.

- [ ] 🟠 **Marca ausente do chrome** — nav ativo (`bg-secondary`) e logo em cinza; a marca só aparece
  no conteúdo. Parece starter shadcn.
  **Onde:** `AppSidebar.vue:15-21`, `navigation-item/index.ts:14`
  **Correção:** tingir o item ativo (`bg-brand/10` + `border-l-2 border-brand`) e o ícone da marca (`text-brand`).

- [ ] 🟠 **Hierarquia invertida:** o nome do acorde (`text-3xl`, o maior texto) está
  `text-muted-foreground`, e **todos** os `h2` de seção também são muted — nada ancora o olho.
  **Onde:** `ChordCard.vue:29`; h2 em `RootNoteSelector.vue:25`, `ScaleNotes.vue:18` etc.
  **Correção:** nome do acorde em `text-foreground` (ou `text-brand`); reservar muted para labels
  secundários; estilo "eyebrow" para os h2.

- [ ] 🟠 **Tipografia 100% monospace sem escala disciplinada** — hierarquia recai só em
  tamanho/peso/cor, aplicados de forma irregular; **`text-md` inválido** no TuningSelector (sem
  font-size).
  **Onde:** `style.css:106-107` (sans e mono = Cascadia); `TuningSelector.vue:37` (`text-md`)
  **Correção:** manter mono para dados/notas; escala de tipos documentada (display/title/label/body/
  caption) OU um sans companheiro para headings; corrigir `text-md` → `text-xl`.

- [ ] 🟠 **`--brand-foreground` só é usado sobre `--brand-soft`** (nunca sobre `--brand`) — no tema
  claro vira branco sobre rosa-claro (~1.3:1). Latente hoje (dark-only), quebra ao adicionar toggle.
  **Onde:** `style.css:53-54,100-102`; consumidores em `HarmonicField.vue:36,43`, `FretboardDiagram.vue:74`
  **Correção:** criar `--brand-soft-foreground` (tinta escura) e apontar os consumidores para ele;
  corrigir os valores light.

- [ ] ⚪ **Ícone `Music` duplicado** — usado tanto na marca quanto no item "scale explorer".
  **Onde:** `navigation.ts:6` + `AppSidebar.vue:16`
  **Correção:** dar à marca um glyph distinto (ou trocar o ícone do item).

---

## E. Interação / completude de feature

- [ ] 🔴 **Áudio só toca nota única** — num app de acordes, não há como ouvir o acorde (nem strum);
  clicar num acorde do Harmonic Field só seleciona.
  **Onde:** `use-note-audio.ts:6` (consumido por ChordCard, ChordVoicingDiagram, HarmonicField)
  **Correção:** `playChord(pitches, {strum?})` (osciladores juntos ou com stagger) + botão "play" no
  ChordCard/voicings/linhas do Harmonic Field. → ver quick win no roadmap.

- [ ] 🔴 **Sem persistência** entre navegação/reload e **root não compartilhado** entre as páginas
  (A no Scale → ainda C no Chord). Pinia **instalado, mas com zero stores**; sem `<KeepAlive>`.
  **Onde:** `use-scale-explorer-view-model.ts:33,51,94`, `use-chord-explorer-view-model.ts:24-30`,
  `app-layout/AppLayout.vue:13`
  **Correção:** subir seleções para um store persistido (Pinia + localStorage) ou `route.query`;
  compartilhar ao menos o `root`.

- [ ] 🔴 **TuningSelector comentado** — Drop D / Half Step Down já totalmente ligados no VM, porém
  inacessíveis; import/bindings viram código morto (lint).
  **Onde:** `ScaleExplorerPage.vue:47-51`; VM `use-scale-explorer-view-model.ts:63-92`; chord VM
  hardcoda `STANDARD_GUITAR_TUNING` em `:20`
  **Correção:** reativar o `<tuning-selector>`; expor tuning também no Chord Explorer. → quick win.

- [ ] 🟠 **`detectTwoFiveOne` computado e descartado** — a página nunca renderiza `progressions`.
  Além disso, os acordes vêm em ordem de grau, então um 2-5-1 nunca é consecutivo (no-op).
  **Onde:** `use-scale-explorer-view-model.ts:61,133`; nunca consumido em `ScaleExplorerPage.vue`
  **Correção:** ver flagship do roadmap (Progression Builder) ou remover o computed até haver UI.

- [ ] 🟠 **Sem ponte entre os dois exploradores** — não há como abrir um acorde do Harmonic Field no
  Chord Explorer com root/família/qualidade pré-selecionados.
  **Onde:** `HarmonicField.vue:27-48`, `ScaleExplorerPage.vue:57-69`
  **Correção:** ação "Abrir no Chord Explorer" navegando a `/chords` com a seleção aplicada.

- [ ] 🟠 **Fretboard fixo em 12 casas** — sem scroll, sem braço completo/24, sem posições da 2ª oitava.
  **Onde:** `packages/music-theory/src/instruments/fretboard.ts:15`; ambos os VMs usam o default
  **Correção:** controle de faixa de casas (12/15/24) ou scroll horizontal, passando `fretCount`.

- [ ] 🟠 **Sem confirmação visual ao tocar** e nada sinaliza o que é clicável; a lista **Notes não é
  tocável** (o lugar mais óbvio para clicar).
  **Onde:** `FretboardDiagram.vue:168-176`, `ChordVoicingDiagram.vue:147-172`, `ScaleNotes.vue:23-38`
  **Correção:** pulso "ringing" na nota clicada; dica "clique para ouvir"; tornar itens de `ScaleNotes`
  botões que emitem `note-play`.

- [ ] 🟠 **Sem volume/mute** (ganho fixo 0.2) e **rotas lazy sem estado de loading** (main em branco
  durante o chunk).
  **Onde:** `use-note-audio.ts:19-23`; `router/index.ts:4-11`
  **Correção:** controle de volume/mute persistido no master gain; fallback de loading nas rotas.

- [ ] 🟠 **Empty-states não desenhados** — apenas um `<p>` muted (sem ícone/explicação/próximo passo).
  **Onde:** `ScaleExplorerPage.vue:65-67`, `ChordExplorerPage.vue:52-54`
  **Correção:** bloco de empty-state (ícone + título curto + 1 linha) que ainda mostra notas/braço.

- [ ] ⚪ **ChordCard corta em 3 voicings** sem indicar que há mais.
  **Onde:** `ChordCard.vue:17,24`
  **Correção:** "+N more" / contador quando `shapes.length > maxVariations`.

---

## Notas
- Lista deduplicada por tema a partir de **58 achados** (24 confirmados de forma adversarial). O dump
  bruto por dimensão pode ser regerado a partir do workflow de auditoria se necessário.
- Sugestão de ordem de ataque: **A (mobile) → C (a11y de teclado/leitor) → E1/E3 (áudio+afinação) →
  B (idioma) → D (design system)**. Muitos itens de D são de baixo risco e alto ganho de coesão.
