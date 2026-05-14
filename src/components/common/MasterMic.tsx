/**
 * MasterMic — SpendWise Universal Voice Command FAB (Phase 2)
 *
 * Floating mic button with:
 *  - Animated waveform bars (listening)
 *  - Live transcript + intent badge
 *  - Confirmation dialog for large-amount commands
 *  - Missing-entity prompt display
 *  - Command history panel (last 10)
 *  - Result card with TTS readback (handled by hook)
 *  - ARIA live region for screen readers
 *  - Space-bar shortcut
 */

import { useEffect, useState } from 'react';
import {
  Mic, Loader2, CheckCircle2, XCircle, Sparkles,
  AlertTriangle, History, ChevronRight, RotateCcw,
} from 'lucide-react';
import { useMasterVoice, MicState, HistoryEntry } from '../../hooks/useMasterVoice';

import { AppView } from '../../types';

interface MasterMicProps {
  navigate: (view: AppView) => void;
  onExport: () => void;
  toggleTheme: () => void;
  setSearchQuery?: (q: string) => void;
  variant?: 'fab' | 'header';
}

// ── Visual config per state ──────────────────────────────────────────────────

const STATE_CONFIG: Record<MicState, {
  label: string;
  gradient: string;
  ringColor: string;
  Icon: React.ElementType;
  spin?: boolean;
  pulse?: boolean;
}> = {
  idle: {
    label: '⌨ Space · Mic',
    gradient: 'linear-gradient(135deg, var(--teal) 0%, #0ea5e9 100%)',
    ringColor: 'rgba(20, 184, 166, 0.3)',
    Icon: Mic,
  },
  listening: {
    label: 'Listening…',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    ringColor: 'rgba(239, 68, 68, 0.4)',
    Icon: Mic,
    pulse: true,
  },
  processing: {
    label: 'Processing…',
    gradient: 'linear-gradient(135deg, var(--teal) 0%, #6366f1 100%)',
    ringColor: 'rgba(99, 102, 241, 0.35)',
    Icon: Loader2,
    spin: true,
  },
  confirm: {
    label: 'Confirm?',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    ringColor: 'rgba(245, 158, 11, 0.4)',
    Icon: AlertTriangle,
  },
  awaiting: {
    label: 'Missing info',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    ringColor: 'rgba(99, 102, 241, 0.35)',
    Icon: Mic,
  },
  success: {
    label: 'Done!',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    ringColor: 'rgba(34, 197, 94, 0.35)',
    Icon: CheckCircle2,
  },
  error: {
    label: 'Try again',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    ringColor: 'rgba(239, 68, 68, 0.3)',
    Icon: XCircle,
  },
};

const INTENT_LABELS: Record<string, string> = {
  BUDGET_UPDATE: '💰 Budget', TRANSACTION_ADD: '💳 Expense',
  LIABILITY_ADD: '🏦 Liability', PORTFOLIO_UPDATE: '📈 Investment',
  GOAL_ADD: '🎯 Goal', SUBSCRIPTION_ADD: '🔔 Subscription',
  REPORT_EXPORT: '📄 Export', NAVIGATE: '🧭 Navigate', UNKNOWN: '❓ Unknown',
};

