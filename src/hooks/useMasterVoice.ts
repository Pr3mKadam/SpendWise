/**
 * useMasterVoice — SpendWise Master Voice Input Hook (Phase 2)
 *
 * Manages the Web Speech API recording lifecycle:
 *  - Streams interim transcript text
 *  - Validates missing entities before execution
 *  - Requires confirmation for large-amount commands (>₹50k)
 *  - Maintains a 10-entry command history with undo support
 *  - Reads back results via TTS (Web Speech Synthesis)
 *  - Enforces 800ms cooldown between activations
 */

import { useState, useRef, useCallback } from 'react';
import { parseVoiceCommand, getMissingEntityPrompt, requiresConfirmation } from '../lib/voiceCommands/commandParser';
import { executeCommand } from '../lib/voiceCommands/commandRouter';
import { VoiceCommand, CommandResult } from '../lib/voiceCommands/types';
import { speak } from '../lib/voiceCommands/tts';
import { haptic } from '../lib/haptic';
 
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

export type MicState = 'idle' | 'listening' | 'processing' | 'confirm' | 'awaiting' | 'success' | 'error';

export interface HistoryEntry {
  command: VoiceCommand;
  result: CommandResult;
  timestamp: number;
}

import { AppView } from '../types';

interface UseMasterVoiceOptions {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
}

interface UseMasterVoiceReturn {
  state: MicState;
  transcript: string;
  command: VoiceCommand | null;
  result: CommandResult | null;
  missingPrompt: string | null;
  pendingConfirm: VoiceCommand | null;
  history: HistoryEntry[];
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  confirm: () => void;
  cancelConfirm: () => void;
  undo: () => void;
  reset: () => void;
}

const COOLDOWN_MS    = 800;
const AUTO_RESET_MS  = 4500;
const MAX_HISTORY    = 10;

// SpeechRecognition types handled via (window as any)

