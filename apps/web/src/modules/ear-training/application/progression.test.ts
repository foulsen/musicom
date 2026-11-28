import { describe, expect, it } from "vitest";

import { Pitch } from "@music-workspace/music-theory";

import { timelineDurationMs } from "./cadence";
import { PROGRESSION_ENTRIES, progressionChords, progressionTimeline } from "./progression";

const tonic = Pitch.from("C", 4);

function names(chords: Pitch[][] | null): string[][] {
  return (chords ?? []).map((chord) => chord.map((pitch) => pitch.note.toString()));
}

describe("progressionChords", () => {
  it("builds I–V–vi–IV in C as bass + triad per chord", () => {
    const chords = progressionChords("I-V-vi-IV", tonic);

    expect(names(chords)).toEqual([
      ["C", "C", "E", "G"],
      ["G", "B", "D", "G"],
      ["A", "C", "E", "A"],
      ["F", "C", "F", "A"],
    ]);
  });

  it("spells the minor and borrowed chords of i–♭VI–♭III–♭VII in C", () => {
    const chords = names(progressionChords("i-bVI-bIII-bVII", tonic));

    expect(chords.map((chord) => chord[0])).toEqual(["C", "G#", "D#", "A#"]);
    expect(chords.map((chord) => [...chord.slice(1)].sort())).toEqual([
      ["C", "D#", "G"],
      ["C", "D#", "G#"],
      ["A#", "D#", "G"],
      ["A#", "D", "F"],
    ]);
  });

  it("returns null for an unknown id", () => {
    expect(progressionChords("nope", tonic)).toBeNull();
  });

  it.each(PROGRESSION_ENTRIES.map(([item]) => item.id))(
    "%s: ascending voices, bass below the tonic, smooth voice leading",
    (id) => {
      const chords = progressionChords(id, tonic)!;

      expect(chords.length).toBeGreaterThanOrEqual(3);

      chords.forEach((chord) => {
        const midis = chord.map((pitch) => pitch.midi());

        expect(chord).toHaveLength(4);
        midis.slice(1).forEach((midi, index) => expect(midi).toBeGreaterThan(midis[index]));
        expect(midis[0]).toBeLessThan(tonic.midi());
        expect(midis[1]).toBeGreaterThanOrEqual(tonic.midi() - 5);
        expect(midis[3]).toBeLessThanOrEqual(tonic.midi() + 16);
      });

      // As vozes superiores andam pouco entre acordes consecutivos.
      for (let index = 1; index < chords.length; index++) {
        const moved = [1, 2, 3].reduce(
          (total, voice) => total + Math.abs(chords[index][voice].midi() - chords[index - 1][voice].midi()),
          0,
        );

        expect(moved).toBeLessThanOrEqual(12);
      }
    },
  );

  it("transposes with the tonic", () => {
    const inD = progressionChords("ii-V-I", Pitch.from("D", 4))!;

    expect(names([inD[0]])[0]).toEqual(["E", "E", "G", "B"]);
  });
});

describe("progressionTimeline", () => {
  it("plays one chord per step, in order, all voices together", () => {
    const timeline = progressionTimeline("I-IV-V-I", tonic);
    const offsets = [...new Set(timeline.map((note) => note.offsetSeconds))];

    expect(timeline).toHaveLength(16);
    expect(offsets).toHaveLength(4);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
    expect(offsets[1] - offsets[0]).toBeCloseTo(0.9);
    timeline.forEach((note) => expect(note.durationSeconds).toBeGreaterThan(0));
  });

  it("scales every offset and duration by the tempo factor", () => {
    const normal = progressionTimeline("ii-V-I", tonic);
    const fast = progressionTimeline("ii-V-I", tonic, 2);

    expect(fast).toHaveLength(normal.length);
    normal.forEach((note, index) => {
      expect(fast[index].pitch.midi()).toBe(note.pitch.midi());
      expect(fast[index].offsetSeconds).toBeCloseTo(note.offsetSeconds / 2);
      expect(fast[index].durationSeconds).toBeCloseTo(note.durationSeconds / 2);
    });
    expect(timelineDurationMs(fast)).toBeCloseTo(timelineDurationMs(normal) / 2, -1);
  });

  it("is empty for an unknown id", () => {
    expect(progressionTimeline("nope", tonic)).toEqual([]);
  });
});
