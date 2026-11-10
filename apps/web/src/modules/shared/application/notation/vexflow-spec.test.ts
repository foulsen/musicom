import { createPassage, Duration, note, rest, TRIPLET } from "@music-workspace/music-theory";
import { describe, expect, it } from "vitest";

import { toVexflowSpec } from "./vexflow-spec";

const quarter = Duration.of("quarter");
const eighth = Duration.of("eighth");

describe("toVexflowSpec", () => {
  it("maps clef, key signature and time signature", () => {
    const passage = createPassage({ clef: "bass", fifths: -2, time: "3/4" }, [
      [note("D3", quarter), note("F3", quarter), note("A3", quarter)],
    ]);

    const spec = toVexflowSpec(passage, { showTimeSignature: true });

    expect(spec.clef).toBe("bass");
    expect(spec.keySpec).toBe("Bb");
    expect(spec.timeSpec).toBe("3/4");
    expect(spec.compound).toBe(false);
    expect(spec.measures).toHaveLength(1);
    expect(spec.measures[0].notes.map((n) => n.key)).toEqual(["0:0", "0:1", "0:2"]);
  });

  it("omits the time signature when asked to", () => {
    const passage = createPassage({ time: "6/8" }, [[note("C4", Duration.of("quarter", 1))]]);

    const spec = toVexflowSpec(passage, { showTimeSignature: false });

    expect(spec.timeSpec).toBeNull();
    expect(spec.compound).toBe(true);
  });

  it("draws an accidental only the first time it appears in a measure", () => {
    const passage = createPassage({}, [[note("F#4", quarter), note("F#4", quarter), rest(quarter), rest(quarter)]]);

    const [first, second] = toVexflowSpec(passage, { showTimeSignature: true }).measures[0].notes;

    expect(first.keys).toEqual(["f#/4"]);
    expect(first.accidentals).toEqual(["#"]);
    expect(second.accidentals).toEqual([null]);
  });

  it("places rests on the middle line of each clef", () => {
    const keysByClef = (["treble", "bass", "alto", "tenor"] as const).map((clef) => {
      const passage = createPassage({ clef }, [[rest(Duration.of("whole"))]]);
      const [restSpec] = toVexflowSpec(passage, { showTimeSignature: true }).measures[0].notes;

      expect(restSpec.isRest).toBe(true);
      expect(restSpec.duration).toBe("wr");
      expect(restSpec.accidentals).toEqual([]);

      return restSpec.keys[0];
    });

    expect(keysByClef).toEqual(["b/4", "d/3", "c/4", "a/3"]);
  });

  it("maps a dotted eighth to duration 8 with one dot", () => {
    const passage = createPassage({ time: "3/4" }, [[note("E4", Duration.of("eighth", 1)), note("G4", Duration.of("sixteenth"))]]);

    const [dotted, sixteenth] = toVexflowSpec(passage, { showTimeSignature: true }).measures[0].notes;

    expect(dotted.duration).toBe("8");
    expect(dotted.dots).toBe(1);
    expect(sixteenth.duration).toBe("16");
    expect(sixteenth.dots).toBe(0);
  });

  it("lists chord keys from the lowest to the highest pitch with aligned accidentals", () => {
    const passage = createPassage({}, [[note(["G4", "Eb4", "C4"], Duration.of("whole"))]]);

    const [chord] = toVexflowSpec(passage, { showTimeSignature: true }).measures[0].notes;

    expect(chord.keys).toEqual(["c/4", "eb/4", "g/4"]);
    expect(chord.accidentals).toEqual([null, "b", null]);
  });

  it("carries ties, articulations, dynamics and tuplets", () => {
    const passage = createPassage({}, [
      [
        note("C4", Duration.of("half"), { tieToNext: true, articulations: ["accent", "fermata"], dynamic: "mf" }),
        note("C4", Duration.of("eighth", 0, TRIPLET)),
        note("D4", Duration.of("eighth", 0, TRIPLET)),
        note("E4", Duration.of("eighth", 0, TRIPLET)),
      ],
    ]);

    const [tied, triplet] = toVexflowSpec(passage, { showTimeSignature: true }).measures[0].notes;

    expect(tied.tieToNext).toBe(true);
    expect(tied.articulations).toEqual(["a>", "a@a"]);
    expect(tied.dynamic).toBe("mf");
    expect(tied.tuplet).toBeNull();
    expect(triplet.tuplet).toEqual(TRIPLET);
  });
});
