import { useState } from 'react';
import { X, Key, ShieldCheck, Zap } from 'lucide-react';
import { RazorpayAuth } from '../utils/razorpaySync';

interface RazorpayLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: RazorpayAuth) => void;
}

export default function RazorpayLinkModal({ isOpen, onClose, onSuccess }: RazorpayLinkModalProps) {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [saveLocal, setSaveLocal] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyId.trim() || !keySecret.trim()) return;

    if (saveLocal) {
      localStorage.setItem('spendwise_rzp_key', keyId.trim());
      localStorage.setItem('spendwise_rzp_secret', keySecret.trim());
    } else {
      localStorage.removeItem('spendwise_rzp_key');
      localStorage.removeItem('spendwise_rzp_secret');
    }

    onSuccess({ keyId: keyId.trim(), keySecret: keySecret.trim() });
    
    // Clear state
    setKeyId('');
    setKeySecret('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-md shadow-2xl animate-scale-in border border-[var(--border)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[var(--border)]">
           <h3 className="flex items-center gap-2 font-manrope font-bold text-lg text-[var(--text-primary)]">
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0C1236]">
               <Zap size={14} className="text-white" />
             </div>
             Connect Razorpay
           </h3>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
             <X size={18} />
           </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3 items-start">
             <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={18} />
             <p className="font-inter text-xs leading-5 text-[var(--text-secondary)]">
               Your API keys never leave your browser. They are used securely via direct API calls to Razorpay to fetch an encrypted statement of your received payments. 
             </p>
           </div>

           <div className="space-y-4">
             <div>
               <label className="block font-inter text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                 Key ID
               </label>
               <div className="relative">
                 <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                 <input 
                   type="text"
                   value={keyId}
                   onChange={e => setKeyId(e.target.value)}
                   placeholder="rzp_test_..."
                   className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm font-inter text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors"
                 />
               </div>
             </div>

             <div>
               <label className="block font-inter text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                 Key Secret
               </label>
               <input 
                 type="password"
                 value={keySecret}
                 onChange={e => setKeySecret(e.target.value)}
                 placeholder="••••••••••••••••"
                 className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-inter text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors"
               />
             </div>
           </div>

           <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={saveLocal} 
                onChange={e => setSaveLocal(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--teal)] focus:ring-[var(--teal)] cursor-pointer"
              />
              <span className="font-inter text-xs text-[var(--text-secondary)]">Save keys locally for 1-click syncs</span>
           </label>

           <button
             type="submit"
             disabled={!keyId.trim() || !keySecret.trim()}
             className="w-full mt-2 py-3 rounded-xl border-none font-inter font-bold text-sm text-white bg-[var(--teal)] hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
           >
             Save & Connect
           </button>
        </form>
      </div>
    </div>
  );
}
