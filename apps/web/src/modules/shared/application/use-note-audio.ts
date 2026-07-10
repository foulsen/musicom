import { storeToRefs } from "pinia";

import type { Pitch } from "@music-workspace/music-theory";

import { INSTRUMENT_PRESETS } from "./instrument-presets";
import { useAudioSettingsStore } from "./use-audio-settings-store";

/**
 * `AudioContext` único para o app inteiro (escopo de módulo, não do composable).
 * Browsers limitam contextos simultâneos (~6 no Chrome); cada página que montasse
 * o seu próprio esgotava o limite ao navegar entre elas e silenciava o app.
 */
let sharedContext: AudioContext | null = null;

/** Buffer de ruído branco reaproveitado entre notas — caro para gerar a cada toque. */
let sharedNoiseBuffer: AudioBuffer | null = null;

function ensureContext(): AudioContext {
  sharedContext ??= new AudioContext();

  if (sharedContext.state === "suspended") {
    sharedContext.resume().catch(() => {});
  }

  return sharedContext;
}

function ensureNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!sharedNoiseBuffer) {
    const seconds = 0.3;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    sharedNoiseBuffer = buffer;
  }

  return sharedNoiseBuffer;
}

export function useNoteAudio() {
  const settings = useAudioSettingsStore();
  const { masterVolume, instrument } = storeToRefs(settings);

  /**
   * Agenda uma nota isolada em `startTime` (segundos do relógio do `AudioContext`),
   * sintetizada como uma pequena série harmônica (ver `instrument-presets.ts`): cada
   * harmônico tem o seu próprio envelope de amplitude, o que permite o decaimento modal
   * (agudos morrem antes do fundamental) de cordas reais. Tudo passa por um passa-baixas
   * que fecha ao longo do tempo e, opcionalmente, por uma ressonância de corpo fixa.
   * `duration` é o intervalo mínimo antes da próxima nota poder soar (arpejo/sequência) —
   * o decaimento natural do instrumento pode se estender além dela, como num instrumento
   * real tocado sem abafar as cordas.
   */
  function scheduleNote(ctx: AudioContext, pitch: Pitch, startTime: number, duration = 0.5) {
    const preset = INSTRUMENT_PRESETS[instrument.value];
    const frequency = pitch.frequency();
    const peakVolume = Math.max(masterVolume.value, 0.0001);
    const attackEnd = startTime + preset.attack;
    const damping = preset.harmonicDamping ?? 0;
    const stopTime = Math.max(startTime + duration, attackEnd + preset.decay * 4);

    /** Ganho de saída = volume mestre constante (o envelope vive em cada harmônico). */
    const output = ctx.createGain();
    output.gain.value = peakVolume;
    output.connect(ctx.destination);

    // Ressonância de corpo (opcional): filtro "peaking" numa frequência absoluta, entre
    // o passa-baixas e a saída — o corpo de madeira ressoa igual, seja qual for a nota.
    let filterSink: AudioNode = output;
    if (preset.bodyResonanceHz) {
      const body = ctx.createBiquadFilter();
      body.type = "peaking";
      body.frequency.value = preset.bodyResonanceHz;
      body.Q.value = preset.bodyResonanceQ ?? 1;
      body.gain.value = preset.bodyResonanceGain ?? 3;
      body.connect(output);
      filterSink = body;
    }

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = preset.filterQ;
    filter.frequency.setValueAtTime(frequency * preset.filterStart, startTime);
    filter.frequency.setTargetAtTime(frequency * preset.filterEnd, attackEnd, preset.decay);
    filter.connect(filterSink);

    preset.harmonics.forEach(({ ratio, gain }) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;

      // Decaimento modal: harmônico mais agudo (ratio maior) decai mais rápido.
      const modeDecay = preset.decay / (1 + (ratio - 1) * damping);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.0001, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), attackEnd);
      harmonicGain.gain.setTargetAtTime(0.0001, attackEnd, modeDecay);

      oscillator.connect(harmonicGain).connect(filter);
      oscillator.start(startTime);
      oscillator.stop(stopTime);
    });

    if (preset.noiseAmount > 0) {
      const noiseStopTime = startTime + preset.noiseDecay * 4;

      const noise = ctx.createBufferSource();
      noise.buffer = ensureNoiseBuffer(ctx);

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = preset.noiseFilterType;
      noiseFilter.frequency.value = preset.noiseFilterFrequency;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(peakVolume * preset.noiseAmount, startTime);
      noiseGain.gain.setTargetAtTime(0.0001, startTime, preset.noiseDecay);

      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start(startTime);
      noise.stop(noiseStopTime);
    }
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

  return { play, playChord, playSequence, masterVolume, instrument };
}
