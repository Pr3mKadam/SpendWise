import { useState, useMemo } from 'react';
import { 
  Shield, Lock, Baby, Check, AlertTriangle, Settings, 
  Trash2, ShieldCheck, Clock, CheckCircle, 
  XCircle, Link2, Copy, Unlink, BarChart2,
  AlertCircle, ChevronRight, Info, Plus,
  LayoutDashboard, ListFilter, IndianRupee, PieChart,
  ShieldOff
} from 'lucide-react';
import { useStore } from '../../store';
import { PinInput } from '../common/ui/PinInput';
import { Toggle } from '../common/ui/Toggle';
import type { Transaction } from '../../types';

export default function ParentalView() {
  const store = useStore();
  const settings = store.parentalState;
  const transactions = store.transactions;

  // Local state for setup
  const [setupStep, setSetupStep] = useState<'welcome' | 'pin' | 'limits'>('welcome');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Unlocking session
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const isSetup = settings.enabled && settings.parentPinHash;
  const isLocked = settings.enabled && !settings.sessionUnlocked;


  // Filtered transactions for approval
  const pendingTransactions = useMemo(() => 
    transactions.filter(t => t.status === 'pending_approval'),
    [transactions]
  );

  const handleUnlock = async () => {
    const isValid = await store.verifyPin(unlockPin);
    if (isValid) {
      store.unlockSession();
      setUnlockPin('');
      setUnlockError('');
    } else {
      setUnlockError('Invalid PIN');
      setUnlockPin('');
    }
  };


  const handleSetPin = async () => {
    if (newPin.length === 4) {
      await store.setupPin(newPin);
      setSetupStep('limits');
    }
  };


  const handleApprove = (id: string) => {
    store.approveTransaction(id);
  };

  const handleReject = (id: string) => {
    store.denyTransaction(id);
  };

  // --- RENDERING: LOCK SCREEN ---
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
        <div className="card max-w-sm w-full p-8 flex flex-col items-center text-center shadow-2xl border border-[var(--teal)]/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 animate-pulse">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-manrope">Parental Lock</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Access to parental controls and sensitive settings is restricted. Enter your PIN to continue.
          </p>
          
          <PinInput 
            value={unlockPin} 
            onChange={(v) => { setUnlockPin(v); setUnlockError(''); }} 
            error={unlockError} 
            label="Enter Parent PIN" 
          />
          
          <button
            onClick={handleUnlock}
            disabled={unlockPin.length !== 4}
            className="mt-8 w-full py-3.5 rounded-xl bg-[var(--teal)] text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-teal-500/20"
          >
            Unlock Access
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERING: SETUP FLOW ---
  if (!isSetup) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
        {setupStep === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--teal)] to-[#0d9488] flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] font-manrope">Parental Controls</h1>
              <p className="text-[var(--text-muted)] max-w-md mx-auto">
                Secure your account, set spending limits for children, and monitor transactions on shared devices.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-8">
              <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <Lock className="w-5 h-5 text-[var(--teal)] mb-2" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">PIN Protection</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Require a PIN to edit budgets, goals, or settings.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <IndianRupee className="w-5 h-5 text-[var(--teal)] mb-2" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Spending Limits</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Set monthly caps and restrict specific categories.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <Clock className="w-5 h-5 text-[var(--teal)] mb-2" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Transaction Approval</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Review and approve every purchase made on this device.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <PieChart className="w-5 h-5 text-[var(--teal)] mb-2" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Stealth Mode</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Optionally hide analytics or net worth details.</p>
              </div>
            </div>

            <button
              onClick={() => setSetupStep('pin')}
              className="mt-8 px-10 py-4 rounded-2xl bg-[var(--teal)] text-white font-bold transition-all hover:scale-105 shadow-xl shadow-teal-500/20"
            >
              Get Started
            </button>
          </div>
        )}

        {setupStep === 'pin' && (
          <div className="card p-8 flex flex-col items-center text-center max-w-sm mx-auto shadow-2xl border border-[var(--teal)]/10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-manrope">Create Parent PIN</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              This PIN will be required to unlock parental settings and approve transactions.
            </p>
            <PinInput value={newPin} onChange={setNewPin} label="Set 4-Digit PIN" />
            <button
              onClick={handleSetPin}
              disabled={newPin.length !== 4}
              className="mt-8 w-full py-3.5 rounded-xl bg-[var(--teal)] text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg"
            >
              Continue
            </button>
          </div>
        )}

        {setupStep === 'limits' && (
          <div className="card p-8 space-y-8 animate-slide-in">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
              <ShieldCheck className="text-[var(--teal)] w-6 h-6" />
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-manrope">Initial Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Monthly Spending Limit</h4>
                  <p className="text-xs text-[var(--text-muted)]">Maximum child can spend without approval.</p>
                </div>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">₹</span>
                  <input 
                    type="number"
                    value={settings.monthlyLimit || 2000}
                    onChange={(e) => store.updateParentalSettings({ monthlyLimit: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border)] text-sm font-bold text-[var(--teal)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Kid Mode (Active)</h4>
                  <p className="text-xs text-[var(--text-muted)]">Enforces all restrictions immediately.</p>
                </div>
                <Toggle 
                  checked={settings.isTeenMode} 
                  onChange={(v) => store.updateParentalSettings({ isTeenMode: v })} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)]">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Require Approval</h4>
                  <p className="text-xs text-[var(--text-muted)]">For every single transaction made.</p>
                </div>
                <Toggle 
                  checked={settings.requireApproval} 
                  onChange={(v) => store.updateParentalSettings({ requireApproval: v })} 
                />
              </div>
            </div>

            <button
              onClick={() => {
                store.updateParentalSettings({ enabled: true, sessionUnlocked: true });
              }}
              className="w-full py-4 rounded-2xl bg-[var(--teal)] text-white font-bold shadow-lg shadow-teal-500/20"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERING: MAIN DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-manrope flex items-center gap-2">
            <ShieldCheck className="text-[var(--teal)]" />
            Parental Controls
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Session Unlocked · Full management access active</p>
        </div>
        <button 
          onClick={() => store.lockSession()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs hover:bg-amber-500/20 transition-all border border-amber-500/20"
        >
          <Lock size={14} /> Lock Session
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col: Pending Approvals & Quick Stats */}
        <div className="xl:col-span-2 space-y-6">
          {/* Pending Requests */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-input)]/50 flex items-center justify-between">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                Pending Approvals
                {pendingTransactions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {pendingTransactions.length}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="divide-y divide-[var(--border)]">
              {pendingTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-green-500 w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">All Clear!</p>
                  <p className="text-xs text-[var(--text-muted)]">No pending transaction requests found.</p>
                </div>
              ) : (
                pendingTransactions.map(tx => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[var(--surface-input)]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--teal-dim)] flex items-center justify-center text-xl">
                        📦
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{tx.description}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                          {tx.category} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        ₹{tx.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleReject(tx.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                          title="Reject"
                          aria-label="Reject transaction"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleApprove(tx.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all"
                          title="Approve"
                          aria-label="Approve transaction"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Device Linking (Mock UI for continuity) */}
          <div className="card p-6 border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Link2 className="text-purple-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Remote Monitoring</h3>
                <p className="text-xs text-[var(--text-muted)]">Link a child's device to monitor from your phone.</p>
              </div>
            </div>
            
            <div className="bg-[var(--surface-input)] rounded-2xl p-4 flex items-center justify-between border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-card)] flex items-center justify-center">
                  <LayoutDashboard size={14} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">SPWISE-PARENT-7FX</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase">Ready to pair</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 text-white text-[10px] font-bold hover:opacity-90">
                <Copy size={12} /> Copy Invite
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Settings & Controls */}
        <div className="space-y-6">
          <div className="card">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-input)]/50">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Strictness Settings</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Baby size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Kid Mode Active</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Enforces all restrictions</p>
                    </div>
                  </div>
                  <Toggle checked={settings.isTeenMode} onChange={(v) => store.updateParentalSettings({ isTeenMode: v })} />
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Require Approval</p>
                      <p className="text-[10px] text-[var(--text-muted)]">For all transactions</p>
                    </div>
                  </div>
                  <Toggle checked={settings.requireApproval} onChange={(v) => store.updateParentalSettings({ requireApproval: v })} />
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <PieChart size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Hide Analytics</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Hides stats from child</p>
                    </div>
                  </div>
                  <Toggle checked={settings.hideAnalytics} onChange={(v) => store.updateParentalSettings({ hideAnalytics: v })} />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Monthly Spending Limit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">₹</span>
                  <input 
                    type="number"
                    value={settings.monthlyLimit || ''}
                    onChange={(e) => store.updateParentalSettings({ monthlyLimit: Number(e.target.value) })}
                    placeholder="Set limit"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm font-bold text-[var(--teal)] focus:border-[var(--teal)] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-3">
             <div className="flex items-center gap-2 text-amber-500 mb-1">
               <AlertTriangle size={14} />
               <span className="text-[10px] font-bold uppercase">Danger Zone</span>
             </div>
             <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to disable all parental controls?')) {
                  store.removePin();
                }

              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 font-bold text-[11px] hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-500/10"
             >
               <ShieldOff size={14} /> Disable Parental Controls
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
