import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, ShieldCheck, X } from 'lucide-react';

interface TwoFactorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorModal({ onClose, onSuccess }: TwoFactorModalProps) {
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const enrollMfa = async () => {
      try {
        // Clean up any stale unverified factors from previous abandoned attempts
        const { data: listData } = await supabase!.auth.mfa.listFactors();
        const staleFactors = listData?.totp?.filter(f => (f.status as any) === 'unverified') || [];
        for (const factor of staleFactors) {
          await supabase!.auth.mfa.unenroll({ factorId: factor.id });
        }

        const { data, error } = await supabase!.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'SpendWise App ' + new Date().getTime(),
        });
        if (error) throw error;
        if (active) {
          setFactorId(data.id);
          setQrCodeSvg(data.totp.qr_code);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to initialize Two-Factor Authentication.');
          setLoading(false);
        }
      }
    };
    void enrollMfa();
    return () => { active = false; };
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);
    try {
      const challenge = await supabase!.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase!.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode.join(''),
      });
      if (verify.error) throw verify.error;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div className="card w-full max-w-md p-8 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Setup Authenticator</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Scan the QR code below with Google Authenticator, Authy, or any other TOTP app.
          </p>
        </div>

        {loading && !qrCodeSvg ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--teal)]" />
          </div>
        ) : error && !qrCodeSvg ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center p-4 bg-white rounded-xl">
              {qrCodeSvg && (
                <div className="w-48 h-48 flex items-center justify-center">
                  {qrCodeSvg.startsWith('data:image') || qrCodeSvg.startsWith('http') ? (
                    <img src={qrCodeSvg} alt="QR Code" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              {verifyCode.map((digit, index) => (
                <input
                  key={index}
                  id={`mfa-setup-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const newCode = [...verifyCode];
                    newCode[index] = value;
                    setVerifyCode(newCode);
                    if (value && index < 5) {
                      document.getElementById(`mfa-setup-${index + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !verifyCode[index] && index > 0) {
                      document.getElementById(`mfa-setup-${index - 1}`)?.focus();
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
              disabled={loading || verifyCode.some((d) => !d)}
              className="w-full py-3 px-4 bg-[var(--accent)] text-teal-950 font-semibold rounded-xl transition-all hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate Two-Factor Authentication'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
