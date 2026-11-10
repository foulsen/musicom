import {
  drillsSnapshotSchema,
  earTrainingSnapshotSchema,
  learnSnapshotSchema,
  preferencesSnapshotSchema,
  readingSnapshotSchema,
  syncEnvelopeSchema,
} from "@music-workspace/shared-types";
import type { FastifyInstance } from "fastify";

import { drillsState, earTraining, learnProgress, preferences, readingState } from "../../db/schema";
import { authenticate } from "../auth/authenticate";
import { readSnapshot, writeSnapshot } from "./service";

/** URL slug -> its table + a precompiled envelope validator. */
const AGGREGATES = [
  { path: "learn", table: learnProgress, envelope: syncEnvelopeSchema(learnSnapshotSchema) },
  { path: "drills", table: drillsState, envelope: syncEnvelopeSchema(drillsSnapshotSchema) },
  { path: "ear-training", table: earTraining, envelope: syncEnvelopeSchema(earTrainingSnapshotSchema) },
  { path: "preferences", table: preferences, envelope: syncEnvelopeSchema(preferencesSnapshotSchema) },
  { path: "reading", table: readingState, envelope: syncEnvelopeSchema(readingSnapshotSchema) },
];

/**
 * Registers `GET|PUT /v1/sync/<aggregate>` for each synced store. GET returns
 * the stored envelope (or an empty `{ data: null, updatedAt: 0 }` sentinel so
 * the client can tell "nothing on server"). PUT validates against the
 * aggregate's zod contract and applies last-write-wins.
 */
export async function syncRoutes(app: FastifyInstance): Promise<void> {
  for (const { path, table, envelope } of AGGREGATES) {
    app.get(`/sync/${path}`, { preHandler: authenticate }, async (request) => {
      const stored = await readSnapshot(app.db, table, request.user!.id);

      return stored ?? { data: null, updatedAt: 0 };
    });

    app.put(`/sync/${path}`, { preHandler: authenticate }, async (request, reply) => {
      const parsed = envelope.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({ error: "BadRequest", issues: parsed.error.issues });
      }

      const result = await writeSnapshot(
        app.db,
        table,
        request.user!.id,
        parsed.data.data,
        parsed.data.updatedAt,
      );

      if (result.status === "stale") {
        return reply.code(409).send({ data: result.data, updatedAt: result.updatedAt });
      }

      return { data: result.data, updatedAt: result.updatedAt };
    });
  }
}
