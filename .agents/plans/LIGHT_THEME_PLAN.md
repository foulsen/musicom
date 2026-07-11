# LIGHT_THEME_PLAN — tema claro em apps/web

> Plano para destravar o tema light na aplicação. Companions:
> [UI_AUDIT.md](./UI_AUDIT.md) · [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md).

- **Data:** 2026-07-10
- **Tese central:** o tema light **já existe na camada de tokens** — o `:root` do `style.css`
  carrega a paleta clara completa (neutros shadcn + valores light de `--brand`/`--brand-soft`
  calibrados na fase de fundação visual) e o dark é só o override da classe `.dark`. O app trava
  no escuro unicamente porque `index.html` hardcoda `<html class="dark">`. O trabalho portanto é
  **plumbing + toggle + sync + polimento**, não uma re-tokenização. As cores light atuais são
  **placeholder deliberado**: quando as cores dos mockups chegarem, a troca é uma edição de um
  único bloco (`:root` do `style.css`) — esse é o payoff da arquitetura de tokens.

## Decisões (confirmadas com o usuário em 2026-07-10)

- **Padrão continua dark** para quem nunca escolheu — preserva a identidade atual; light é opt-in.
- **Toggle binário Light/Dark** — sem opção "Sistema" (logo, sem `matchMedia`/listener de SO).
- **Controle só no modal Settings**, junto de idioma/instrumento/volume.
- (arquitetura) Tema **sincroniza como campo do agregado `preferences`** já existente — é
  exatamente o tipo de dado para o qual esse blob foi desenhado.
- (arquitetura) Persistência local numa **store Pinia própria** (`use-theme-store`), padrão das
  demais preferências. Considerado e rejeitado: `useColorMode` do `@vueuse/core` — resolveria o
  toggle, mas fica fora do pipeline Pinia→sync e duplicaria a fonte da verdade.

## Fase 0 — Auditoria (feita durante o planejamento)

- `@custom-variant dark (&:is(.dark *))` é **class-driven** — trocar tema em runtime é alternar a
  classe `dark` no `<html>`; nenhum CSS novo é necessário.
- Componentes consomem tokens via utilitárias (`bg-sidebar`, `fill-brand-soft`, `stroke-border`…),
  **incluindo todos os SVGs** (FretboardDiagram, ChromaticWheel, ChordVoicingDiagram, braços dos
  drills) — adaptam sozinhos.
- Únicas cores hardcoded encontradas: `bg-black/50` nos overlays (drawer do `AppLayout` +
  `SettingsDialog`) — scrim preto é correto nos dois temas, **manter**; e variantes `dark:` no
  `SelectTrigger` (geradas pelo shadcn, corretas por design).

## Fase 1 — Plumbing do tema (sem UI visível)

- `modules/settings/application/use-theme-store.ts`: store id `theme`, estado
  `{ mode: "dark" as ThemeMode }` com `ThemeMode = "light" | "dark"` (exportado), `persist: true`.
- `applyTheme(mode)` → `document.documentElement.classList.toggle("dark", mode === "dark")`;
  aplicado no boot e num `$subscribe`/`watch` da store (pode viver na própria store ou num
  composable fino no `app/`).
- **Anti-FOUC**: remover `class="dark"` do `index.html` e adicionar um script inline no `<head>`
  (antes do module script) que lê `localStorage.getItem("theme")`, faz `JSON.parse` com
  try/catch, default `"dark"`, e seta a classe **antes do primeiro paint**. Sem isso, usuário
  dark veria flash claro a cada load (pior que o status quo).
  - ⚠️ Gotcha: o script fica acoplado ao formato do `pinia-plugin-persistedstate`
    (chave = id da store, valor = JSON do estado → `{"mode":"dark"}`). Se o id ou shape mudar,
    atualizar o script. Mantê-lo defensivo: qualquer erro → dark.

## Fase 2 — Toggle no modal Settings

- Nova linha no `SettingsDialog` (junto ao Select de idioma): `ChipToggleGroup` com dois itens —
  Light (ícone `Sun`) e Dark (ícone `Moon`) — ligado ao `useThemeStore`.
- Ícones do `@lucide/vue`; sem colisão óbvia de tag, mas dado o histórico do projeto
  (`Play`/`Fretboard`/`select`), usar alias `SunIcon`/`MoonIcon` por segurança.
- i18n: `settings.theme` ("Theme"/"Tema"), `settings.themeLight` ("Light"/"Claro"),
  `settings.themeDark` ("Dark"/"Escuro") em `en.ts` + `pt.ts`.

## Fase 3 — Sync via agregado `preferences`

- `packages/shared-types/src/preferences.ts`: `themeSchema = z.enum(["light", "dark"])` +
  campo `theme: themeSchema.optional()` no `preferencesSnapshotSchema`. Teste novo em
  `contracts.test.ts` (aceita light/dark, rejeita valor desconhecido).
- Como `shared-types` é pacote workspace, a validação do `apps/api` acompanha sem mudança de
  código no servidor (snapshots são blobs validados pelo mesmo schema).
