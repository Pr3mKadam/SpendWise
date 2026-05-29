/**
 * Text-to-Speech utility — SpendWise Voice Engine
 * Wraps the Web Speech Synthesis API for result readback.
 * Uses Indian English voice preference when available.
 */

let preferredVoice: SpeechSynthesisVoice | null = null;

function loadVoice() {
  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  // Prefer en-IN, then en-GB, then any English
  preferredVoice =
    voices.find(v => v.lang === 'en-IN') ||
    voices.find(v => v.lang === 'en-GB') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
}

// Voices load asynchronously on first call
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoice;
  loadVoice();
}

export function speak(text: string, options?: { rate?: number; pitch?: number }) {
  if (!window.speechSynthesis) return;

  // Cancel any pending speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate  = options?.rate  ?? 1.05;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = 0.9;
  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  window.speechSynthesis?.cancel();
}
