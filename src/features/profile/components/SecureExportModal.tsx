import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';

export interface SecureExportModalProps {
  onClose: () => void;
  onExport: (password: string) => void;
  isExporting: boolean;
}

export function SecureExportModal({ onClose, onExport, isExporting }: SecureExportModalProps) {
  const [password, setPassword] = useState('');

  const handleExport = () => {
    if (!password) return;
    onExport(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-[var(--teal)]/20">
        <div className="w-12 h-12 rounded-full bg-[var(--teal-dim)] flex items-center justify-center mx-auto mb-4">
          <Shield className="text-[var(--teal)] w-6 h-6" />
        </div>
        <h3 className="font-manrope font-bold text-xl text-center text-[var(--text-primary)] mb-2">Set Backup Password</h3>
        <p className="font-inter text-sm text-[var(--text-secondary)] text-center mb-6">
          This password will be required to restore your data. SpendWise does not store this password; if you lose it, your backup cannot be recovered.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full font-inter text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-colors border-2 border-transparent"
              style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              setPassword('');
            }}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!password || isExporting}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm bg-[var(--teal)] text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isExporting ? 'Encrypting...' : 'Export Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecureExportModal;
