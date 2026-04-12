import { useState, useEffect } from 'react';
import {
  Mail, Lock, Wallet, ArrowRight, Loader2, User, Phone,
  Eye, EyeOff, CheckCircle2, TrendingUp, ShieldCheck, Zap, Star,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

// ── Password strength ────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' };
  if (score === 4) return { score, label: 'Good',  color: '#3b82f6' };
  return { score, label: 'Strong', color: '#10b981' };
}

// ── Feature list shown on left panel ────────────────────────────
const features = [
  { icon: TrendingUp,  title: 'AI-Powered Insights',   desc: 'Smart spending predictions & budget coaching' },
  { icon: ShieldCheck, title: 'Bank-Grade Security',    desc: 'End-to-end encryption & MFA support' },
  { icon: Zap,         title: 'Instant Sync',           desc: 'Real-time updates across all your devices' },
  { icon: Star,        title: 'Smart Goals',            desc: 'Visualise & hit every savings milestone' },
];


// ── OTP input (used for MFA) ─────────────────────────────────────
function OtpInputs({
  value, onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex justify-center gap-2.5">
      {value.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoComplete="one-time-code"
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, '');
            const next = [...value];
            next[index] = v;
            onChange(next);
            if (v && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[index] && index > 0) {
              document.getElementById(`otp-${index - 1}`)?.focus();
            }
          }}
          onFocus={(e) => e.target.select()}
          className="
            w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
            bg-[var(--surface-input)] border-[var(--border,#e2e8f0)]
            text-[var(--text-primary)]
            focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20
            transition-all duration-200
          "
        />
      ))}
    </div>
  );
}