- `sync/aggregates.ts` (agregado `preferences`): `read` inclui `theme: themeStore.mode`;
  `apply` seta defensivamente (`if (data.theme) …`), como os demais campos.
- `sync/start-sync.ts`: adicionar `useThemeStore` aos `sourceStores` do `attachPushers` (sem
  isso, trocar o tema não dispara push).

## Fase 4 — Polimento da paleta light (placeholder até os mockups)

Passar página a página no light e ajustar **apenas valores de token** no `style.css`. Pontos já
previstos na auditoria:

| Token/superfície | Risco no light | Ação provável |
|---|---|---|
| `--sidebar` (0.985) vs `--background` (1) | distinção quase invisível | escurecer levemente a sidebar (~0.97) ou confiar no `border-r` |
| `stroke-border` (cordas/trastes do fretboard, 0.922) | linhas fracas sobre card branco | escurecer `--border` ou aceitar (comparar com mockup depois) |
| Notas "fora da escala" (`fill-muted` + `opacity-50`) | podem sumir no fundo claro | validar visualmente; ajustar `--muted` se preciso |
| `--brand-soft` / `--brand-soft-foreground` | contraste dos chips selecionados | conferir ≥ 4.5:1; ajustar L do foreground |
| `--muted-foreground` (0.556 sobre branco) | ~4.6:1, borderline | escurecer um passo se textos secundários ficarem fracos |
| Focus ring (`--ring` 0.708) | visibilidade em fundos claros | validar navegação por teclado |

Registrar cada token alterado num comentário curto — quando as cores do Figma chegarem, o swap é
mecânico e rastreável.

## Fase 5 — QA e fechamento

- Percorrer as 6 páginas + modal Settings + drawer mobile (375px) nos dois temas, nos dois
  idiomas; toggle ao vivo (sem reload); persistência após reload; **sem FOUC** (hard refresh).
- Sync: trocar tema → indicador "Syncing…" → "Synced"; simular segundo dispositivo (limpar
  localStorage, hidratar do servidor) → tema adotado.
- `pnpm --filter web build` (vue-tsc) + `turbo test` limpos.
- Atualizar `.agents/state/WEB_STATE.md`: a decisão "tema escuro por padrão, **sem toggle por
  enquanto**" fica superada por este plano (dark segue padrão, toggle existe).

## Status: implementado (2026-07-11)

Fases 1-5 implementadas e verificadas. Achados da Fase 4 (que não estavam no plano original,
descobertos via medição de contraste WCAG ao vivo no browser, não só inspeção visual):
- `--brand-foreground` (light): `oklch(0.985 0 0)` (quase branco) sobre `--brand` (L 0.65) dava
  contraste 3.46:1 — **falha AA** (mín. 4.5:1) em todo botão primário do app (`bg-brand` +
  `text-brand-foreground`: Play, Listen, Start, Continue, Reveal answer, tônica da roda cromática
  — 12 ocorrências). Trocado para `oklch(0.18 0 0)` (mesmo valor que o dark usa, só que o dark já
  inverte corretamente) → 5.18:1.
- `--ring`/`--sidebar-ring` (light): `oklch(0.708 0 0)` sobre fundo branco dava 2.58:1 (abaixo do
  ~3:1 recomendado para indicadores de foco). Escurecido para `oklch(0.55 0 0)` → 4.88:1, batendo
  com a qualidade do ring do dark mode (4.18:1).
- **Não mexido** (medido e confirmado como consistente com o dark, não é regressão do light):
  sidebar vs background quase idêntico (contraste ~1.04 light / ~1.10 dark — mesma filosofia
  minimalista nos dois temas) e `--border`/`stroke-border` fraco (~1.26 nos dois temas) — ambos são
  o próprio design system shadcn "neutral", não um bug introduzido pelo light.
- `--muted-foreground` (4.74:1) já passa AA, deixado como está.

Verificado: toggle ao vivo (sem reload), persistência (`localStorage.theme` = `{"mode":"..."}`),
sem FOUC (hard reload em light e em dark), dark mode bit-a-bit inalterado (só o bloco `:root` foi
tocado), 6 páginas + modal Settings + drawer mobile (375px) em EN e PT, `pnpm --filter web
vue-tsc -b` limpo, `pnpm test` (turbo, 4 pacotes, 57 testes) limpo. Sync com o backend real
(segundo dispositivo) não foi testado end-to-end (API não estava rodando neste preview) — só o
wiring de código (store → aggregate → pusher) foi verificado por leitura adversarial.

## Commits (Conventional Commits, por parte lógica, direto na main)

1. `feat(settings): runtime theme switching with persisted store` — Fase 1 (store + boot +
   anti-FOUC; app ainda idêntico para todo mundo, dark default).
2. `feat(settings): light/dark toggle in settings modal` — Fase 2 (+i18n).
3. `feat(shared-types): theme preference in preferences snapshot` — Fase 3 (schema + testes).
4. `feat(web): sync theme via preferences aggregate` — Fase 3 (aggregates + pushers).
5. `style(web): polish light palette tokens` — Fase 4 (placeholder até as cores do mockup).
