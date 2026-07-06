# Plano de Implementação — Página de Estudo de Acordes (apps/web)

## Contexto

Segundo marco do `apps/web`. A primeira página (**Scale Explorer**) está concluída
(seletores, Notas/Graus, Campo Harmônico, Fretboard, Cartão de acordes, layout responsivo).
Agora entra uma **segunda rota**: uma página para **estudar um acorde isolado**.

O usuário escolhe **tônica + qualidade** e a página mostra o acorde "por dentro":
- a **fórmula** (os intervalos do `ChordPattern`: 1 · 3 · 5 · 7…);
- as **notas** do acorde (grafadas);
- o **mapa no braço** (as notas do acorde ao longo do fretboard);
- os **voicings** predefinidos, quando houver;
- e tocar o acorde (áudio já existe).

O domínio (`@music-workspace/music-theory`) segue como fonte da verdade; a UI não
reimplementa regra musical. O projeto continua sendo laboratório de frontend moderno —
cada fase exercita recursos atuais do ecossistema Vue quando agregarem sem prejudicar a
clareza.

### Decisões tomadas
- **Mapa no braço = reusar o `FretboardDiagram` diretamente**, sem recriar um `ChordDiagram`
  dedicado. Não há diferença prática entre os dois; **muda apenas quais notas são
  destacadas**. O view-model produz as posições categorizadas para o acorde e o componente
  existente as desenha; `showOutOfScale = false` (padrão atual) oculta o que não é do acorde.
- **Domínio ganha `createChord(root, ChordPattern)`** — espelho do `createScale`: monta o
  `Chord` (notas + grafia) a partir da fórmula. UI não duplica regra musical.
- **Tônicas separadas por página; Pinia adiado.** Decidido não compartilhar a tônica entre
  Scale Explorer e a página de acordes — cada página mantém seu próprio estado local (melhor
  UX). O Pinia **não** é forçado neste marco; entra só quando houver estado que realmente
  precise ser compartilhado entre rotas.
- **Linguagem visual reaproveitada**: tema escuro, token `--brand`, cards, fonte Cascadia
  Code, primitivas `reka-ui` diretas nos seletores (não o wrapper shadcn), conversão
  string↔domínio só na fronteira do componente.

### Mockups
Haverá mockups para esta página em um **subdiretório dedicado dentro de `apps/web/mockups/`**
(referente à página de estudo de acordes). O **caminho exato do subdiretório e o arquivo de
cada fase serão indicados na chamada do prompt** de cada fase visual — como nas fases 3–5 do
primeiro plano, que só começaram quando o mockup foi referenciado. Os dados do mockup são
**placeholder**; a UI sempre deriva do domínio conforme a seleção (tônica + qualidade).

### Reuso (inventário)
- **Domínio**: `ChordPattern` + `CHORD_PATTERNS` (14 qualidades), `Chord`, `Interval.name()`,
  `SpelledNote`, `Note`, `Fretboard`, `PREDEFINED_CHORDS`/`GuitarChord` (voicings),
  `createScale` (padrão a espelhar em `createChord`).
- **UI**: `FretboardDiagram`, `ChordCard`, `ChordVoicingDiagram`, `RootNoteSelector`,
  `AppLayout`/`AppSidebar`/`NavigationItem`.
- **App**: `use-note-audio`, o padrão `spelledByPitchClass` do view-model do Scale Explorer.

### Lacunas / a construir
- `createChord` no domínio (+ grafia enarmônica das notas do acorde: mapear cada intervalo ao
  seu grau diatônico — 3ª = 2 letras, 5ª = 4, 7ª = 6, 2ª = 1, 4ª = 3, 6ª = 5).
- Avaliar `Chord.degree`: hoje é obrigatório (contexto de escala). Um acorde isolado não tem
  grau — tornar opcional no `Chord` ou derivar (grau 1 da raiz).
- Categorização das posições do braço para um **acorde** alimentando `FretboardNote[][]`
  (`isTonic` = raiz do acorde, `inScale` = nota do acorde, `intervalName` relativo à raiz).
  *(Opcional/refino: renomear os campos de `FretboardNote` para algo neutro — `isRoot`/`inSet`
  — já que passam a servir escala e acorde; não é bloqueante.)*
- **Seletor de qualidade** (novo componente): grade das 14 qualidades de `CHORD_PATTERNS`.
- **Rota + item de navegação + store Pinia** para a tônica compartilhada.
- Ligação com os **voicings**: buscar no `PREDEFINED_CHORDS` pelo nome do acorde (como o
  cartão já faz), com fallback quando não houver digitação.

---

## Regra permanente: arquivo de estado (`WEB_STATE.md`)

