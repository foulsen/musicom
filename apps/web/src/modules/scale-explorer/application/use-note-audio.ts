import type { Pitch } from "@music-workspace/music-theory";

export function useNoteAudio() {
  let context: AudioContext | null = null;

  function play(pitch: Pitch) {
    context ??= new AudioContext();

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = pitch.frequency();

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  return { play };
}
