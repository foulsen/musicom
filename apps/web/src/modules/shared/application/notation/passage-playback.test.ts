import { describe, expect, it } from "vitest";

import { Duration, SpelledPitch, createPassage, note, rest } from "@music-workspace/music-theory";

import { buildPassageTimeline } from "./passage-playback";

const quarter = Duration.of("quarter");
const eighth = Duration.of("eighth");

describe("buildPassageTimeline", () => {
  const fourQuarters = createPassage({ time: "4/4" }, [
    [note("C4", quarter), note("D4", quarter), note("E4", quarter), note("F4", quarter)],
  ]);

  it("places a one-measure count-in before the first note (4/4 at 60 bpm)", () => {
    const timeline = buildPassageTimeline(fourQuarters, { bpm: 60, countIn: true });

    expect(timeline.countInSeconds).toBeCloseTo(4);
    expect(timeline.clicks.map((click) => click.offsetSeconds)).toEqual([0, 1, 2, 3]);
    expect(timeline.clicks.map((click) => click.accent)).toEqual([true, false, false, false]);
    expect(timeline.notes[0].offsetSeconds).toBeCloseTo(4);
    expect(timeline.attackSeconds[0]).toBeCloseTo(0);
    expect(timeline.totalSeconds).toBeCloseTo(8);
  });

  it("has no count-in nor clicks by default", () => {
    const timeline = buildPassageTimeline(fourQuarters, { bpm: 60 });

    expect(timeline.countInSeconds).toBe(0);
    expect(timeline.clicks).toEqual([]);
    expect(timeline.totalSeconds).toBeCloseTo(4);
  });

  it("clicks every pulse during the passage, accenting each measure's first pulse", () => {
    const twoMeasures = createPassage({ time: "4/4" }, [
      [note("C4", Duration.of("whole"))],
      [note("D4", Duration.of("whole"))],
    ]);
    const timeline = buildPassageTimeline(twoMeasures, { bpm: 60, click: true });

    expect(timeline.clicks.map((click) => click.offsetSeconds)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(timeline.clicks.map((click) => click.accent)).toEqual([
      true, false, false, false, true, false, false, false,
    ]);
  });

  it("uses the dotted quarter as the pulse in 6/8", () => {
    const sixEight = createPassage({ time: "6/8" }, [
      [
        note("C4", eighth),
        note("D4", eighth),
        note("E4", eighth),
        note("F4", eighth),
        note("G4", eighth),
        note("A4", eighth),
      ],
    ]);
    const timeline = buildPassageTimeline(sixEight, { bpm: 60, countIn: true });

    expect(timeline.countInSeconds).toBeCloseTo(2);
    expect(timeline.clicks.map((click) => click.offsetSeconds)).toEqual([0, 1]);
    expect(timeline.attackSeconds[1] - timeline.attackSeconds[0]).toBeCloseTo(1 / 3);
    expect(timeline.attackSeconds[5]).toBeCloseTo(5 / 3);
    expect(timeline.totalSeconds).toBeCloseTo(4);
  });

  it("merges tied notes into one TimedPitch with the summed duration", () => {
    const tied = createPassage({ time: "4/4" }, [
      [note("C4", Duration.of("half"), { tieToNext: true }), note("C4", Duration.of("half"))],
    ]);
    const timeline = buildPassageTimeline(tied, { bpm: 60 });

    expect(timeline.notes).toHaveLength(1);
    expect(timeline.notes[0].durationSeconds).toBeCloseTo(4 * 0.95);
  });

  it("skips rests and emits one TimedPitch per chord pitch", () => {
    const chord = createPassage({ time: "4/4" }, [
      [rest(quarter), note(["C4", "E4", "G4"], quarter), rest(Duration.of("half"))],
    ]);
    const timeline = buildPassageTimeline(chord, { bpm: 60 });

    expect(timeline.attacks).toHaveLength(1);
    expect(timeline.notes).toHaveLength(3);
    expect(timeline.notes.every((timed) => Math.abs(timed.offsetSeconds - 1) < 1e-9)).toBe(true);
  });

  it("plays the pitchOverride on every attack", () => {
    const override = SpelledPitch.parse("A4");
    const timeline = buildPassageTimeline(fourQuarters, { bpm: 60, pitchOverride: override });

    expect(timeline.notes).toHaveLength(4);
    timeline.notes.forEach((timed) => expect(timed.pitch).toEqual(override.pitch()));
  });
});
