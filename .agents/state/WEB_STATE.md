# WEB_STATE — Estado do Desenvolvimento (apps/web)

> Arquivo vivo. Atualizar ao final de CADA fase concluída.
> "Onde paramos". Plano completo: ../plans/WEB_IMPLEMENTATION_PLAN.md

## Resumo
- Última fase concluída: **Cartão de acorde** (`ChordCard` + `ChordVoicingDiagram`) —
  digitações hardcoded (banco em `instruments/chord-voicings.ts`) no formato do mockup;
  exibe o cartão do acorde selecionado no Harmonic Field, no lugar do antigo mini-fretboard
  (removido). Também: **banco de fórmulas de acorde** (`chords/chord-patterns.ts`) para a
  futura página de estudo. Verificado.
- Antes: **Fase 6 (Fretboard) — passos 1–5**; no domínio: **seletor de afinação**, **áudio
  string-accurate** e **spelling enarmônico**. Tudo verificado.
- Próximo: polimento opcional do fretboard (inlays das casas). Pendência geral: hex exato
  do `--brand`.
- Atualizado em: 2026-07-05

## Histórico de fases
| Fase | Status | Data | Notas |
|------|--------|------|-------|
| 0 — Revisão & Baseline                     | ✅ concluída | 2026-06-29 | Artefatos `.agents/plans` e `.agents/state` criados. |
| 1 — Limpeza & Fundação                     | ✅ concluída | 2026-06-29 | Removidos starter Vite; `style.css` enxuto; fix `tsconfig` baseUrl (TS 6.0). |
| 2 — Camada de aplicação (domain-first)     | ✅ concluída | 2026-06-29 | VM 100% domain-object; `degrees` exposto. |
| Fundação visual (mockup)                   | ✅ concluída | 2026-06-29 | Dark por padrão, fonte Cascadia Code, token `--brand`. |
| 3 — Seletor de Escala/Modo                 | ✅ concluída | 2026-06-29 | `ScalePatternSelector` (11 patterns) + restyle `RootNoteSelector` (pill). Build + UI verificados. |
| 4 — Notas & Graus (mockup)                 | ✅ concluída | 2026-06-29 | `Degree.intervalName()` no domínio + componente `ScaleNotes`. Verificado (C maior e C harmônica menor). |
| 5 — Campo Harmônico (mockup)               | ✅ concluída | 2026-06-29 | Domínio: `Degree.position/functionName` + tríade maior `""`/`aug`; componente `HarmonicField` (triads). Verificado. |
| 6 — Fretboard                              | ✅ passos 1–5 | 2026-07-03 | Domínio `instruments/` + `FretboardDiagram` SVG (3 estilos, hover+tooltip, áudio) + layout 2 colunas. Polimento extra opcional. |
| + Afinação, áudio real e spelling          | ✅ concluído | 2026-07-04 | Seletor de afinação (shadcn Select), `Pitch`/áudio string-accurate, `SpelledNote` (grafia enarmônica). |
| + Diagrama de acorde (substituído)          | ↩︎ removido  | 2026-07-05 | `ChordDiagram` (notas do acorde no braço) — trocado pelo cartão de acorde abaixo. |
| + Banco de fórmulas de acorde               | ✅ concluído | 2026-07-05 | `ChordPattern` + `chord-patterns.ts` (tríades, sextas, sétimas) no domínio; para a página de estudo. |
| + Cartão de acorde                          | ✅ concluído | 2026-07-05 | Banco de voicings hardcoded (`instruments/chord-voicing(s).ts`) + `ChordCard`/`ChordVoicingDiagram`; dirigido pela seleção do Harmonic Field. |

## Decisões da sessão do mockup (confirmadas com o usuário)
- **Scale Type = 11 patterns flat** do domínio (Major, Natural Minor, Harmonic Minor, Melodic
  Minor, Dorian, Aeolian, Ionian, Locrian, Lydian, Mixolydian, Phrygian) — não seguir o
  agrupamento 9-cards do mockup.
