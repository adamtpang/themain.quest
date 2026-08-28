// Small procedural sound effects synthesized with the Web Audio API. There are
// no files, network requests, or dependencies. Audio starts only after a real
// user gesture, which is also what browsers require.

let ctx: AudioContext | null = null;
let muted = false;
const MUTE_STORAGE_KEY = "tmq.sound.muted";

type ToneStep = readonly [
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  delay: number,
];

export type SfxName =
  | "play"
  | "attack"
  | "complete"
  | "level-up"
  | "shrink"
  | "skip"
  | "timebox";

export const SFX_RECIPES: Record<SfxName, readonly ToneStep[]> = {
  play: [
    [523, 0.07, "square", 0.05, 0],
    [784, 0.09, "square", 0.045, 0.05],
  ],
  attack: [
    [196, 0.14, "sawtooth", 0.05, 0],
    [147, 0.16, "sawtooth", 0.04, 0.06],
  ],
  complete: [
    [392, 0.12, "triangle", 0.045, 0],
    [523, 0.14, "triangle", 0.05, 0.09],
    [659, 0.24, "sine", 0.055, 0.18],
  ],
  "level-up": [
    [392, 0.16, "square", 0.05, 0],
    [523, 0.16, "square", 0.05, 0.1],
    [659, 0.18, "square", 0.05, 0.2],
    [784, 0.5, "square", 0.055, 0.3],
    [1047, 0.5, "triangle", 0.04, 0.34],
  ],
  shrink: [
    [440, 0.12, "triangle", 0.035, 0],
    [349, 0.16, "sine", 0.03, 0.1],
  ],
  skip: [
    [262, 0.08, "triangle", 0.025, 0],
    [220, 0.12, "triangle", 0.02, 0.07],
  ],
  timebox: [
    [659, 0.18, "sine", 0.04, 0],
    [880, 0.32, "sine", 0.045, 0.16],
  ],
};

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "square", gain = 0.05, when = 0) {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

function playRecipe(name: SfxName) {
  if (muted) return;
  for (const [frequency, duration, type, gain, delay] of SFX_RECIPES[name]) {
    tone(frequency, duration, type, gain, delay);
  }
}

export function sfxLoadMutePreference(): boolean {
  if (typeof window === "undefined") return muted;
  muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  return muted;
}

export function sfxSetMuted(nextMuted: boolean): boolean {
  muted = nextMuted;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(nextMuted));
  }
  return muted;
}

export function sfxToggleMute(): boolean {
  return sfxSetMuted(!muted);
}
export function sfxIsMuted(): boolean {
  return muted;
}

export function sfxPlay() {
  playRecipe("play");
}

export function sfxAttack() {
  playRecipe("attack");
}

export function sfxKill() {
  playRecipe("level-up");
}

export function sfxQuestComplete() {
  playRecipe("complete");
}

export function sfxLevelUp() {
  playRecipe("level-up");
}

export function sfxShrink() {
  playRecipe("shrink");
}

export function sfxSkip() {
  playRecipe("skip");
}

export function sfxTimeboxComplete() {
  playRecipe("timebox");
}
