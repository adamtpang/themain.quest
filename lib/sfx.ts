// Tiny chiptune sound effects, synthesized with the Web Audio API. No asset
// files, no deps. Browser only and lazy: the AudioContext is created on the
// first real user gesture (a card tap), which is also what browsers require.

let ctx: AudioContext | null = null;
let muted = false;

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

export function sfxToggleMute(): boolean {
  muted = !muted;
  return muted;
}
export function sfxIsMuted(): boolean {
  return muted;
}

// A quick two-note blip when you play a card.
export function sfxPlay() {
  tone(523, 0.07, "square", 0.05, 0);
  tone(784, 0.09, "square", 0.045, 0.05);
}

// A low thud when you start an attack (the focus turn).
export function sfxAttack() {
  tone(196, 0.14, "sawtooth", 0.05, 0);
  tone(147, 0.16, "sawtooth", 0.04, 0.06);
}

// A rising victory arpeggio when the boss dies.
export function sfxKill() {
  tone(392, 0.16, "square", 0.05, 0);
  tone(523, 0.16, "square", 0.05, 0.1);
  tone(659, 0.18, "square", 0.05, 0.2);
  tone(784, 0.5, "square", 0.055, 0.3);
  tone(1047, 0.5, "triangle", 0.04, 0.34);
}
