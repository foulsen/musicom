import { describe, expect, it } from "vitest";

import { SpelledNote } from "../notes/spelled-note";
import { SpelledPitch } from "../notes/spelled-pitch";
import { Clef } from "./clef";
import { Duration, TRIPLET } from "./duration";
import { KEY_SIGNATURES, KeySignature } from "./key-signature";
import {
  createPassage,
  measureAccidentalMarks,
  note,
  passageAttacks,
  passageSignature,
  rest,
  secondsPerTick,
} from "./passage";
import { TimeSignature } from "./time-signature";

const pitch = (text: string) => SpelledPitch.parse(text);
const spelled = (text: string) => {
  const parsed = SpelledPitch.parse(`${text}4`);
  return parsed.spelled;
};

describe("Clef", () => {
  it("positions pitches relative to the bottom line", () => {
    expect(Clef.TREBLE.staffPosition(pitch("E4"))).toBe(0);
    expect(Clef.TREBLE.staffPosition(pitch("F5"))).toBe(8);
    expect(Clef.TREBLE.staffPosition(pitch("C4"))).toBe(-2);
    expect(Clef.BASS.staffPosition(pitch("G2"))).toBe(0);
    expect(Clef.ALTO.staffPosition(pitch("C4"))).toBe(4);
    expect(Clef.TENOR.staffPosition(pitch("C4"))).toBe(6);
  });

  it("counts ledger lines", () => {
    expect(Clef.TREBLE.ledgerLineCount(Clef.TREBLE.staffPosition(pitch("C4")))).toBe(1);
    expect(Clef.TREBLE.ledgerLineCount(Clef.TREBLE.staffPosition(pitch("A5")))).toBe(1);
    expect(Clef.TREBLE.ledgerLineCount(Clef.TREBLE.staffPosition(pitch("B3")))).toBe(1);
    expect(Clef.TREBLE.ledgerLineCount(Clef.TREBLE.staffPosition(pitch("G5")))).toBe(0);
    expect(Clef.TREBLE.ledgerLineCount(4)).toBe(0);
  });

  it("maps positions back to pitches and tells lines from spaces", () => {
    expect(Clef.BASS.pitchAt(0).toString()).toBe("G2");
    expect(Clef.TREBLE.pitchAt(3, 1).toString()).toBe("A#4");
    expect(Clef.TREBLE.isLine(2)).toBe(true);
    expect(Clef.TREBLE.isLine(3)).toBe(false);
    expect(Clef.from("alto")).toBe(Clef.ALTO);
  });
});

describe("KeySignature", () => {
  it("derives major and minor tonics for every key", () => {
    const majors = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
    const minors = ["Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"];

    KEY_SIGNATURES.forEach((key, index) => {
      expect(key.fifths).toBe(index - 7);
      expect(key.majorTonic().toString()).toBe(majors[index]);
      expect(key.minorTonic().toString()).toBe(minors[index]);
      expect(key.tonic("minor").toString()).toBe(minors[index]);
    });
  });

  it("finds a signature from a tonic", () => {
    expect(KeySignature.forMajor(spelled("Bb")).fifths).toBe(-2);
    expect(KeySignature.forMinor(spelled("F#")).fifths).toBe(3);
    expect(KeySignature.forMinor(new SpelledNote("A", 0)).fifths).toBe(0);
  });

  it("throws for keys beyond seven accidentals", () => {
    expect(() => KeySignature.forMajor(spelled("G#"))).toThrow(RangeError);
    expect(() => new KeySignature(8)).toThrow(RangeError);
  });

  it("lists accidentals in writing order", () => {
    expect(new KeySignature(3).accidentals().map(String)).toEqual(["F#", "C#", "G#"]);
    expect(new KeySignature(-3).accidentals().map(String)).toEqual(["Bb", "Eb", "Ab"]);
    expect(new KeySignature(0).accidentals()).toEqual([]);
    expect(new KeySignature(2).accidentalFor("C")).toBe(1);
    expect(new KeySignature(-1).accidentalFor("B")).toBe(-1);
    expect(new KeySignature(-1).accidentalFor("E")).toBe(0);
  });
});