// ── Main component ───────────────────────────────────────────────
export default function AuthView({ mfaRequired = false }: { mfaRequired?: boolean }) {
  const [isLogin,    setIsLogin]    = useState(true);
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [firstName,  setFirstName]  = useState('');
  const [lastName,   setLastName]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState<string | null>(null);
  const [showPw,     setShowPw]     = useState(false);
  const [mounted,    setMounted]    = useState(false);

  // MFA state
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  useEffect(() => { setMounted(true); }, []);

  // ── Supabase not configured ─────────────────────────────────────
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
        <div className="card w-full max-w-md p-10 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Supabase Not Configured</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Please add <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-[var(--teal)] bg-[var(--teal)]/10 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
          </p>
        </div>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName, phone } },
        });
        if (error) throw error;
        setSuccess('Account created! Check your email for a confirmation link, then sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: factors, error: fe } = await supabase!.auth.mfa.listFactors();
      if (fe) throw fe;
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) throw new Error('No TOTP factor found on your account.');
      const challenge = await supabase!.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;
      const verify = await supabase!.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: otpCode.join(''),
      });
      if (verify.error) throw verify.error;
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(password);
  const switchMode = () => { setIsLogin(v => !v); setError(null); setSuccess(null); };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-10px); }
        }
        @keyframes auth-slide-in {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-slide-in { animation: auth-slide-in 0.45s cubic-bezier(.22,1,.36,1) both; }
        .auth-fade-up  { animation: auth-fade-up  0.45s cubic-bezier(.22,1,.36,1) both; }
        .auth-input:focus-within label {
          color: var(--teal);
        }
      `}</style>

      <div className="min-h-screen flex bg-[var(--bg)]">

        {/* ══════════════════════ LEFT HERO PANEL ══════════════════════ */}
        <div
          className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)',
          }}
        >
          {/* Ambient gradient orbs */}
          <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute top-[40%] right-[15%] w-[30%] h-[30%] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

          {/* Top logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--teal)] flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Wallet className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SpendWise</span>
          </div>

          {/* Main headline */}
          <div className="flex-1 flex flex-col mt-12 max-w-lg">
            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
                  Take control of<br/>
                  <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(90deg, #2dd4bf, #818cf8)' }}>
                    your finances.
                  </span>
                </h2>
                <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-md">
                  AI-powered budgeting that actually works. Track spending, hit savings goals, and build wealth — all in one place.
                </p>
              </div>

              {/* Feature list */}
              <div className="space-y-4">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/10 group-hover:border-teal-500/30 transition-all duration-200">
                      <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* ══════════════════════ RIGHT FORM PANEL ══════════════════════ */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">

          {/* Subtle background texture */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(20,184,166,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%)' }} />

          <div
            className="w-full max-w-[440px] relative z-10"
            style={mounted ? { animation: 'auth-fade-up 0.5s cubic-bezier(.22,1,.36,1) both' } : {}}
          >
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[var(--teal)] flex items-center justify-center shadow-md shadow-teal-500/30">
                <Wallet className="w-4.5 h-4.5 text-slate-900" />
              </div>
              <span className="text-[var(--text-primary)] font-bold text-xl">SpendWise</span>
            </div>

            {mfaRequired ? (
              /* ── MFA screen ──────────────── */
              <div className="auth-slide-in">
                <div className="text-center mb-8">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-[var(--teal)]/10 text-[var(--teal)] items-center justify-center mb-4 shadow-lg shadow-teal-500/10">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Two-factor auth</h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <OtpInputs value={otpCode} onChange={setOtpCode} />
                  <AlertBox type={error ? 'error' : null} message={error} />
                  <SubmitButton loading={loading} disabled={otpCode.some(d => !d)} label="Verify & Continue" />
                </form>
              </div>
            ) : (
              /* ── Login / Signup screen ────── */
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    {isLogin ? 'Welcome back' : 'Create account'}
                  </h1>
                  <p className="text-[var(--text-secondary)] mt-2 text-sm">
                    {isLogin
                      ? 'Sign in to your SpendWise dashboard'
                      : 'Start managing your money smarter — it\'s free'}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-[var(--surface-input)] rounded-xl mb-8 relative">
                  <div
                    className="absolute inset-y-1 rounded-lg bg-[var(--surface-card)] shadow-sm transition-all duration-300 ease-out"
                    style={{ left: isLogin ? '4px' : '50%', right: isLogin ? '50%' : '4px' }}
                  />
                  {(['Sign In', 'Sign Up'] as const).map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { setIsLogin(i === 0); setError(null); setSuccess(null); }}
                      className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                        (i === 0) === isLogin
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Sign-up extra fields */}
                  {!isLogin && (
                    <div className="space-y-5 auth-slide-in">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="First name"
                          icon={<User className="w-4 h-4" />}
                          type="text"
                          required
                          value={firstName}
                          onChange={setFirstName}
                          placeholder="First"
                          autoComplete="given-name"
                        />
                        <InputField
                          label="Last name"
                          icon={<User className="w-4 h-4" />}
                          type="text"
                          required
                          value={lastName}
                          onChange={setLastName}
                          placeholder="Last"
                          autoComplete="family-name"
                        />
                      </div>
                      <InputField
                        label="Phone (optional)"
                        icon={<Phone className="w-4 h-4" />}
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <InputField
                    label="Email address"
                    icon={<Mail className="w-4 h-4" />}
                    type="email"
                    required
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete={isLogin ? 'username email' : 'email'}
                  />

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-dim)] group-focus-within:text-[var(--teal)] transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className="
                          w-full pl-10 pr-11 py-3 rounded-xl border-2 outline-none text-sm
                          bg-[var(--surface-input)] border-transparent
                          text-[var(--text-primary)] placeholder-[var(--text-dim)]
                          focus:border-[var(--teal)] focus:bg-[var(--surface-card)]
                          focus:shadow-[0_0_0_4px_var(--teal-dim)]
                          transition-all duration-200
                        "
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPw(v => !v)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength (sign-up only) */}
                    {!isLogin && password && (
                      <div className="space-y-1.5 auth-fade-up">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-1 rounded-full transition-all duration-300"
                              style={{
                                background: i <= strength.score ? strength.color : 'var(--surface-input)',
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-medium" style={{ color: strength.color }}>
                          {strength.label} password
                        </p>
                      </div>
                    )}

                    {/* Forgot password (login only) */}
                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-xs text-[var(--teal)] hover:underline font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <AlertBox type={error ? 'error' : success ? 'success' : null} message={error ?? success} />

                  {/* Submit */}
                  <SubmitButton loading={loading} label={isLogin ? 'Sign In' : 'Create Account'} />

                  {/* Social trust (sign-up only) */}
                  {!isLogin && (
                    <p className="text-center text-[10px] text-[var(--text-dim)] leading-relaxed">
                      By creating an account you agree to our{' '}
                      <span className="text-[var(--teal)] cursor-pointer hover:underline">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-[var(--teal)] cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                  )}
                </form>

                {/* Divider */}
                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border,#e2e8f0)]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs text-[var(--text-dim)] bg-[var(--bg)]">or continue with</span>
                  </div>
                </div>

                {/* Toggle sign-in / sign-up */}
                <p className="text-center text-sm text-[var(--text-secondary)] mt-5">
                  {isLogin ? "Don't have an account? " : 'Already have one? '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-[var(--teal)] font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    {isLogin ? 'Sign up for free' : 'Sign in'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </p>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="absolute bottom-6 text-[11px] text-[var(--text-dim)]">
            © 2025 SpendWise · Secured with 256-bit encryption
          </p>
        </div>
      </div>
    </>
  );
}

// ── Reusable sub-components ──────────────────────────────────────

function InputField({
  label, icon, type, required, value, onChange, placeholder, autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-dim)] group-focus-within:text-[var(--teal)] transition-colors">
          {icon}
        </div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none text-sm
            bg-[var(--surface-input)] border-transparent
            text-[var(--text-primary)] placeholder-[var(--text-dim)]
            focus:border-[var(--teal)] focus:bg-[var(--surface-card)]
            focus:shadow-[0_0_0_4px_var(--teal-dim)]
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}

function AlertBox({ type, message }: { type: 'error' | 'success' | null; message: string | null }) {
  if (!type || !message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm auth-fade-up ${
      isError
        ? 'bg-red-500/10 border-red-500/20 text-red-500'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    }`}>
      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isError ? 'text-red-400 rotate-45' : ''}`} />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

function SubmitButton({ loading, disabled, label }: { loading: boolean; disabled?: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="
        w-full py-3.5 px-4 rounded-xl font-semibold text-sm
        bg-[var(--teal)] text-slate-900
        hover:bg-[var(--teal-light)] hover:-translate-y-0.5
        hover:shadow-[0_8px_24px_var(--teal-glow)]
        active:scale-[0.98] active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center gap-2 group
        transition-all duration-200
      "
    >
      {loading
        ? <Loader2 className="w-4.5 h-4.5 animate-spin" />
        : <>{label}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" /></>
      }
    </button>
  );
}