- **Fretboard adiado** (placeholder), mesmo aparecendo no mockup.
- **Nomenclatura musical → estender o domínio** (`music-theory`): nomes de intervalo
  ("major second"…), nomes tradicionais de grau ("supertonic"…) e ajustar o símbolo da
  **tríade maior** (hoje `ChordQuality("M")` gera `"CM"`; o mockup mostra `"C"`).
- **Acento = token de marca dedicado** `--brand` (rosa); surfaces/shadcn seguem neutros.
- **Tema escuro por padrão** (`<html class="dark">`); sem toggle por enquanto.
- **Fonte = Cascadia Code** via `@fontsource-variable/cascadia-code`.

## Observações importantes para as próximas fases
- **Mockups**: `apps/web/mockups/Scale-Explorer-Page.png` (com sidebar) e
  `Scale-Explorer-Page-Content.png` (conteúdo, inclui Harmonic Field). **Dados do mockup são
  placeholder** (mostram C maior mesmo com "Harmonic Minor" selecionado) — a UI sempre deriva
  do domínio a partir do que está selecionado.
- **Seletores usam `reka-ui` (`ToggleGroupRoot`/`ToggleGroupItem`) diretamente**, NÃO o wrapper
  shadcn `toggle-group`. Motivo: o estilo de "toggle button" do DS não cabe nos cards/pill do
  mockup; usar a primitiva dá controle de estilo com baixo acoplamento (mesma lógica do
  `NavigationItem` usar `RouterLink`). Conversão string↔domínio só nesse boundary
  (`as SingleNote` permitido aqui).
- **Fonte (TS gotcha)**: `@fontsource-variable/cascadia-code` é pacote só-CSS sem typings;
  importar o caminho explícito `@fontsource-variable/cascadia-code/index.css` (casa com a
  declaração `*.css` do `vite/client`). Family CSS = `"Cascadia Code Variable"` (pesos 200–700),
  setada em `--font-sans`/`--font-mono` no `@theme inline`.
- **Cor `--brand`**: valores atuais em oklch (`light: 0.65 0.22 354`, `dark: 0.72 0.19 353`),
  amostrados do mockup. Ajustar com o hex exato do Figma quando disponível.
- **Notação de intervalo nos cards** (T / ST / T½) é formatada na UI a partir de
  `interval.semitones` (apresentação, não regra musical).
- **Nomes de intervalo (Fase 4)**: `Degree.intervalName()` no domínio (mapa símbolo→nome) e
  `Degree` exportado no `index`. UI consome via `scale.degrees()[i].degree.intervalName()`.
