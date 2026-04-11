import { useState } from 'react';
import { Loader2, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || password.length < 6) {
      setMessage({ type: 'err', text: 'Use a valid email and a password of at least 6 characters.' });
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setMessage({ type: 'err', text: error.message });
      } else {
        const { error, needsEmailConfirm } = await signUp(email, password);
        if (error) setMessage({ type: 'err', text: error.message });
        else if (needsEmailConfirm) {
          setMessage({
            type: 'ok',
            text: 'Check your inbox to confirm your email, then sign in.',
          });
          setMode('login');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/[0.08] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] glass-card rounded-2xl p-8 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <LogIn className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Spend<span className="text-blue-400">Wise</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mt-4 mb-6">
          {mode === 'login'
            ? 'Welcome back — your budgets and transactions sync to this account.'
            : 'Create a free account to save your data in the cloud.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-800/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <p
              className={`text-xs rounded-lg px-3 py-2 ${
                message.type === 'ok' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setMessage(null); }} className="text-blue-400 hover:underline font-medium">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setMessage(null); }} className="text-blue-400 hover:underline font-medium">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
