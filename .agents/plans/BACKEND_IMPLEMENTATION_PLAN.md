# BACKEND_IMPLEMENTATION_PLAN — apps/api

> Plano de implementação do backend do Scale Explorer, ocupando a aplicação reservada `apps/api`
> (hoje vazia) e o pacote reservado `packages/shared-types` (hoje vazio).
> Companions: [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) · [WEB_IMPLEMENTATION_PLAN.md](./WEB_IMPLEMENTATION_PLAN.md).

- **Data:** 2026-07-10
- **Tese central:** o app é **local-first e deve continuar assim**. O backend não substitui o
  `localStorage` — ele vira a **fonte de sincronização por usuário** dos estados que hoje são
  presos ao navegador. Nada de teoria musical migra: o domínio (`music-theory`) é puro,
  determinístico e roda melhor no cliente (latência zero, offline). O que migra é **identidade,
  progresso e preferências**.

---

## 1. Avaliação: o que existe em `apps/web` e o que faz sentido migrar

Inventário completo do estado persistido (todos via `pinia-plugin-persistedstate` → `localStorage`,
configurado em `apps/web/src/app/create-pinia.ts`):

| Store (arquivo) | Estado | Veredito |
|---|---|---|
| `settings/use-user-store.ts` | `name` (perfil local; o próprio comentário diz "quando um backend existir, isto vira a fonte de hidratação inicial da sessão") | **Migra** — vira `users` + autenticação. É a âncora de tudo. |
| `learn/use-learn-store.ts` | `progress: Record<lessonId, {completedStepIndexes, checkpoint}>`, `lastVisitedLessonId` | **Migra** — progresso de trilhas é o dado mais valioso a proteger contra "limpei o navegador, perdi tudo". |
| `drills/use-drills-store.ts` | `cardStates: Record<cardId, LeitnerCardState>` (caixa + `dueAt`), recordes por nota (`fretboardBestMsByNote`), placar/streak do Note ID, `activeDeckId`, `fretboardNaturalsOnly` | **Migra** (agenda Leitner + recordes + placares). `activeDeckId` e `fretboardNaturalsOnly` são preferências de UI — vão no blob de preferências, não em tabela própria. |
| `ear-training/use-ear-training-store.ts` | `scores` por tipo de quiz, `streak`, `bestStreak`, `difficulty`, `intervalPlaybackMode` | **Migra** (placares/streaks). `difficulty` e `intervalPlaybackMode` são preferências → blob. |
| `shared/use-audio-settings-store.ts` | `masterVolume`, `instrument` | **Sincroniza como preferência** (blob), baixa prioridade — é quase configuração de dispositivo. |
| `scale-explorer` / `chord-explorer` / `mode-explorer` stores | Seleções de root/pattern/tuning etc. | **Não migra** — estado efêmero de navegação. Perder isso não dói; sincronizar cria mais conflito do que valor. |
| `i18n/index.ts` (`LOCALE_STORAGE_KEY`) | Locale escolhido | **Sincroniza como preferência** (blob), mas continua lendo do `localStorage` no boot (precisa do valor antes de qualquer request). |

O que **explicitamente não migra** (e por quê):

- **`packages/music-theory`** — puro e sem estado; duplicá-lo no servidor só cria drift. Se um dia
  o backend precisar validar algo musical (ex.: conferir resposta de checkpoint), ele importa o
  mesmo pacote do monorepo — vantagem de já sermos TypeScript ponta a ponta.
- **Geradores** (`question-generators.ts`, `checkpoint-generators.ts`) e **Leitner**
  (`leitner.ts`) — lógica determinística de cliente. Anti-cheat não é requisito de um app de
  estudo pessoal; gerar perguntas no servidor só adicionaria latência.
- **Currículo** (`learn/application/curriculum.ts`, 212 linhas) e **decks**
  (`flashcard-decks.ts`) — conteúdo estático versionado com o código. Servir via API só valeria
  se quiséssemos publicar conteúdo sem deploy do front; não é o caso agora. Fica como evolução
  futura (fase 6), não como parte do plano-base.
- **Áudio/render** — 100% cliente, óbvio mas registrado.