describe("Duration", () => {
  it("computes ticks with dots and tuplets", () => {
    expect(Duration.of("quarter").ticks()).toBe(960);
    expect(Duration.of("whole").ticks()).toBe(3840);
    expect(Duration.of("thirty-second").ticks()).toBe(120);
    expect(Duration.of("quarter", 1).ticks()).toBe(1440);
    expect(Duration.of("eighth", 0, TRIPLET).ticks()).toBe(320);
    expect(Duration.of("half", 2).ticks()).toBe(3360);
  });

  it("throws when the duration is not a whole number of ticks", () => {
    expect(() => Duration.of("thirty-second", 0, { actual: 7, normal: 4 }).ticks()).toThrow();
  });
});

describe("TimeSignature", () => {
  it("measures compound and simple meters", () => {
    const sixEight = TimeSignature.parse("6/8");

    expect(sixEight.isCompound()).toBe(true);
    expect(sixEight.pulsesPerMeasure()).toBe(2);
    expect(sixEight.pulseTicks()).toBe(1440);
    expect(sixEight.measureTicks()).toBe(2880);
    expect(sixEight.toString()).toBe("6/8");

    const threeFour = TimeSignature.parse("3/4");
    expect(threeFour.isCompound()).toBe(false);
    expect(threeFour.pulseTicks()).toBe(960);

    expect(TimeSignature.parse("12/8").pulsesPerMeasure()).toBe(4);
    expect(TimeSignature.parse("3/8").isCompound()).toBe(false);
    expect(TimeSignature.parse("4/4").measureTicks()).toBe(3840);
  });
});

describe("passage", () => {
  const quarter = Duration.of("quarter");
  const half = Duration.of("half");

  it("merges tied notes across a barline into one attack", () => {
    const passage = createPassage({}, [
      [note("C4", half), note("D4", quarter), note("E4", quarter, { tieToNext: true })],
      [note("E4", half), rest(half)],
    ]);

    const attacks = passageAttacks(passage);

    expect(attacks.map((attack) => attack.tick)).toEqual([0, 1920, 2880]);
    expect(attacks[2].durationTicks).toBe(960 + 1920);
    expect(attacks[2].measureIndex).toBe(0);
    expect(attacks[2].eventIndex).toBe(2);
  });

  it("skips rests and does not carry a tie over a rest", () => {
    const passage = createPassage({}, [
      [rest(quarter), note("C4", quarter, { tieToNext: true }), rest(quarter), note("C4", quarter)],
    ]);

    const attacks = passageAttacks(passage);

    expect(attacks.map((attack) => attack.tick)).toEqual([960, 2880]);
    expect(attacks.map((attack) => attack.durationTicks)).toEqual([960, 960]);
  });

  it("marks an accidental only when it differs from the signature or earlier notes in the measure", () => {
    const repeated = createPassage({}, [[note("F#4", quarter), note("F#4", quarter)]]);
    expect(measureAccidentalMarks(repeated.measures[0], repeated.key)).toEqual([["#"], [null]]);

    const inG = createPassage({ fifths: 1 }, [[note("F#4", quarter), note("F4", quarter), note("F4", quarter)]]);
    expect(measureAccidentalMarks(inG.measures[0], inG.key)).toEqual([[null], ["n"], [null]]);

    const octaves = createPassage({}, [[note("F#4", quarter), note("F5", quarter), rest(half)]]);
    expect(measureAccidentalMarks(octaves.measures[0], octaves.key)).toEqual([["#"], [null], []]);

    const flats = createPassage({}, [[note("Bbb4", quarter), note("B#4", quarter)]]);
    expect(measureAccidentalMarks(flats.measures[0], flats.key)).toEqual([["bb"], ["#"]]);
  });

  it("converts bpm to seconds per tick counting pulses", () => {
    const fourFour = TimeSignature.parse("4/4");
    expect(secondsPerTick(60, fourFour) * 960).toBeCloseTo(1, 10);

    const sixEight = TimeSignature.parse("6/8");
    expect(secondsPerTick(60, sixEight) * 1440).toBeCloseTo(1, 10);
  });

  it("builds a deterministic signature", () => {
    const passage = createPassage({ clef: "bass", fifths: -1, time: "3/4" }, [
      [note(["C3", "E3"], quarter, { tieToNext: true }), rest(Duration.of("eighth", 1)), note("G2", half)],
      [note("C3", Duration.of("eighth", 0, TRIPLET))],
    ]);

    expect(passageSignature(passage)).toBe(
      "bass|-1|3/4|C3+E3.quarter.0~ r.eighth.1 G2.half.0|C3.eighth.0.t",
    );
  });
});
