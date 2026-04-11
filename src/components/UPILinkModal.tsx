import { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { UPI_PROVIDERS } from '../utils/upiParser';

interface UPILinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (providerConfig: any) => void;
}

type Step = 'provider-select' | 'credentials' | 'connecting' | 'success';

export default function UPILinkModal({ isOpen, onClose, onSuccess }: UPILinkModalProps) {
  const [step, setStep] = useState<Step>('provider-select');
  const [selectedProvider, setSelectedProvider] = useState<typeof UPI_PROVIDERS[0] | null>(null);
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('provider-select');
      setSelectedProvider(null);
      setUpiId('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: typeof UPI_PROVIDERS[0]) => {
    setSelectedProvider(provider);
    setStep('credentials');
  };

  const handleConnect = () => {
    if (!upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g., yourname@okicici)');
      return;
    }
    setError('');
    setStep('connecting');

    // Simulate API delay
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({ provider: selectedProvider, upiId });
      }, 1500);
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="animate-scale-in w-full flex flex-col relative"
        style={{ maxWidth: '420px', background: 'var(--surface-card)', borderRadius: '24px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }}
      >
        {/* Close Button */}
        {step !== 'connecting' && step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--surface-input)', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        )}

        <div className="p-8">
          
          {/* Step 1: Provider Selection */}
          {step === 'provider-select' && (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--teal-dim)' }}>
                  <Landmark size={28} style={{ color: 'var(--teal)' }} />
                </div>
              </div>
              <h2 className="text-center font-manrope font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Link a UPI Account
              </h2>
              <p className="text-center font-inter text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Securely fetch your transactions from any supported UPI app without leaving SpendWise.
              </p>

              <div className="space-y-3">
                {UPI_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSelect(p)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                    style={{ background: 'var(--surface-input)', border: '1px solid transparent' }}
                    onMouseEnter={e => { (e.currentTarget.style.border = `1px solid var(--border)`); }}
                    onMouseLeave={e => { (e.currentTarget.style.border = `1px solid transparent`); }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ background: p.color }}>
                      {p.icon}
                    </div>
                    <span className="font-inter font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-6">
                <ShieldCheck size={14} style={{ color: 'var(--teal)' }} />
                <span className="font-inter text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Secured by SpendWise AA Mock</span>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'credentials' && selectedProvider && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--teal-dim)' }}>
                  <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: '18px', color: 'var(--teal)' }}>SW</span>
                </div>
                <div className="w-6 h-6 flex justify-center items-center">
                  <div className="w-full h-[2px] bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md" style={{ background: selectedProvider.color }}>
                  {selectedProvider.icon}
                </div>
              </div>
              
              <h2 className="text-center font-manrope font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Connect to {selectedProvider.name}
              </h2>
              <p className="text-center font-inter text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Enter your UPI ID to sync your transaction history.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block font-inter text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Your UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okicici"
                    className="w-full font-inter text-sm px-4 py-3 rounded-xl focus:outline-none"
                    style={{ background: 'var(--surface-input)', color: 'var(--text-primary)', border: '2px solid transparent' }}
                    onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                    autoFocus
                  />
                  {error && <p className="font-inter text-xs text-red-500 mt-2">{error}</p>}
                </div>

                <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                  <p className="font-inter text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
                    SpendWise only requests <strong>read-only</strong> access to your transaction statements. We cannot initiate payments.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConnect}
                className="w-full font-inter font-bold text-sm tracking-wide text-white py-4 rounded-xl mt-6 transition-all hover:opacity-90"
                style={{ background: 'var(--teal)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)' }}
              >
                Secure Connection
              </button>
            </div>
          )}

          {/* Step 3: Connecting */}
          {step === 'connecting' && (
            <div className="animate-fade-in flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin mb-6" style={{ color: 'var(--teal)' }} />
              <h2 className="font-manrope font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Authenticating
              </h2>
              <p className="font-inter text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                Securely connecting to your UPI provider...
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="animate-scale-in flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--teal)' }} />
              </div>
              <h2 className="font-manrope font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Account Linked!
              </h2>
              <p className="font-inter text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                Your {selectedProvider?.name} UPI transactions are now seamlessly synced to SpendWise.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
