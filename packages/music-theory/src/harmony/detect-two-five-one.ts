import { Chord } from "../chords/chord";

import { ChordProgression } from "./chord-progression";

export function detectTwoFiveOne(chords: Chord[]) {
  const progressions: ChordProgression[] = [];

  for (let i = 0; i < chords.length - 2; i++) {
    const first = chords[i];
    const second = chords[i + 1];
    const third = chords[i + 2];

    const isTwo = first.degree.toString() === "2";

    const isFive = second.degree.toString() === "5";

    const isOne = third.degree.toString() === "1";

    if (isTwo && isFive && isOne) {
      progressions.push(new ChordProgression("II-V-I", [first, second, third]));
    }
  }

  return progressions;
}