- **Spelling enarmônico (resolvido)**: novo `SpelledNote` (letra + acidente) no domínio; a
  altura é **derivada** da grafia (`Note` segue como classe de altura). `Scale.degrees()` carrega
  `spelled` e `Scale.spelledNotes()` aplica a regra **uma-letra-por-grau**; `Chord.spelledRoot`
  grafa o nome do acorde. UI (Notes, Harmonic Field, fretboard) usa a grafia. **Raízes ainda só
  com sustenido** (decisão) — tons de sustenido saem corretos porém exóticos (ex.: C# maior →
  E#/B#; D# menor harmônica → C##). Bemóis nas raízes ficam para depois.
- **Layout Notes × Fretboard**: hoje a seção Notes é uma lista vertical full-width; no mockup
  ela fica ao lado do fretboard. Ajustar para 2 colunas quando o fretboard for construído.
- **Campo Harmônico (Fase 5)**: usa `scale.triads()`. Domínio ganhou `Degree.position()` e
  `Degree.functionName()`; `triads()` agora gera tríade maior **sem sufixo** (`"C"`),
  `dim`, `m` e **`aug`** (ex.: C harmônica menor → `Ebaug` no III). O 7º grau é nomeado
  `leading tone` (7 natural) ou `subtonic` (b7) — musicalmente correto; o mockup mostrava
  `subtonic` para C maior como placeholder.
- **Tríade aumentada**: detecção adicionada (`rootToThird=4 && rootToFifth=8`). Outras
  qualidades estendidas (ex.: sus) não são tratadas — gap conhecido se surgirem.
- **Screenshot do preview instável nesta sessão** (timeout na captura, página saudável):
  verificação visual feita via `preview_eval` lendo o DOM.
- **Preview/launch**: `.claude/launch.json` define o server `web` (`pnpm --filter web dev`,
  porta 5173) para o painel de preview.

## Fretboard (Fase 6 — passos 1–5)
- **Domínio** (`packages/music-theory/`): `Pitch` (nota + oitava; `midi`/`frequency`/`transpose`);
  `Tuning` octave-aware (`strings: Pitch[]`) + presets `TUNINGS` (Standard, Drop D, Half Step
  Down); `Fretboard` (`pitchAt`, `positions()` → matriz cordas×casas 0..12 de `Pitch`). Helpers
  `Note.equals`, `Scale.contains`, `Interval.name()`. Removido `baseUrl` do `tsconfig.json` do
  pacote (deprecado no TS 6.0).
- **Categorização no view-model**: `fretboardPositions` (computed) anota cada posição com
  `isTonic`/`inScale` (tipo em `modules/scale-explorer/types/fretboard-note.ts`). O
  `FretboardDiagram` é presentation-only, não acopla com `Scale`.
- **Componente**: `components/fretboard-diagram/FretboardDiagram.vue` (SVG). ⚠️ Nomeado
  `FretboardDiagram` (não `Fretboard`) por **colisão**: a tag `<fretboard>` resolvia para o
  *valor* `fretboard` do domínio em vez do componente → nada renderizava. Manter nomes de
  model e componente distintos.
- **Estilos das notas** (`Freatboard-Note.png`): tônica = `fill-brand-soft stroke-brand`
  (rosa-claro; novo token `--brand-soft`); na escala = `fill-muted stroke-brand`; fora =
  `fill-muted stroke-transparent`. Cores via utilitários `fill-*`/`stroke-*` do tema.
- **Densidade** por `ref` interno `showOutOfScale` (default `true`), SEM UI (pedido do
  usuário; controle na interface fica pro futuro).
- **Ordem das cordas**: aguda (1ª/e) no topo — o componente inverte a ordem física
  (grave→aguda) do domínio ao renderizar.
- **Passo 5 (hover + áudio)**: hover destaca a nota (aumenta) e mostra tooltip
  `nota · intervalo` (`Interval.name()` por semitons em relação à tônica). Clique toca a nota:
  `application/use-note-audio.ts` (Web Audio, oscilador + envelope, `pitch.frequency()`); o
  `FretboardDiagram` só **emite `note-play`** com o `Pitch`, a página toca. ⚠️ **`ref(objeto)`
  faz proxy reativo** — comparar o hover por `key`, não por identidade (`hovered === cell` dava
  sempre falso). Áudio é **string-accurate** (altura real por corda/casa via `Pitch`).
- **Seletor de afinação**: `TuningSelector` com o **shadcn Select** (dropdown). ⚠️ `<select>`
  colide com o elemento nativo → root importado com alias (`Select as SelectRoot` →
  `<select-root>`). `fretboard` é computed reativo a `selectedTuning` no view-model.
- **Gotcha do CLI shadcn**: `add <componente>` re-injeta o `@import` de fonte (JetBrains Mono)
  no `style.css` conforme `components.json` (`font: jetbrains-mono`). Remover após rodar o CLI —
  o app usa Cascadia Code.
- **Pendências (opcional)**: inlays das casas.

## Cartão de acorde (ChordCard) — mockup `apps/web/mockups/Chord-Card.png`
- **O que é**: cartão com o nome do acorde no topo e N **diagramas de digitação (voicings)** —
  posições reais no braço. Substituiu o `ChordDiagram` anterior (mapa de notas do acorde no
  braço), **removido** junto com `types/chord-note.ts` e o computed `chordPositions`.
- **Banco de voicings (hardcoded)**: domínio `instruments/chord-voicing.ts` (`ChordVoicing`
  = casa por corda 6ª→1ª, `null` abafada / `0` solta; helpers `isOpenPosition`/`lowestFret`/
  `highestFret`; `GuitarChord` = nome+fundamental+voicings) e `instruments/chord-voicings.ts`
  (`PREDEFINED_CHORDS`: C com as 3 variações do mockup + G/D/A/E/Am/Em/Dm, afinação padrão).
- **Componentes** (presentation-only): `chord-voicing-diagram/ChordVoicingDiagram.vue`
  (um voicing: braço horizontal pequeno `r=7.5`, janela de casas via `baseFret`/`fretCount`;
  pestana + cordas soltas à esquerda **só em posição aberta**; números de casa nas formas
  móveis; notas em `fill-brand-soft stroke-brand` + texto `fill-brand-foreground`, como a
  tônica do fretboard; clique emite `note-play`). `chord-card/ChordCard.vue` (fundo `bg-muted`
  `rounded-3xl`, título centralizado, linha de diagramas; prop **`maxVariations` default 3**).
- **View-model**: `toChordShape(voicing, chord)` resolve cada digitação em notas usando um
  `Fretboard` de **afinação padrão** (voicings assumem EADGBE, independem de `selectedTuning`);
  `selectedChordCard` busca em `PREDEFINED_CHORD_CARDS` pelo **nome** do acorde selecionado.
- **Integração**: `HarmonicField` selecionável (mantido); a página mostra **só** o cartão do
  acorde selecionado, no lugar do antigo mini-fretboard. Acorde sem digitação no banco (ex.: F,
  Bdim) → texto de fallback "Sem digitação predefinida para …".
- **Divergência do mockup**: números de casa aparecem em **todas** as formas móveis (o mockup
  mostrava só na 3ª) — mais consistente; fácil reverter se quiser.
- **Verificado**: C → 3 voicings (aberto + casas 3–7 e 8–12), notas C·E·G; Dm → D·F·A; F →
  fallback; typecheck limpo (pkg + web); sem erros no console; screenshot confere o mockup.
- **Fórmulas de acorde (domínio, para depois)**: `chords/chord-pattern.ts` + `chord-patterns.ts`
  (tríades, sextas, sétimas por intervalos da fundamental) + símbolos em `chord-qualities.ts` e
  fatores nomeados em `interval.ts`. **Não** usado pelo cartão; reservado para a página de estudo.
- **Preview/porta**: `vite.config` honra `process.env.PORT` (fallback 5173) e `.claude/launch.json`
  tem `autoPort: true` — necessário para o preview quando a 5173 já está ocupada (Vite não lê
  `PORT` sozinho).

## Decisões arquiteturais registradas (gerais)
- **Estado**: composable view-model domain-first; Pinia configurado porém **não utilizado** —
  introduzir só ao compartilhar entre rotas.
- **shadcn** é apenas Design System; componentes da app vivem nos módulos.
- Arquivos PascalCase; tags kebab-case; imports por diretório.

## Verificação (Fases 3–4)
- `pnpm --filter web build` (vue-tsc + vite) passa limpo; sem erros no console do preview.
- Fase 3: sidebar + header + pill de Root note (C default) + grade 3 colunas de Scale Type;
  seleção rosa via `--brand`; binding bidirecional OK (G + Harmonic Minor refletem nos dois
  seletores e no padrão derivado do domínio).
- Fase 4: lista Notes derivada de `scale.degrees()`. C maior → tonic, major second … major
  seventh; C harmônica menor → tonic, major second, minor third, perfect fourth, perfect
  fifth, minor sixth, major seventh. (Screenshot do preview ficou instável nesta sessão;
  verificação feita via `preview_eval` lendo o DOM + build limpo.)
- Fase 5: Campo Harmônico derivado de `scale.triads()`. C maior → C/Dm/Em/F/G/Am/Bdim com
  tonic…leading tone; C harmônica menor → Cm/Ddim/Ebaug/Fm/G/Ab/Bdim. Sem erros no console.
- Fase 6 (Fretboard): braço SVG derivado do domínio; C maior → 6 tônicas / 42 na escala /
  30 fora (total 78). Hover mostra `nota · intervalo` (ex.: `G · perfect fifth`) e aumenta a
  nota; clique dispara o áudio sem erro no console.
- Spelling enarmônico: C menor harmônica → Notes C/D/Eb/F/G/Ab/B; Harmonic Field
  Cm/Ddim/Ebaug/Fm/G/Ab/Bdim; fretboard grafa Eb/Ab nas notas da escala (fora seguem #).
