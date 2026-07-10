import type { HealthStatus } from "./schema";

/** Liveness snapshot. Kept trivial for now — a real readiness check (DB ping) lands in phase 2. */
export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    uptime: process.uptime(),
  };
}