**Habilitadores futuros** que só existem com backend (motivação além de "não perder progresso"):
multi-dispositivo, histórico de tentativas para dashboards de evolução (o front hoje só guarda
agregados — placar/streak — e joga fora cada tentativa), e eventualmente conteúdo dinâmico.

---

## 2. Arquitetura proposta

### Stack (recomendação)

- **Fastify 5 + TypeScript** — leve, rápido, sem a cerimônia do Nest; consistente com o estilo
  enxuto do monorepo (Vite/Vitest/pnpm/turbo).
- **Drizzle ORM + SQLite** (via `better-sqlite3`) em dev, com schema compatível com **PostgreSQL**
  para quando houver deploy real. Drizzle é schema-em-TS, migrations versionadas, zero codegen.
- **Zod** para validação de entrada e como fonte dos contratos compartilhados.
- **Vitest** para testes (mesma ferramenta do web).

### `packages/shared-types` — contratos

O pacote reservado vira a casa dos **schemas Zod + tipos inferidos** de todos os DTOs:
`UserProfile`, `LearnProgressSnapshot`, `DrillsSnapshot`, `EarTrainingSnapshot`, `Preferences`.
Web valida o que recebe; API valida o que aceita; um único ponto de verdade. Os tipos de domínio
referenciados (ex.: `SingleNote` em `fretboardBestMsByNote`) continuam vindo de
`@music-workspace/music-theory` — `shared-types` depende dele, nunca o contrário.

### Modelo de sincronização: snapshot por agregado, local-first

- O `localStorage` continua sendo a verdade imediata (o app segue 100% funcional offline/deslogado).
- Cada agregado (learn, drills, ear-training, preferences) sobe/desce como **um snapshot inteiro**
  com `updatedAt`; conflito resolve por **last-write-wins por agregado**. Simples, suficiente para
  um usuário single-player, e evita a armadilha de merge fino prematuro.
- Fluxo: no login/boot autenticado, `GET` de cada agregado → merge no store (servidor ganha se
  `updatedAt` maior); a cada mutação, `PUT` **debounced** (~2s) do snapshot.
- Exceção deliberada: `cardStates` do Leitner pode crescer; se um dia doer, evolui para delta —
  não agora.

### Autenticação (decisão em aberto — recomendação incluída)

O perfil hoje é só um `name` local. Opções, da mais simples à mais completa:

1. **Conta anônima por dispositivo** (token opaco gerado no primeiro contato, guardado no
   cliente) — zero fricção, mas não dá multi-dispositivo de verdade.
2. **E-mail + magic link** — sem senha, multi-dispositivo, exige serviço de e-mail.
3. **Senha ou OAuth (Google)** — mais infra/atrito.

**Recomendação: começar com (1) e desenhar o schema para upgrade a (2)** — `users` já nasce com
coluna `email NULLABLE`; "vincular e-mail" vira uma feature posterior sem migração dolorosa.
Sessão via cookie httpOnly (mesma origem em prod; em dev, CORS restrito ao Vite).
⚠️ *Validar escopo com o usuário antes da fase 2 se houver preferência por login real desde o início.*

### Modelo de dados (Drizzle)

```
users            id (uuid) · name · email? · created_at
sessions         token (hash) · user_id · created_at · last_seen_at
learn_progress   user_id (pk) · snapshot (json) · updated_at
drills_state     user_id (pk) · snapshot (json) · updated_at
ear_training     user_id (pk) · snapshot (json) · updated_at
preferences      user_id (pk) · snapshot (json) · updated_at
```

Snapshots como JSON validado por Zod na borda — não normalizar `cardStates` em linhas por cartão
enquanto não houver query que precise disso (YAGNI; o dia que houver dashboard de evolução, a
tabela de **eventos** da fase 6 é a resposta certa, não a normalização do snapshot).

### Superfície da API (v1)

```
POST /v1/auth/anonymous          → cria user+sessão, devolve perfil
GET  /v1/me                      → perfil da sessão
PATCH /v1/me                     → atualiza name
GET|PUT /v1/sync/learn           → snapshot + updatedAt
GET|PUT /v1/sync/drills          →   "
GET|PUT /v1/sync/ear-training    →   "
GET|PUT /v1/sync/preferences     →   "
GET  /v1/health                  → liveness
```

