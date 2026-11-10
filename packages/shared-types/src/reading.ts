import { z } from "zod";

import { scoreSchema } from "./primitives";
import { syncEnvelopeSchema } from "./sync/envelope";

/** Chave de estatística por item (ex.: `treble:F#5`, `-2:major`) — o servidor não conhece o formato. */
const statKeySchema = z.string().min(1).max(64);
/** Id de nível: o servidor não conhece os níveis; o cliente valida contra `READING_LEVEL_IDS`. */
const levelIdSchema = z.string().min(1).max(64);

const emptyScore = () => ({ correct: 0, total: 0 });

const statsSchema = z.record(statKeySchema, scoreSchema);

/**
 * Progresso da prática de leitura de partitura (`use-reading-store`).
 * Todos os campos têm default igual ao do store, então snapshots antigos/parciais continuam válidos.
 */
export const readingSnapshotSchema = z.object({
  noteLevel: levelIdSchema.default("treble-staff"),
  noteStats: statsSchema.default({}),
  noteScore: scoreSchema.default(emptyScore),
  noteStreak: z.number().int().nonnegative().default(0),
  noteBestStreak: z.number().int().nonnegative().default(0),
  rhythmLevel: levelIdSchema.default("quarters"),
  rhythmBpm: z.number().min(40).max(140).default(70),
  /** Melhor precisão (0..1) por nível de ritmo — esparso. */
  rhythmBest: z.record(levelIdSchema, z.number().min(0).max(1)).default({}),
  dictationLevel: levelIdSchema.default("steps"),
  dictationScore: scoreSchema.default(emptyScore),
  dictationStreak: z.number().int().nonnegative().default(0),
  keyLevel: levelIdSchema.default("up-to-2"),
  keyStats: statsSchema.default({}),
  keyScore: scoreSchema.default(emptyScore),
});
export type ReadingSnapshot = z.infer<typeof readingSnapshotSchema>;

export const readingEnvelopeSchema = syncEnvelopeSchema(readingSnapshotSchema);