**Ao final de CADA fase concluída**, atualizar `.agents/state/WEB_STATE.md` com:
- a **última fase implementada** (status + data);
- as **observações importantes** a carregar adiante (decisões, dívidas técnicas, gotchas);
- a **próxima fase**.

`WEB_STATE.md` segue como fonte única sobre "onde paramos" em todo o `apps/web`; este arquivo
é o plano completo deste marco. Toda sessão lê o estado antes de prosseguir e o grava ao
concluir uma fase.

---

## Fases

> Fases 0–2 **não dependem do mockup**. Fases 3–6 são **guiadas pelo mockup** (subdiretório em
> `apps/web/mockups/` indicado na chamada do prompt) e iniciam quando ele for referenciado.

### Fase 0 — Revisão & Baseline
- Consolidar o inventário de reuso e as lacunas acima.
- Confirmar que o dev server sobe e o shell renderiza; decidir o caminho da rota
  (ex.: `/chords`) e o rótulo do item de navegação.
- Registrar o marco em `WEB_STATE.md`.

### Fase 1 — Domínio: `createChord` *(domain-first, sem mockup)*
- `packages/music-theory/src/chords/create-chord.ts`:
  `createChord(root: Note, pattern: ChordPattern): Chord` — notas a partir dos intervalos da
  fórmula (`root.transpose`) e **grafia** das notas (regra uma-letra-por-grau adaptada aos
  graus do acorde). Exportar no `index`.
- Resolver o `Chord.degree` para acorde isolado (tornar opcional ou derivar).
- **Verificação (sem UI)**: C → C·E·G; Cmaj7 → C·E·G·B; Cdim → C·Eb·Gb; Csus4 → C·F·G; grafia
  coerente com a qualidade.

### Fase 2 — Rota e navegação *(sem mockup)*
- Nova rota para a página (placeholder inicial) + item no `AppSidebar` via `NavigationItem`.
- **Estado local** na própria página (view-model em composable, como o Scale Explorer); a
  tônica é independente da outra página. Sem Pinia.
- Página renderiza sob o shell, com o seletor de tônica reaproveitado (`RootNoteSelector`).

### Fase 3 — Seletor de qualidade *(mockup)*
- `modules/chord-explorer/components/chord-quality-selector/` (grade das 14 qualidades de
  `CHORD_PATTERNS`), primitivas `reka-ui` como os demais seletores; `v-model<ChordPattern>`;
  conversão para primitivo só na fronteira.

### Fase 4 — Fórmula & Notas *(mockup)*
- Componente(s) presentation-only exibindo a **fórmula** (intervalos: `1 · 3 · 5 · 7…` e/ou
  nomes via `Interval.name()`) e as **notas grafadas** do `createChord`. Estado derivado por
  `computed`; sem regra musical na UI.

### Fase 5 — Mapa no braço (reuso do `FretboardDiagram`) *(mockup)*
- **Sem alterar o componente**: o view-model computa `FretboardNote[][]` categorizado para o
  acorde (raiz destacada, notas do acorde destacadas, resto oculto por `showOutOfScale=false`;
  `intervalName` relativo à raiz do acorde) e passa ao `FretboardDiagram` existente.
- Afinação: reutilizar o `Fretboard`/seletor de afinação conforme o mockup.

### Fase 6 — Voicings & áudio do acorde *(mockup)*
- Reusar o `ChordCard` para os voicings predefinidos (lookup em `PREDEFINED_CHORDS` pelo nome
  do acorde; fallback quando não houver). Ação de **tocar o acorde** usando o áudio existente.

**Convenções (todas as fases):** arquivos PascalCase; tags kebab-case; imports por diretório;
um componente por responsabilidade; `src/components/ui` exclusivo do shadcn; sem estrutura
especulativa. **Ao final de cada fase, atualizar `WEB_STATE.md`.**

---

## Verificação

- **Build/Types**: `pnpm --filter web build` (vue-tsc) e `tsc` do `music-theory` sem erros.
- **Domínio (Fase 1)**: `createChord` cobre tríades, sextas e sétimas com notas e grafia
  corretas; idealmente com testes se a suíte de testes do domínio existir até lá.
- **Runtime**: `pnpm web`, navegar entre Scale Explorer e a nova rota; a tônica compartilhada
  (se adotada) acompanha; seleção de qualidade deriva o acorde do domínio.
- **Domain-first**: nenhuma regra musical reimplementada na UI; conversões string↔domínio só
  na fronteira dos seletores.
- **Fases visuais (3–6)**: comparar com o mockup do subdiretório indicado no prompt; dados
  vindos de `createChord`/domínio; reuso de `FretboardDiagram`/`ChordCard` sem duplicação.
- **Estado**: `WEB_STATE.md` reflete a última fase + observações ao concluir cada fase.