---

## 3. Fases de implementação (commits por parte, Conventional Commits, direto na main)

### Fase 0 — Fundação do `apps/api` `[S]`
- Scaffold Fastify+TS em `apps/api` (`src/app.ts` cria a instância, `src/server.ts` escuta —
  separados para testar sem porta), `GET /v1/health`, `tsconfig` estendendo o padrão do repo,
  scripts `dev`/`build`/`test`/`lint` integrados ao pipeline do turbo.
- Estrutura de pastas espelhando o feature-based do web: `src/modules/<feature>/{routes,service,schema}.ts`.
- Commit: `feat(api): scaffold fastify app with health check`

### Fase 1 — Contratos em `packages/shared-types` `[S]`
- Criar o pacote (package.json, tsconfig, exports) com os schemas Zod dos 4 snapshots + perfil,
  derivados dos shapes atuais dos stores (fonte: os `state()` listados na seção 1).
- Web ainda não consome — só publica o contrato.
- Commit: `feat(shared-types): zod contracts for profile and sync snapshots`

### Fase 2 — Banco e autenticação anônima `[M]`
- Drizzle + SQLite, migrations, tabelas `users`/`sessions`.
- `POST /v1/auth/anonymous`, cookie de sessão, hook de autenticação, `GET/PATCH /v1/me`.
- Testes de integração (Vitest + `app.inject()` do Fastify, banco em memória).
- Commits: `feat(api): drizzle setup with users and sessions` · `feat(api): anonymous auth and profile endpoints`

### Fase 3 — Endpoints de sync `[M]`
- Tabelas de snapshot + rotas `GET|PUT /v1/sync/*` com validação Zod e LWW por `updatedAt`.
- Testes de contrato por agregado.
- Commit: `feat(api): snapshot sync endpoints for progress and preferences`

### Fase 4 — Cliente de sync no web `[M]`
- `apps/web/src/lib/api-client.ts` (fetch tipado pelos schemas de `shared-types`).
- Módulo `sync` em `apps/web/src/modules/shared/application/`: bootstrap de sessão anônima,
  hidratação no boot (merge por `updatedAt`), push debounced via `store.$subscribe`.
- `use-user-store` passa a hidratar do `/v1/me` quando online (cumprindo o comentário que já
  existe no arquivo); tudo degrada graciosamente sem rede.
- Proxy `/v1` no `vite.config.ts` para dev.
- Commits: `feat(web): typed api client and session bootstrap` · `feat(web): background sync for progress stores`

### Fase 5 — Robustez `[S]`
- Fila de retry para PUTs falhos (reenvio no próximo boot/online), indicador discreto de estado
  de sync no Settings dialog, rate limiting básico na API, logs estruturados (pino já vem com Fastify).
- Commit: `feat(web,api): sync resilience and status indicator`

### Fase 6 — Evoluções (fora do escopo-base; registrar, não fazer)
- **Vincular e-mail / magic link** (upgrade da conta anônima → multi-dispositivo real).
- **Tabela de eventos de tentativa** (`attempts`: user, tipo, item, correto, duração, timestamp)
  alimentando dashboards de evolução — o dado que hoje é descartado pelo front.
- **Currículo servido pela API** se surgir necessidade de publicar conteúdo sem deploy.

---

## 4. Riscos e questões abertas

- **Escopo de auth** — recomendação é anônimo-primeiro (§2); confirmar antes da fase 2.
- **Deploy** ainda indefinido (SQLite basta em dev; Postgres quando houver hosting) — nenhuma
  decisão do plano bloqueia essa escolha, pois Drizzle abstrai ambos.
- **Relógio do cliente** — `dueAt` do Leitner e `updatedAt` de LWW usam tempo do cliente; para
  single-user o risco é baixo, mas o servidor deve carimbar `updated_at` próprio e usá-lo como
  desempate.
- **Merge de primeiro login** — usuário com progresso local ganha conta nova: o primeiro push
  sobe o estado local integralmente (nunca hidratar do servidor vazio por cima do local).
