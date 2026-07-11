import type { UserProfile } from "@music-workspace/shared-types";
import type { Pinia } from "pinia";
import { watch } from "vue";

import { i18n } from "@/i18n";
import { ApiError, apiClient } from "@/lib/api-client";
import { useDrillsStore } from "@/modules/drills/application/use-drills-store";
import { useEarTrainingStore } from "@/modules/ear-training/application/use-ear-training-store";
import { useLearnStore } from "@/modules/learn/application/use-learn-store";
import { useAudioSettingsStore } from "@/modules/shared/application/use-audio-settings-store";
import { useUserStore } from "@/modules/settings/application/use-user-store";

import { AGGREGATES } from "./aggregates";
import { useSyncStore } from "./use-sync-store";

const PUSH_DEBOUNCE_MS = 2000;

/** Serialized snapshot last known to match the server, for change detection. */
const lastPushed: Record<string, string> = {};

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

/**
 * Boots the sync layer: establishes an anonymous session, reconciles server and
 * local state, then wires background pushes. Fire-and-forget — every network
 * call is guarded so the app stays fully usable offline.
 */
export async function startSync(pinia: Pinia): Promise<void> {
  const online = await bootstrapSession(pinia);
  if (!online) {
    return;
  }

  await hydrate(pinia);
  attachPushers(pinia);
}

/** Resolves (or creates) a session and reconciles the profile. Returns false offline. */
async function bootstrapSession(pinia: Pinia): Promise<boolean> {
  try {
    let profile: UserProfile;
    try {
      profile = await apiClient.getMe();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        profile = await apiClient.createAnonymous();
      } else {
        throw error;
      }
    }

    const user = useUserStore(pinia);
    if (profile.name) {
      user.name = profile.name;
    } else if (user.name) {
      await apiClient.updateMe({ name: user.name }).catch(() => undefined);
    }

    return true;
  } catch {
    return false;
  }
}

/** For each aggregate: adopt server state if newer, else push local up. */
async function hydrate(pinia: Pinia): Promise<void> {
  const sync = useSyncStore(pinia);

  for (const aggregate of AGGREGATES) {
    try {
      const server = await apiClient.getSnapshot(aggregate.slug);
      const local = sync.updatedAt[aggregate.key] ?? 0;

      if (server.data !== null && server.updatedAt > local) {
        const parsed = aggregate.schema.safeParse(server.data);
        if (parsed.success) {
          aggregate.apply(pinia, parsed.data);
          sync.updatedAt[aggregate.key] = server.updatedAt;
        }
      } else {
        const data = aggregate.read(pinia);
        const updatedAt = Math.max(local, Date.now());
        const result = await apiClient.putSnapshot(aggregate.slug, { data, updatedAt });
        if (result.ok) {
          sync.updatedAt[aggregate.key] = result.envelope.updatedAt;
        }
      }
    } catch {
      // Skip this aggregate; it will retry on the next local change.
    }

    lastPushed[aggregate.key] = JSON.stringify(aggregate.read(pinia));
  }
}

/** Subscribes to every source store so future edits push (debounced) to the server. */
function attachPushers(pinia: Pinia): void {
  const flushSoon = debounce(() => void flush(pinia), PUSH_DEBOUNCE_MS);

  const sourceStores = [
    useLearnStore(pinia),
    useDrillsStore(pinia),
    useEarTrainingStore(pinia),
    useAudioSettingsStore(pinia),
  ];
  for (const store of sourceStores) {
    store.$subscribe(() => flushSoon(), { detached: true });
  }

  // Locale isn't a Pinia store — watch the i18n ref directly.
  watch(() => i18n.global.locale.value, () => flushSoon());

  // Profile name syncs on its own endpoint, not as a snapshot aggregate.
  const user = useUserStore(pinia);
  const pushName = debounce(() => {
    if (user.name) {
      void apiClient.updateMe({ name: user.name }).catch(() => undefined);
    }
  }, PUSH_DEBOUNCE_MS);
  user.$subscribe(() => pushName(), { detached: true });
}

/** Pushes every aggregate whose serialized snapshot changed since the last push. */
async function flush(pinia: Pinia): Promise<void> {
  const sync = useSyncStore(pinia);

  for (const aggregate of AGGREGATES) {
    const current = JSON.stringify(aggregate.read(pinia));
    if (current === lastPushed[aggregate.key]) {
      continue;
    }

    try {
      const result = await apiClient.putSnapshot(aggregate.slug, {
        data: JSON.parse(current),
        updatedAt: Date.now(),
      });

      if (result.ok) {
        sync.updatedAt[aggregate.key] = result.envelope.updatedAt;
        lastPushed[aggregate.key] = current;
      } else {
        // Another device wrote newer — adopt the server's state.
        const parsed = aggregate.schema.safeParse(result.conflict.data);
        if (parsed.success) {
          aggregate.apply(pinia, parsed.data);
          sync.updatedAt[aggregate.key] = result.conflict.updatedAt;
          lastPushed[aggregate.key] = JSON.stringify(aggregate.read(pinia));
        }
      }
    } catch {
      // Stay dirty; the next change (or reload) retries.
    }
  }
}
