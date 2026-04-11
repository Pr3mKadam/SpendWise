import { useState } from 'react';
import { Mail, Lock, Wallet, ArrowRight, Loader2, User, Phone } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP State
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [mockAlertOpen, setMockAlertOpen] = useState(false);

  // If supabase client wasn't initialized (missing .env)
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Supabase Not Configured</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable authentication.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Trigger OTP Mode instead of completing signup immediately
        setIsOtpMode(true);
        // Simulate sending SMS
        setTimeout(() => {
          const generated = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(generated);
          setMockAlertOpen(true);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered !== generatedOtp) {
      setError('Invalid OTP code. Please try again.');
      return;
    }

    // OTP matched, proceed with actual registration
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
          }
        }
      });
      if (error) throw error;
      setError('Registration successful! Please sign in, or check your email for a confirmation link.');
      setIsOtpMode(false);
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 relative overflow-hidden">
      {/* Background decorations matching SpendWise/Finebank vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent)]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          {/* Mock SMS Alert */}
          {mockAlertOpen && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--surface-card)] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-[var(--border)] z-50 flex items-center gap-4 animate-scale-in">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">New text message</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Your SpendWise verification code is <strong className="text-teal-500 text-sm tracking-widest ml-1">{generatedOtp}</strong>
                </p>
              </div>
              <button onClick={() => setMockAlertOpen(false)} className="ml-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>
          )}

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6 shadow-[0_0_30px_rgba(45,212,191,0.15)]">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            SpendWise
          </h1>
          <p className="text-[var(--text-secondary)]">
            {isLogin ? 'Welcome back, sign in to your dashboard.' : 'Create an account to start managing your finances.'}
          </p>
        </div>

        <div className="card p-8 shadow-2xl shadow-black/40">
          {isOtpMode ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] items-center justify-center mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Verify Phone Number</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  We've sent a 6-digit code to {phone || 'your phone'}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const newOtp = [...otpCode];
                      newOtp[index] = value;
                      setOtpCode(newOtp);
                      if (value && index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)]"
                  />
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.some((d) => !d)}
                className="w-full py-3 px-4 bg-[var(--accent)] text-teal-950 font-semibold rounded-xl transition-all hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOtpMode(false);
                  setError(null);
                }}
                className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Back to Registration
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Extended Signup Fields */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                          placeholder="First"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                          placeholder="Last"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                        <Phone className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error / Info Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[var(--accent)] text-teal-950 font-semibold rounded-xl transition-all hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[var(--accent)] font-medium hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
