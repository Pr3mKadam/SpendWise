/**
 * Soundscape — Lightweight, zero-dependency audio micro-interactions.
 * Uses the WebAudio API to synthesize subtle sound effects without any external files.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return ctx;
}

function beep(frequency: number, duration: number, type: OscillatorType, volume: number, decay = 0.95) {
  try {
    const audioCtx = getCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * decay, audioCtx.currentTime + duration);

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Silently fail — audio is a progressive enhancement
  }
}

/** Play when a transaction is successfully added */
export function playSuccess() {
  beep(523, 0.1, 'sine', 0.1);   // C5
  setTimeout(() => beep(659, 0.15, 'sine', 0.08), 80);  // E5
  setTimeout(() => beep(784, 0.2, 'sine', 0.06), 160);  // G5
}

/** Play when a goal is completed or a level is reached */
export function playCelebration() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.15, 'sine', 0.07), i * 60);
  });
}

/** Play on a budget alert or error */
export function playWarning() {
  beep(220, 0.15, 'sawtooth', 0.05);
  setTimeout(() => beep(196, 0.2, 'sawtooth', 0.04), 120);
}

/** Play a subtle click for navigation/tab changes */
export function playClick() {
  beep(800, 0.05, 'sine', 0.04, 0.5);
}

/** Play on PIN digit press */
export function playPinTap() {
  beep(1200, 0.04, 'sine', 0.03, 0.8);
}

/** Play on PIN error / wrong code */
export function playPinError() {
  beep(180, 0.2, 'square', 0.05);
  setTimeout(() => beep(140, 0.3, 'square', 0.04), 150);
}
