import { storeToRefs } from "pinia";

import type { Pitch } from "@music-workspace/music-theory";

import { useAudioSettingsStore } from "./use-audio-settings-store";

/**
 * `AudioContext` único para o app inteiro (escopo de módulo, não do composable).
 * Browsers limitam contextos simultâneos (~6 no Chrome); cada página que montasse
 * o seu próprio esgotava o limite ao navegar entre elas e silenciava o app.
 */
let sharedContext: AudioContext | null = null;

function ensureContext(): AudioContext {
  sharedContext ??= new AudioContext();

  if (sharedContext.state === "suspended") {
    sharedContext.resume().catch(() => {});
  }

  return sharedContext;
}

export function useNoteAudio() {
  const settings = useAudioSettingsStore();
  const { masterVolume, waveform } = storeToRefs(settings);

  /** Agenda uma nota isolada em `startTime` (segundos do relógio do `AudioContext`). */
  function scheduleNote(ctx: AudioContext, pitch: Pitch, startTime: number, duration = 0.5) {
    const oscillator = ctx.createOscillator();
    oscillator.type = waveform.value;
    oscillator.frequency.value = pitch.frequency();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(masterVolume.value, 0.0001), startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  function play(pitch: Pitch) {
    const ctx = ensureContext();
    scheduleNote(ctx, pitch, ctx.currentTime);
  }

  /** Toca várias alturas juntas; `strum` aplica um leve atraso entre elas (arpejo de violão). */
  function playChord(pitches: Pitch[], options: { strum?: boolean } = {}) {
    const ctx = ensureContext();
    const stagger = options.strum ? 0.03 : 0;

    pitches.forEach((pitch, index) => scheduleNote(ctx, pitch, ctx.currentTime + index * stagger));
  }

  /** Toca alturas em sequência (ex.: escala ascendente), uma após a outra. */
  function playSequence(pitches: Pitch[], options: { gapSeconds?: number; duration?: number } = {}) {
    const ctx = ensureContext();
    const gap = options.gapSeconds ?? 0.45;
    const duration = options.duration ?? gap * 0.9;

    pitches.forEach((pitch, index) => scheduleNote(ctx, pitch, ctx.currentTime + index * gap, duration));
  }

  return { play, playChord, playSequence, masterVolume, waveform };
}
