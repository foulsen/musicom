import type { Note } from "@music-workspace/music-theory";

/**
 * Oitava fixa usada para sonorizar a nota. O domínio trabalha com classes de
 * altura (sem oitava); tocar a altura real de cada corda/casa exigiria um
 * conceito de `Pitch` no domínio — melhoria futura.
 */
const OCTAVE = 4;

function frequencyOf(note: Note): number {
  const midi = 12 * (OCTAVE + 1) + note.index(); // C4 = 60
  return 440 * 2 ** ((midi - 69) / 12);
}

export function useNoteAudio() {
  let context: AudioContext | null = null;

  function play(note: Note) {
    context ??= new AudioContext();

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequencyOf(note);

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