// ── History Row ──────────────────────────────────────────────────────────────

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const age = Math.round((Date.now() - entry.timestamp) / 60000);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: 28 }}>
        {INTENT_LABELS[entry.command.intent] ?? '•'}
      </span>
      <span style={{
        flex: 1, fontFamily: 'var(--font-inter)', fontSize: '12px',
        color: 'var(--text-primary)', lineHeight: 1.4,
      }}>
        {entry.command.summary}
      </span>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
        {age < 1 ? 'now' : `${age}m ago`}
      </span>
      {entry.result.success
        ? <CheckCircle2 size={12} style={{ color: '#22c55e', flexShrink: 0 }} />
        : <XCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export const MasterMic: React.FC<MasterMicProps> = ({ 
  navigate, 
  onExport, 
  toggleTheme, 
  setSearchQuery, 
  variant = 'fab' 
}) => {
  const {
    state, transcript, command, result, missingPrompt,
    pendingConfirm, history, isSupported,
    start, stop, confirm, cancelConfirm,
  } = useMasterVoice({ navigate, onExport, toggleTheme, setSearchQuery });

  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('spendwise_voice_onboarded') !== 'true';
  });

  const isHeader = variant === 'header';

  // Space-bar shortcut
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && state === 'idle') {
        e.preventDefault(); 
        if (showOnboarding) {
          setShowOnboarding(false);
          localStorage.setItem('spendwise_voice_onboarded', 'true');
        }
        start();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'listening') stop();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [state, start, stop]);

  // Close history on outside click
  useEffect(() => {
    if (!showHistory) return;
    const fn = () => setShowHistory(false);
    setTimeout(() => document.addEventListener('click', fn), 100);
    return () => document.removeEventListener('click', fn);
  }, [showHistory]);

  const cfg = STATE_CONFIG[state];
  const { Icon } = cfg;
  const showPanel = state !== 'idle';

  const handleFabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported) return;
    if (state === 'idle' || state === 'error' || state === 'success') start();
    else if (state === 'listening') stop();
  };

  return (
    <>
      {/* ── ARIA live region (screen readers) ───────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {result?.message ?? (missingPrompt ?? '')}
      </div>

      {/* ── Overlay panel ───────────────────────────────────────────── */}
      {showPanel && (
        <div
          style={{
            position: 'fixed', 
            bottom: isHeader ? 'auto' : '138px',
            top: isHeader ? '80px' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)', zIndex: 9998,
            width: 'min(440px, calc(100vw - 2rem))',
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            padding: '18px 20px',
            animation: isHeader ? 'micFadeDown 0.22s ease' : 'micFadeUp 0.22s ease',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sparkles size={13} style={{ color: 'var(--teal)', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)',
            }}>
              SpendWise Voice
            </span>
            {command && command.intent !== 'UNKNOWN' && (
              <span style={{
                marginLeft: 'auto', fontFamily: 'var(--font-inter)', fontSize: '11px',
                fontWeight: 600, color: 'var(--text-muted)',
                background: 'var(--surface-input)', borderRadius: '8px', padding: '2px 8px',
              }}>
                {INTENT_LABELS[command.intent]}
              </span>
            )}
          </div>

          {/* Live transcript */}
          {(state === 'listening' || state === 'processing') && transcript && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '15px', fontWeight: 500,
              color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '10px',
            }}>
              "{transcript}"
            </p>
          )}

          {/* Waveform bars */}
          {state === 'listening' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '30px', margin: '8px 0' }}>
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: '3px', background: 'var(--teal)', opacity: 0.75,
                  animation: `voiceBar ${0.38 + (i % 5) * 0.11}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.035}s`,
                }} />
              ))}
            </div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>
              Parsing your command…
            </p>
          )}

          {/* Missing entity prompt */}
          {state === 'awaiting' && missingPrompt && (
            <div style={{
              padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              marginTop: '6px',
            }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600,
                color: '#818cf8', lineHeight: 1.5,
              }}>
                🎙 {missingPrompt}
              </p>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Tap the mic and say the missing information.
              </p>
            </div>
          )}

          {/* Confirmation dialog */}
          {state === 'confirm' && pendingConfirm && (
            <div style={{
              padding: '14px', borderRadius: '14px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              marginTop: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                  High-value action — please confirm
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.4,
              }}>
                {pendingConfirm.summary}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={confirm}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '10px', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: '13px',
                    fontWeight: 700, background: '#22c55e', color: '#fff',
                  }}
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={cancelConfirm}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '10px', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: '13px',
                    fontWeight: 700, background: 'var(--surface-input)', color: 'var(--text-secondary)',
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (state === 'success' || state === 'error') && (
            <div style={{
              marginTop: '8px', padding: '12px 14px', borderRadius: '12px',
              background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${result.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600,
                color: result.success ? '#22c55e' : '#ef4444', lineHeight: 1.5,
              }}>
                {result.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── History panel ────────────────────────────────────────────── */}
      {showHistory && history.length > 0 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', 
            bottom: isHeader ? 'auto' : '138px',
            top: isHeader ? '80px' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)', zIndex: 9997,
            width: 'min(440px, calc(100vw - 2rem))',
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px 18px',
            maxHeight: '280px',
            overflowY: 'auto',
            animation: isHeader ? 'micFadeDown 0.2s ease' : 'micFadeUp 0.2s ease',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            Recent Commands
          </p>
          {history.map((entry, i) => <HistoryRow key={i} entry={entry} />)}
        </div>
      )}

      {/* ── Trigger button ────────────────────────────────────────────── */}
      <button
        id="master-mic-trigger"
        onClick={handleFabClick}
        aria-label={isSupported ? cfg.label : 'Voice command not supported in this browser'}
        disabled={!isSupported}
        title={isSupported ? `${cfg.label} — press Space to activate` : 'Voice command not supported in this browser'}
        className={isHeader ? "flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105" : ""}
        style={!isHeader ? {
          position: 'fixed', bottom: '86px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: '60px', height: '60px',
          borderRadius: '50%', border: 'none', cursor: isSupported ? 'pointer' : 'not-allowed',
          background: isSupported ? cfg.gradient : 'var(--surface-input)',
          opacity: isSupported ? 1 : 0.6,
          boxShadow: isSupported 
            ? `0 0 0 ${cfg.pulse ? '10px' : '6px'} ${cfg.ringColor}, 0 8px 28px rgba(0,0,0,0.22)`
            : '0 8px 20px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: cfg.pulse ? 'micPulse 1.4s ease-in-out infinite' : 'none',
          transition: 'background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
        } : {
          padding: 0, border: 'none', background: 'none',
          position: 'relative',
        }}
      >
        {isHeader ? (
          <>
            {/* Header Mobile Glass Style */}
            <span 
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl" 
              style={{
                background: state === 'idle' ? 'rgba(255,255,255,0.15)' : cfg.gradient,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                boxShadow: state !== 'idle' ? `0 0 12px ${cfg.ringColor}` : 'none',
                animation: cfg.pulse ? 'micPulseSmall 1.4s ease-in-out infinite' : 'none',
              }}
            >
              <Icon size={17} color={state === 'idle' ? "rgba(255,255,255,0.9)" : "#fff"} style={{ animation: cfg.spin ? 'spin 0.8s linear infinite' : 'none' }} />
            </span>
            {/* Header Desktop Surface Style */}
            <span 
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl" 
              style={{ 
                background: state === 'idle' ? 'var(--surface-input)' : cfg.gradient,
                boxShadow: state !== 'idle' ? `0 0 10px ${cfg.ringColor}` : 'none',
                animation: cfg.pulse ? 'micPulseSmall 1.4s ease-in-out infinite' : 'none',
                border: state === 'idle' ? '1px solid var(--border)' : 'none',
              }}
            >
              <Icon size={17} color={state === 'idle' ? "var(--teal)" : "#fff"} style={{ animation: cfg.spin ? 'spin 0.8s linear infinite' : 'none' }} />
            </span>
            
            {/* Success/Error Dot */}
            {(state === 'success' || state === 'error') && (
              <span 
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg)]"
                style={{ background: state === 'success' ? '#22c55e' : '#ef4444' }}
              />
            )}
          </>
        ) : (
          <Icon size={26} color={isSupported ? "#fff" : "var(--text-dim)"} style={{ animation: cfg.spin ? 'spin 0.8s linear infinite' : 'none' }} />
        )}
      </button>

      {/* ── Status Strip (FAB only) ────────────────────────────────────── */}
      {!isHeader && (
        <div style={{
          position: 'fixed', bottom: '62px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {/* History toggle */}
          {isSupported && history.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setShowHistory(v => !v); }}
              title="Command history"
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '3px 8px',
                display: 'flex', alignItems: 'center', gap: '4px',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <History size={11} style={{ color: 'var(--text-muted)' }} />
              <span style={{
                fontFamily: 'var(--font-inter)', fontSize: '10px',
                fontWeight: 700, color: 'var(--text-muted)',
              }}>
                {history.length}
              </span>
            </button>
          )}

          {/* Label chip */}
          <div style={{
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '3px 10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {isSupported ? cfg.label : 'Voice Unsupported'}
            </span>
          </div>

          {/* Next action hint */}
          {state === 'confirm' && (
            <button
              onClick={confirm}
              style={{
                background: '#22c55e', border: 'none', borderRadius: '10px',
                padding: '3px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <ChevronRight size={11} color="#fff" />
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                Confirm
              </span>
            </button>
          )}

          {/* Help toggle (idle state only) */}
          {state === 'idle' && isSupported && (
            <button
              onClick={() => start()} // Start and say help
              style={{
                background: 'var(--surface-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '3px 8px',
                display: 'flex', alignItems: 'center', gap: '4px',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              <Sparkles size={11} style={{ color: 'var(--teal)' }} />
              <span style={{
                fontFamily: 'var(--font-inter)', fontSize: '10px',
                fontWeight: 700, color: 'var(--text-muted)',
              }}>
                Help
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── Onboarding Tooltip (FAB only) ────────────────────────────────────────── */}
      {showOnboarding && isSupported && state === 'idle' && !isHeader && (
        <div style={{
          position: 'fixed', bottom: '158px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 9999,
          width: 'min(300px, 80vw)', background: 'var(--teal)',
          color: '#fff', borderRadius: '16px', padding: '14px',
          boxShadow: '0 10px 25px rgba(20, 184, 166, 0.4)',
          animation: 'micFadeUp 0.3s ease', textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            New: Master Voice Engine 🎙
          </p>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', lineHeight: 1.5, opacity: 0.9 }}>
            Hold Space or tap the mic to track expenses, set budgets, or get reports entirely hands-free.
          </p>
          <button 
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('spendwise_voice_onboarded', 'true');
            }}
            style={{
              marginTop: '10px', background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '8px', padding: '4px 12px', color: '#fff',
              fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Got it!
          </button>
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent', borderTop: '8px solid var(--teal)',
          }} />
        </div>
      )}

      {/* ── Animations ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes micPulse {
          0%,100% { box-shadow: 0 0 0 6px rgba(239,68,68,0.4), 0 8px 28px rgba(0,0,0,0.22); }
          50%      { box-shadow: 0 0 0 18px rgba(239,68,68,0.08), 0 8px 28px rgba(0,0,0,0.22); }
        }
        @keyframes micPulseSmall {
          0%,100% { box-shadow: 0 0 0 2px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0.1); }
        }
        @keyframes voiceBar {
          from { height: 4px; }
          to   { height: 26px; }
        }
        @keyframes micFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes micFadeDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
