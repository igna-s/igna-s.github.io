import type { Action } from "./game-state.ts";

export type SfxCue =
  | Action["type"]
  | "ARRIVAL"
  | "OVEN_PROGRESS"
  | "OVEN_READY"
  | "OVEN_BURNING"
  | "RESULT_LOW"
  | "RESULT_HIGH";

type Tone = {
  frequency: number;
  delay?: number;
  duration?: number;
  gain?: number;
  wave?: OscillatorType;
  endFrequency?: number;
};

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") sharedAudioContext = new AudioCtor();
  if (sharedAudioContext.state === "suspended") void sharedAudioContext.resume();
  return sharedAudioContext;
}

export function playNoise(context: AudioContext, start: number, duration = 0.1, gainValue = 0.025) {
  const frames = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < frames; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1450;
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
  source.stop(start + duration);
}

export function playSfx(cue: SfxCue) {
  if (cue === "TICK") return;
  const context = getAudioContext();
  if (!context) return;
  const patterns: Partial<Record<SfxCue, Tone[]>> = {
    ACCEPT: [{ frequency: 392, duration: 0.12, wave: "triangle" }, { frequency: 523, delay: 0.1, duration: 0.18, wave: "triangle" }],
    PLACE: [{ frequency: 250, duration: 0.06, wave: "triangle", endFrequency: 185 }],
    ADD_SAUCE: [{ frequency: 135, duration: 0.16, wave: "sawtooth", endFrequency: 92, gain: 0.025 }],
    ADD_CHEESE: [{ frequency: 720, duration: 0.04, wave: "square", gain: 0.012 }, { frequency: 910, delay: 0.05, duration: 0.04, wave: "square", gain: 0.01 }, { frequency: 780, delay: 0.1, duration: 0.04, wave: "square", gain: 0.01 }],
    BAKE: [{ frequency: 92, duration: 0.2, wave: "sine", endFrequency: 58, gain: 0.05 }, { frequency: 185, delay: 0.05, duration: 0.14, wave: "sawtooth", gain: 0.018 }],
    TAKE_OUT: [{ frequency: 330, duration: 0.08, wave: "triangle" }, { frequency: 494, delay: 0.07, duration: 0.16, wave: "triangle" }],
    ADD_CUT: [{ frequency: 1180, duration: 0.055, wave: "sawtooth", endFrequency: 520, gain: 0.018 }],
    AUTO_CUT: [{ frequency: 420, duration: 0.06 }, { frequency: 560, delay: 0.07, duration: 0.06 }, { frequency: 700, delay: 0.14, duration: 0.1 }],
    FINISH: [{ frequency: 523, duration: 0.1 }, { frequency: 659, delay: 0.09, duration: 0.1 }, { frequency: 784, delay: 0.18, duration: 0.22 }],
    NEXT: [{ frequency: 587, duration: 0.08, wave: "triangle" }, { frequency: 880, delay: 0.09, duration: 0.16, wave: "triangle" }],
    SWITCH_ORDER: [{ frequency: 315, duration: 0.07, wave: "triangle", endFrequency: 390 }],
    NAV_STATION: [{ frequency: 220, duration: 0.045, wave: "square", gain: 0.014 }, { frequency: 294, delay: 0.04, duration: 0.06, wave: "square", gain: 0.012 }],
    RESTART_ORDER: [{ frequency: 260, duration: 0.08, wave: "triangle" }, { frequency: 175, delay: 0.08, duration: 0.15, wave: "triangle" }],
    TOGGLE_OVEN: [{ frequency: 110, duration: 0.18, wave: "sawtooth", endFrequency: 165, gain: 0.025 }],
    TOGGLE_SOUND: [{ frequency: 440, duration: 0.06 }, { frequency: 660, delay: 0.07, duration: 0.12 }],
    ARRIVAL: [{ frequency: 659, duration: 0.08, wave: "triangle" }, { frequency: 880, delay: 0.1, duration: 0.08, wave: "triangle" }, { frequency: 988, delay: 0.2, duration: 0.16, wave: "triangle" }],
    OVEN_PROGRESS: [{ frequency: 176, duration: 0.055, wave: "sine", gain: 0.018 }],
    OVEN_READY: [{ frequency: 523, duration: 0.08 }, { frequency: 784, delay: 0.1, duration: 0.16 }],
    OVEN_BURNING: [{ frequency: 210, duration: 0.12, wave: "square", gain: 0.02 }, { frequency: 175, delay: 0.16, duration: 0.12, wave: "square", gain: 0.02 }, { frequency: 210, delay: 0.32, duration: 0.16, wave: "square", gain: 0.02 }],
    RESULT_LOW: [{ frequency: 294, duration: 0.12, wave: "triangle" }, { frequency: 220, delay: 0.13, duration: 0.22, wave: "triangle" }],
    RESULT_HIGH: [{ frequency: 523, duration: 0.1 }, { frequency: 659, delay: 0.1, duration: 0.1 }, { frequency: 784, delay: 0.2, duration: 0.1 }, { frequency: 1047, delay: 0.3, duration: 0.25 }],
  };
  const pattern = patterns[cue] ?? [{ frequency: 285, duration: 0.055, wave: "triangle", gain: 0.018 }];
  const now = context.currentTime + 0.015;
  pattern.forEach((tone) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + (tone.delay ?? 0);
    const duration = tone.duration ?? 0.1;
    oscillator.type = tone.wave ?? "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency ?? tone.frequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.032, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
  if (["ADD_SAUCE", "ADD_CHEESE", "BAKE", "TAKE_OUT", "ADD_CUT", "AUTO_CUT"].includes(cue)) {
    playNoise(context, now + 0.01, cue === "ADD_SAUCE" ? 0.18 : 0.08, cue === "BAKE" ? 0.035 : 0.018);
  }
}
