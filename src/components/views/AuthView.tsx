import { useState, useEffect } from 'react';
import {
  Mail, Lock, Wallet, ArrowRight, Loader2, User, Phone,
  Eye, EyeOff, CheckCircle2, TrendingUp, ShieldCheck, Zap, Star,
  ChevronRight,
} from 'lucide-react';
import { ChildQRScanner } from '../features/parental/components/ChildQRScanner';
import { useAuth } from '../../hooks/useAuth';

// ── Feature list shown on left panel ────────────────────────────
const features = [
  { icon: TrendingUp,  title: 'AI-Powered Insights',   desc: 'Smart spending predictions & budget coaching' },
  { icon: ShieldCheck, title: 'Bank-Grade Security',    desc: 'End-to-end encryption & MFA support' },
  { icon: Zap,         title: 'Instant Sync',           desc: 'Real-time updates across all your devices' },
  { icon: Star,        title: 'Smart Goals',            desc: 'Visualise & hit every savings milestone' },
];

// ── Main component ───────────────────────────────────────────────
export default function AuthView() {
  const { signIn, signUp } = useAuth();
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
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          phone
        });
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChildScanSuccess = (parentId: string) => {
    setShowQRScanner(false);
    const childUser = {
      id: 'child_' + Math.random().toString(36).substr(2, 9),
      email: 'child@local',
      user_metadata: {
        first_name: 'Child',
        last_name: 'Account',
        parentId,
        role: 'child'
      }
    };
    localStorage.setItem('spendwise_user', JSON.stringify(childUser));
    try {
      const existingCfg = localStorage.getItem('spendwise_config_v1');
      const cfg = existingCfg ? JSON.parse(existingCfg) : {
        initialBalance: 0,
        currency: '₹',
        onboardingComplete: true,
        createdAt: new Date().toISOString()
      };
      cfg.userRole = 'student';
      cfg.parentId = parentId;
      localStorage.setItem('spendwise_config_v1', JSON.stringify(cfg));
    } catch { /* ignore */ }
    window.location.reload();
  };

  const switchMode = () => { setIsLogin(v => !v); setError(null); setSuccess(null); };

  return (
    <>
      <style>{`
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
        @keyframes auth-slide-in { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes auth-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .auth-slide-in { animation: auth-slide-in 0.45s cubic-bezier(.22,1,.36,1) both; }
        .auth-fade-up  { animation: auth-fade-up  0.45s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="min-h-screen flex bg-[var(--bg)]">
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)' }}>
          <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--teal)] flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Wallet className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SpendWise</span>
          </div>
          <div className="flex-1 flex flex-col mt-12 max-w-lg relative z-10 space-y-8">
            <div>
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Take control of<br/>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #2dd4bf, #818cf8)' }}>your finances.</span>
              </h2>
              <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-md">
                AI-powered budgeting that actually works. Track spending, hit savings goals, and build wealth.
              </p>
            </div>
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

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
          <div className="w-full max-w-[440px] relative z-10" style={mounted ? { animation: 'auth-fade-up 0.5s cubic-bezier(.22,1,.36,1) both' } : {}}>
            <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-[var(--teal)] flex items-center justify-center shadow-md shadow-teal-500/30">
                <Wallet className="w-4.5 h-4.5 text-slate-900" />
              </div>
              <span className="text-[var(--text-primary)] font-bold text-xl">SpendWise</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">
                {isLogin ? 'Sign in to your SpendWise dashboard' : 'Start managing your money smarter — it\'s free'}
              </p>
            </div>

            <div className="flex gap-1 p-1 bg-[var(--surface-input)] rounded-xl mb-8 relative">
              <div className="absolute inset-y-1 rounded-lg bg-[var(--surface-card)] shadow-sm transition-all duration-300 ease-out"
                   style={{ left: isLogin ? '4px' : '50%', right: isLogin ? '50%' : '4px' }} />
              {(['Sign In', 'Sign Up'] as const).map((label, i) => (
                <button key={label} type="button" onClick={() => { setIsLogin(i === 0); setError(null); setSuccess(null); }}
                        className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${(i === 0) === isLogin ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-5 auth-slide-in">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="First name" icon={<User className="w-4 h-4" />} type="text" required value={firstName} onChange={setFirstName} placeholder="First" />
                    <InputField label="Last name" icon={<User className="w-4 h-4" />} type="text" required value={lastName} onChange={setLastName} placeholder="Last" />
                  </div>
                  <InputField label="Phone (optional)" icon={<Phone className="w-4 h-4" />} type="tel" value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
                </div>
              )}
              <InputField label="Email address" icon={<Mail className="w-4 h-4" />} type="email" required value={email} onChange={setEmail} placeholder="you@example.com" />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-dim)] group-focus-within:text-[var(--teal)] transition-colors"><Lock className="w-4 h-4" /></div>
                  <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                         className="w-full pl-10 pr-11 py-3 rounded-xl border-2 outline-none text-sm bg-[var(--surface-input)] border-transparent text-[var(--text-primary)] focus:border-[var(--teal)] focus:shadow-[0_0_0_4px_var(--teal-dim)] transition-all duration-200" placeholder="••••••••" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AlertBox type={error ? 'error' : success ? 'success' : null} message={error ?? success} />
              <SubmitButton loading={loading} label={isLogin ? 'Sign In' : 'Create Account'} />
            </form>

            <p className="text-center text-sm text-[var(--text-secondary)] mt-5">
              {isLogin ? "Don't have an account? " : 'Already have one? '}
              <button type="button" onClick={switchMode} className="text-[var(--teal)] font-semibold hover:underline inline-flex items-center gap-0.5">
                {isLogin ? 'Sign up for free' : 'Sign in'}<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </p>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
              <span className="relative bg-[var(--bg)] px-3 text-xs text-[var(--text-muted)] uppercase tracking-wider">Or</span>
            </div>

            <button type="button" onClick={() => setShowQRScanner(true)} className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[var(--surface-input)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-200 flex items-center justify-center gap-2">
              <User className="w-4.5 h-4.5 text-[var(--teal)]" />
              Link to Parent Account
            </button>
          </div>
          <p className="absolute bottom-6 text-[length:var(--fs-caption)] text-[var(--text-dim)]">© 2026 SpendWise · Local-first experience</p>
        </div>
      </div>

      <ChildQRScanner
        show={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSuccess={handleChildScanSuccess}
      />
    </>
  );
}

function InputField({ label, icon, type, required, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-dim)] group-focus-within:text-[var(--teal)] transition-colors">{icon}</div>
        <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none text-sm bg-[var(--surface-input)] border-transparent text-[var(--text-primary)] focus:border-[var(--teal)] transition-all duration-200" />
      </div>
    </div>
  );
}

function AlertBox({ type, message }: any) {
  if (!type || !message) return null;
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm auth-fade-up ${isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isError ? 'text-red-400 rotate-45' : ''}`} />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

function SubmitButton({ loading, label }: any) {
  return (
    <button type="submit" disabled={loading} className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-[var(--teal)] text-slate-900 hover:bg-[var(--teal-light)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <>{label}<ArrowRight className="w-4 h-4" /></>}
    </button>
  );
}
