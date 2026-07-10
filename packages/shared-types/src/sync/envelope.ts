import { z } from "zod";

/**
 * Every synced aggregate travels wrapped in this envelope. `updatedAt` is epoch
 * milliseconds and drives last-write-wins conflict resolution (plan §2). The
 * server stamps its own authoritative `updatedAt` on write and returns it.
 */
export function syncEnvelopeSchema<Schema extends z.ZodTypeAny>(dataSchema: Schema) {
  return z.object({
    data: dataSchema,
    updatedAt: z.number().int().nonnegative(),
  });
}

export type SyncEnvelope<Data> = {
  data: Data;
  updatedAt: number;
};
