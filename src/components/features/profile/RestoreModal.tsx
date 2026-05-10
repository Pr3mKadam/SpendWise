import React, { useState } from 'react';
import { DownloadCloud, Lock } from 'lucide-react';

export interface RestoreModalProps {
  onClose: () => void;
  onRestore: (file: File, password: string) => void;
  isRestoring: boolean;
}

export function RestoreModal({ onClose, onRestore, isRestoring }: RestoreModalProps) {
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleRestore = () => {
    if (!file || !password) return;
    onRestore(file, password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-[var(--teal)]/20">
        <div className="w-12 h-12 rounded-full bg-[var(--teal-dim)] flex items-center justify-center mx-auto mb-4">
          <DownloadCloud className="text-[var(--teal)] w-6 h-6" />
        </div>
        <h3 className="font-manrope font-bold text-xl text-center text-[var(--text-primary)] mb-2">Restore Backup</h3>
        <p className="font-inter text-sm text-[var(--text-secondary)] text-center mb-6">
          Select your <code>.swb</code> file and enter the password used to encrypt it.
        </p>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Backup File</label>
            <input
              type="file"
              accept=".swb"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full font-inter text-xs px-4 py-3 rounded-xl focus:outline-none transition-colors border-2 border-transparent"
              style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter backup password"
                className="w-full font-inter text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-colors border-2 border-transparent"
                style={{ background: 'var(--surface-input)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              setPassword('');
              setFile(null);
            }}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            disabled={!file || !password || isRestoring}
            className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm bg-[var(--teal)] text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isRestoring ? 'Decrypting...' : 'Restore Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestoreModal;
