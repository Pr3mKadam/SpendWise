import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Database,
  ArrowUpDown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  syncAll,
  pushGamification,
  SupabaseUser,
} from '@/core/api/supabase';
import { useStore } from '@/store';
import { Transaction } from '@/types';

const SESSION_KEY = 'spendwise_supabase_session_v1';
const LAST_SYNC_KEY = 'spendwise_last_sync_v1';

function loadSession(): SupabaseUser | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    // silently ignore — non-critical
    return null;
  }
}
function saveSession(u: SupabaseUser | null) {
  if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  else localStorage.removeItem(SESSION_KEY);
}

interface CloudSyncProps {
  transactions: Transaction[];
  onPullTransactions: (txs: Transaction[]) => void;
}

function formatSyncTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Never';
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
  } catch {
    // silently ignore — non-critical
    return 'Never';
  }
}

export function CloudSync({ transactions, onPullTransactions }: CloudSyncProps) {
  const [user, setUser] = useState<SupabaseUser | null>(loadSession);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(() =>
    localStorage.getItem(LAST_SYNC_KEY)
  );
  const [syncResult, setSyncResult] = useState<{ pushed: number; pulled: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'signin' | 'signup'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { totalXP, level, streak } = useStore();

  const handleSync = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    try {
      const { newTransactions, result } = await syncAll(
        transactions,
        user.id,
        user.access_token,
        lastSync ?? undefined
      );
      await pushGamification(
        { totalXP, level, streak, lastActive: new Date().toISOString() },
        user.id,
        user.access_token
      );
      if (newTransactions.length > 0) onPullTransactions(newTransactions);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      setSyncResult({ pushed: result.pushed, pulled: result.pulled });
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      e: any
    ) {
      setError(e.message ?? 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [user, transactions, lastSync, totalXP, level, streak, onPullTransactions]);

  const handleAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const u = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      setUser(u);
      saveSession(u);
      setMode('idle');
      setEmail('');
      setPassword('');
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      e: any
    ) {
      setError(e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (user) {
      try {
        await signOut(user.access_token);
      } catch {
        /* silently ignore — non-critical */
      }
    }
    setUser(null);
    saveSession(null);
    setSyncResult(null);
    setLastSync(null);
    localStorage.removeItem(LAST_SYNC_KEY);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="card p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center shrink-0">
            <Database size={18} className="text-slate-400" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">
              Cloud Sync
            </h3>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">
              Supabase not configured
            </p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[length:var(--fs-overline)] font-bold">
            SETUP REQUIRED
          </span>
        </div>
        <div className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-[var(--text-primary)]">To enable cloud sync:</p>
          <ol className="text-[length:var(--fs-caption)] text-[var(--text-muted)] font-inter space-y-1.5 list-decimal list-inside">
            <li>
              Create a free project at <strong className="text-[var(--teal)]">supabase.com</strong>
            </li>
            <li>Copy your Project URL and anon key</li>
            <li>
              Add to <code className="bg-[var(--surface-card)] px-1.5 py-0.5 rounded">.env</code>{' '}
              file:
            </li>
          </ol>
          <div className="bg-[var(--surface-card)] rounded-lg p-3 mt-2 overflow-x-auto">
            <code className="text-[length:var(--fs-overline)] font-mono text-[var(--teal)] block break-all whitespace-pre-wrap">
              VITE_SUPABASE_URL=https://xxx.supabase.co
            </code>
            <code className="text-[length:var(--fs-overline)] font-mono text-[var(--teal)] block break-all whitespace-pre-wrap mt-1">
              VITE_SUPABASE_ANON_KEY=eyJ...
            </code>
          </div>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] font-inter">
            Run the SQL schema from{' '}
            <code className="bg-[var(--surface-card)] px-1 rounded">src/services/supabase.ts</code>{' '}
            in Supabase SQL editor.
          </p>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] font-inter mt-2 pt-2 border-t border-[var(--border)]">
            💡 <strong>Note:</strong> If you already configured these in your{' '}
            <code className="bg-[var(--surface-card)] px-1 rounded">.env</code> /{' '}
            <code className="bg-[var(--surface-card)] px-1 rounded">.env.local</code> file, you MUST{' '}
            <strong>restart your development server</strong> (or rebuild the app) for Vite to load
            them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${user ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}
        >
          {user ? (
            <Cloud size={18} className="text-emerald-500" />
          ) : (
            <CloudOff size={18} className="text-slate-400" />
          )}
        </div>
        <div>
          <h3 className="font-manrope font-bold text-sm text-[var(--text-primary)]">Cloud Sync</h3>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] font-inter mt-0.5">
            {user ? `Signed in as ${user.email}` : 'Backup & Sync data across devices'}
          </p>
        </div>
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-[length:var(--fs-overline)] font-bold flex items-center gap-1 ${user ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}
        >
          {user ? (
            <>
              <Wifi size={10} /> Active
            </>
          ) : (
            <>
              <WifiOff size={10} /> Off
            </>
          )}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Auth Forms */}
        {mode !== 'idle' && !user && (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 mb-2"
          >
            <div className="space-y-2">
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:border-[var(--teal)] outline-none"
                />
              </div>

              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 pl-9 pr-10 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:border-[var(--teal)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[var(--text-muted)]"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-[length:var(--fs-caption)] font-bold text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setMode('idle')}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs border border-[var(--border)] text-[var(--text-muted)] bg-transparent cursor-pointer hover:bg-[var(--surface-input)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAuth(mode === 'signup')}
                disabled={loading || !email || !password}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-[var(--teal)] text-white border-none cursor-pointer hover:bg-[#0d9488] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Not signed in — CTA */}
        {!user && mode === 'idle' && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 mb-4"
          >
            <button
              onClick={() => setMode('signin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-[var(--teal)] text-white border-none cursor-pointer hover:bg-[#0d9488] transition-colors"
            >
              <LogIn size={15} /> Sign In to Sync
            </button>
            <button
              onClick={() => setMode('signup')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs border border-[var(--border)] text-[var(--text-muted)] bg-transparent cursor-pointer hover:text-[var(--teal)] hover:border-[var(--teal)] transition-colors"
            >
              Create free account
            </button>
          </motion.div>
        )}

        {/* Signed in — sync panel */}
        {user && (
          <motion.div
            key="sync-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Stats strip */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Local Transactions', value: transactions.length, icon: Database },
                { label: 'Last Sync', value: formatSyncTime(lastSync), icon: RefreshCw },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="bg-[var(--surface-input)] border border-[var(--border)] rounded-xl p-3"
                >
                  <p className="text-[length:var(--fs-overline)] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className="font-manrope font-bold text-sm mt-1 text-[var(--text-primary)]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Sync result */}
            <AnimatePresence>
              {syncResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <div className="text-[length:var(--fs-caption)] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="flex items-center gap-0.5">Pushed {syncResult.pushed}</span>
                    <span className="text-emerald-500/40">·</span>
                    <span className="flex items-center gap-0.5">Pulled {syncResult.pulled}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-[length:var(--fs-caption)] font-bold text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-[var(--teal)] text-white border-none cursor-pointer hover:bg-[#0d9488] transition-colors disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Syncing…
                  </>
                ) : (
                  <>
                    <ArrowUpDown size={13} /> Sync Now
                  </>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-2.5 rounded-xl font-bold text-xs border border-[var(--border)] text-[var(--text-muted)] bg-transparent cursor-pointer hover:text-red-400 hover:border-red-400 transition-colors flex items-center gap-1"
              >
                <LogOut size={13} /> Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info footer */}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-[var(--text-dim)] font-inter">
        <Lock size={10} className="shrink-0" />
        <span className="text-[length:var(--fs-overline)] uppercase tracking-wider font-bold">
          End-to-End Encrypted · Supabase Backend
        </span>
      </div>
    </div>
  );
}
