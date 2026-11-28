import { describe, expect, it } from "vitest";

import { Pitch } from "@music-workspace/music-theory";

import { cadenceChords, cadenceTimeline, melodyTimeline, timelineDurationMs } from "./cadence";

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

  it("scales every offset and duration by the tempo factor", () => {
    const target = tonic.transpose(4);
    const normal = cadenceTimeline(tonic, [target]);
    const fast = cadenceTimeline(tonic, [target], 2);

    expect(fast).toHaveLength(normal.length);
    normal.forEach((note, index) => {
      expect(fast[index].pitch.frequency()).toBeCloseTo(note.pitch.frequency());
      expect(fast[index].offsetSeconds).toBeCloseTo(note.offsetSeconds / 2);
      expect(fast[index].durationSeconds).toBeCloseTo(note.durationSeconds / 2);
    });
    expect(timelineDurationMs(fast)).toBeCloseTo(timelineDurationMs(normal) / 2, -1);
  });

  it("keeps the original timing when no tempo is given", () => {
    const target = tonic.transpose(4);

    const explicit = cadenceTimeline(tonic, [target], 1);
    const implicit = cadenceTimeline(tonic, [target]);

    expect(explicit.map((n) => [n.offsetSeconds, n.durationSeconds])).toEqual(
      implicit.map((n) => [n.offsetSeconds, n.durationSeconds]),
    );
  });

  it("melodyTimeline plays only the notes, spaced like the targets after the cadence", () => {
    const notes = [tonic, tonic.transpose(2), tonic.transpose(4)];
    const melody = melodyTimeline(notes);
    const afterCadence = cadenceTimeline(tonic, notes).slice(-notes.length);

    expect(melody.map((note) => note.pitch)).toEqual(notes);
    expect(melody[0].offsetSeconds).toBe(0);
    melody.forEach((note, index) => {
      expect(note.offsetSeconds - melody[0].offsetSeconds).toBeCloseTo(
        afterCadence[index].offsetSeconds - afterCadence[0].offsetSeconds,
      );
      expect(note.durationSeconds).toBeCloseTo(afterCadence[index].durationSeconds);
    });
  });

  it("melodyTimeline scales by the tempo factor", () => {
    const notes = [tonic, tonic.transpose(2)];
    const normal = melodyTimeline(notes);
    const fast = melodyTimeline(notes, 2);

    expect(fast[1].offsetSeconds).toBeCloseTo(normal[1].offsetSeconds / 2);
    expect(fast[1].durationSeconds).toBeCloseTo(normal[1].durationSeconds / 2);
  });
});
