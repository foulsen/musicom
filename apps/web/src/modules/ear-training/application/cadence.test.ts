import { describe, expect, it } from "vitest";

import { Pitch } from "@music-workspace/music-theory";

import { cadenceChords, cadenceTimeline, timelineDurationMs } from "./cadence";

describe("cadence", () => {
  const tonic = Pitch.from("C", 4);

  it("builds I–IV–V–I around the tonic", () => {
    const names = cadenceChords(tonic).map((chord) => chord.map((pitch) => pitch.note.toString()));

    expect(names).toEqual([
      ["C", "C", "E", "G"],
      ["F", "C", "F", "A"],
      ["G", "B", "D", "G"],
      ["C", "C", "E", "G"],
    ]);
  });

  it("plays the target only after the cadence ends", () => {
    const target = tonic.transpose(4);
    const timeline = cadenceTimeline(tonic, [target]);
    const last = timeline.at(-1)!;
    const chordsEnd = Math.max(...timeline.slice(0, -1).map((note) => note.offsetSeconds + note.durationSeconds));

    expect(last.pitch).toBe(target);
    expect(last.offsetSeconds).toBeGreaterThan(chordsEnd);
    expect(timelineDurationMs(timeline)).toBe(Math.round((last.offsetSeconds + last.durationSeconds) * 1000));
  });
});