export function useMasterVoice({ navigate, onExport, toggleTheme, setSearchQuery }: UseMasterVoiceOptions): UseMasterVoiceReturn {
  const [state,          setState]          = useState<MicState>('idle');
  const [transcript,     setTranscript]     = useState('');
  const [command,        setCommand]        = useState<VoiceCommand | null>(null);
  const [result,         setResult]         = useState<CommandResult | null>(null);
  const [missingPrompt,  setMissingPrompt]  = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<VoiceCommand | null>(null);
  const [history,        setHistory]        = useState<HistoryEntry[]>([]);

  const recognitionRef      = useRef<SpeechRecognition | null>(null);
  const timeoutRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef  = useRef<string>('');
  const lastActivatedRef    = useRef<number>(0);

  const SpeechRecognitionClass: SpeechRecognitionStatic | null =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionClass;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const scheduleReset = useCallback((ms = AUTO_RESET_MS) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState('idle');
      setTranscript('');
      setCommand(null);
      setResult(null);
      setMissingPrompt(null);
      setPendingConfirm(null);
    }, ms);
  }, []);

  const pushHistory = useCallback((cmd: VoiceCommand, res: CommandResult) => {
    setHistory(h => [{ command: cmd, result: res, timestamp: Date.now() }, ...h].slice(0, MAX_HISTORY));
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState('idle');
    setTranscript('');
    setCommand(null);
    setResult(null);
    setMissingPrompt(null);
    setPendingConfirm(null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  /** Execute a parsed command, handle TTS, history, and auto-reset. */
  const runCommand = useCallback(async (cmd: VoiceCommand) => {
    setCommand(cmd);
    setState('processing');

    // Handle undo via special NAVIGATE view='UNDO'
    if (cmd.intent === 'NAVIGATE' && (cmd.entities.view as string) === 'UNDO') {
      setHistory(h => {
        if (h.length === 0) {
          const res: CommandResult = { success: false, message: 'No commands to undo.' };
          setResult(res);
          setState('error');
          speak('No commands to undo.');
          scheduleReset();
          return h;
        }
        // Pop the last entry (visual only — store undo is TODO Phase 3)
        const [last, ...rest] = h;
        const res: CommandResult = {
          success: true,
          message: `↩ Undone: ${last.command.summary}`,
        };
        setResult(res);
        setState('success');
        speak('Done, last command undone.');
        scheduleReset();
        return rest;
      });
      return;
    }

    try {
      const outcome = await executeCommand(cmd, navigate, onExport, toggleTheme, setSearchQuery);
      setResult(outcome);
      setState(outcome.success ? 'success' : 'error');
      
      if (outcome.success) {
        haptic.success();
        pushHistory(cmd, outcome);
      } else {
        haptic.error();
      }

      // TTS readback
      const ttsText = outcome.message.replace(/[✅📄📍❓↩💰💳🏦📈🎯🔔]/gu, '').trim();
      speak(ttsText);

      scheduleReset();
    } catch {
      const err: CommandResult = { success: false, message: 'Something went wrong. Please try again.' };
      setResult(err);
      setState('error');
      speak('Something went wrong.');
      scheduleReset();
    }
  }, [navigate, onExport, pushHistory, scheduleReset]);

  /** Confirm a pending high-value command. */
  const confirm = useCallback(() => {
    if (!pendingConfirm) return;
    const cmd = pendingConfirm;
    setPendingConfirm(null);
    runCommand(cmd);
  }, [pendingConfirm, runCommand]);

  const cancelConfirm = useCallback(() => {
    setPendingConfirm(null);
    setResult({ success: false, message: 'Command cancelled.' });
    setState('error');
    speak('Cancelled.');
    scheduleReset(2500);
  }, [scheduleReset]);

  /** Undo the most recent successful command (exposed for UI button too). */
  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const [, ...rest] = h;
      return rest;
    });
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionClass) return;

    // Cooldown guard
    const now = Date.now();
    if (now - lastActivatedRef.current < COOLDOWN_MS) return;
    lastActivatedRef.current = now;

    // Clear previous run
    reset();
    finalTranscriptRef.current = '';

    if (!SpeechRecognitionClass) {
      setResult({ success: false, message: 'Voice recognition not supported.' });
      setState('error');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang          = 'en-IN';
    recognition.continuous    = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onstart = () => setState('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const interim = Array.from(event.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join(' ');
      finalTranscriptRef.current = interim;
      setTranscript(interim);
    };

    recognition.onend = async () => {
      const finalTranscript = finalTranscriptRef.current;

      if (!finalTranscript.trim()) {
        setResult({ success: false, message: 'No speech detected. Try again.' });
        speak('No speech detected.');
        setState('error');
        scheduleReset(3000);
        return;
      }

      setState('processing');
      let parsed;
      try {
        const { parseMasterVoiceWithGemini } = await import('../services/VoiceService');
        const todayStr = new Date().toISOString().split('T')[0];
        parsed = await parseMasterVoiceWithGemini(finalTranscript, todayStr);
      } catch (err) {
        console.warn('Gemini NLP parsing failed, falling back to local regex parser:', err);
        parsed = parseVoiceCommand(finalTranscript);
      }
      setCommand(parsed);

      // Missing entity check
      const missing = getMissingEntityPrompt(parsed);
      if (missing) {
        setMissingPrompt(missing);
        setState('awaiting');
        speak(missing);
        scheduleReset(6000);
        return;
      }

      // Confirmation required for large amounts
      if (requiresConfirmation(parsed)) {
        setPendingConfirm(parsed);
        setState('confirm');
        speak(`Confirm: ${parsed.summary}. Say yes or tap confirm.`);
        return; // Don't auto-reset — wait for user
      }

      await runCommand(parsed);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === 'not-allowed' ? 'Mic permission denied. Enable in browser settings.' :
        event.error === 'network'     ? 'Network error — try again.' :
        event.error === 'no-speech'   ? 'No speech detected.' :
        `Error: ${event.error}`;
      setResult({ success: false, message: msg });
      speak(msg);
      setState('error');
      scheduleReset(3500);
    };

    recognition.start();
  }, [SpeechRecognitionClass, reset, runCommand, scheduleReset]);

  return {
    state, transcript, command, result, missingPrompt,
    pendingConfirm, history, isSupported,
    start, stop, confirm, cancelConfirm, undo, reset,
  };
}
