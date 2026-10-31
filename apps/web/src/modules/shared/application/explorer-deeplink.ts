import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LocationQueryRaw, RouteLocationRaw } from "vue-router";

/**
 * Contrato único de query string dos três exploradores (Scale/Chord/Mode) — usado tanto
 * para deep-link de fora (Harmonic Field, Songbook) quanto pelas Trilhas de aprendizado.
 * Todos os campos são opcionais; ausentes mantêm o estado persistido do explorador.
 */
export interface ExplorerLinkConfig {
  root?: string;
  pattern?: string;
  family?: string;
  quality?: string;
  tuning?: string;
  degree?: string | number;
}

/** Lição (e passo, 0-based) para onde o banner "voltar à lição" do explorador deve levar de volta. */
export interface ExplorerReturnTarget {
  lessonId: string;
  stepIndex?: number;
}

const CONFIG_KEYS = ["root", "pattern", "family", "quality", "tuning", "degree"] as const;

/**
 * Monta a rota de deep-link para um explorador, descartando campos vazios. Com `returnTo`,
 * acrescenta `from=learn&lesson=<id>[&step=<n>]` para o explorador mostrar o banner de retorno.
 */
export function buildExplorerLink(
  path: string,
  config: ExplorerLinkConfig,
  returnTo?: ExplorerReturnTarget,
): RouteLocationRaw {
  const query: Record<string, string> = {};

  for (const key of CONFIG_KEYS) {
    const value = config[key];
    if (value !== undefined && value !== null && value !== "") {
      query[key] = String(value);
    }
  }

  if (returnTo) {
    query.from = "learn";
    query.lesson = returnTo.lessonId;
    if (returnTo.stepIndex !== undefined) query.step = String(returnTo.stepIndex);
  }

  return { path, query };
}

/**
 * Hidrata um explorador a partir da query string ao montar (root/pattern/family/quality/…),
 * então limpa esses params da URL. Reconhece `from=learn&lesson=<id>` para o banner "voltar à
 * lição" (e o `step` opcional do passo de origem) — esses **não** são consumidos por `apply`, só
 * preservados na URL para o retorno.
 */
export function useExplorerDeeplink(apply: (config: ExplorerLinkConfig) => void) {
  const route = useRoute();
  const router = useRouter();

  const returnLessonId = ref<string | null>(null);

  onMounted(() => {
    const config: ExplorerLinkConfig = {};

    for (const key of CONFIG_KEYS) {
      const value = route.query[key];
      if (typeof value === "string" && value !== "") config[key] = value;
    }

    const from = route.query.from;
    const lesson = route.query.lesson;
    if (from === "learn" && typeof lesson === "string") {
      returnLessonId.value = lesson;
    }

    const hasConfig = Object.keys(config).length > 0;
    if (hasConfig) apply(config);

    if (hasConfig || returnLessonId.value) {
      const preserved: LocationQueryRaw = {};
      if (returnLessonId.value) {
        preserved.from = "learn";
        preserved.lesson = returnLessonId.value;
      }
      const step = route.query.step;
      if (returnLessonId.value && typeof step === "string") preserved.step = step;

      router.replace({ query: preserved });
    }
  });

  return { returnLessonId };
}
