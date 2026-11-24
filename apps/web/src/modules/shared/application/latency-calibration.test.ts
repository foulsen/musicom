import { describe, expect, it } from "vitest";

import { estimateExtraLatencyMs, MAX_EXTRA_LATENCY_MS } from "./latency-calibration";

const clicks = Array.from({ length: 12 }, (_, i) => i * 0.6);

describe("estimateExtraLatencyMs", () => {
  it("measures a constant delay", () => {
    expect(estimateExtraLatencyMs(clicks, clicks.map((c) => c + 0.2))).toBe(200);
  });

  it("ignores stray taps through the median", () => {
    const taps = clicks.slice(0, 8).map((c) => c + 0.18);
    taps.push(1.0, 2.1); // fora de hora
    expect(estimateExtraLatencyMs(clicks, taps)).toBe(180);
  });

  it("returns null with too few taps", () => {
    expect(estimateExtraLatencyMs(clicks, [0.2, 0.8, 1.4])).toBeNull();
  });

  it("clamps early taps to zero and caps huge delays", () => {
    expect(estimateExtraLatencyMs(clicks, clicks.map((c) => c - 0.05))).toBe(0);
    expect(estimateExtraLatencyMs([0, 2, 4, 6, 8, 10, 12], [0.49, 2.49, 4.49, 6.49, 8.49, 10.49])).toBeLessThanOrEqual(
      MAX_EXTRA_LATENCY_MS,
    );
  });
});
