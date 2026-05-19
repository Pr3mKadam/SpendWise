import { useRef } from 'react';
import { Download, Trash2, Lock, DownloadCloud } from 'lucide-react';
import { Transaction } from '@/types';

interface DataManagementProps {
  transactions: Transaction[];
  onExportCSV: () => void;
  onOpenResetConfirm: () => void;
  onOpenSecureExport: () => void;
  onOpenRestore: () => void;
  onRawDBExport: () => void;
  onRawDBImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportTransactions: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DataCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  titleColor?: string;
  description: React.ReactNode;
  borderColor?: string;
  children: React.ReactNode;
}

function DataCard({ icon: Icon, iconBg, iconColor, title, titleColor, description, borderColor, children }: DataCardProps) {
  return (
    <div
      className="flex flex-col p-5 rounded-xl"
      style={{ border: `1.5px solid ${borderColor ?? 'var(--border)'}`, background: 'var(--surface-input)' }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0" style={{ background: iconBg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <h4 className="font-inter font-bold text-[15px] mb-1" style={{ color: titleColor ?? 'var(--text-primary)' }}>
        {title}
      </h4>
      <p className="font-inter text-xs mb-4 flex-1" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {description}
      </p>
      {children}
    </div>
  );
}

export function DataManagement({
  transactions,
  onExportCSV,
  onOpenResetConfirm,
  onOpenSecureExport,
  onOpenRestore,
  onRawDBExport,
  onRawDBImport,
  onImportTransactions,
}: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card">
      <div className="px-6 py-5" style={{ borderBottom: '1.5px solid var(--border)' }}>
        <h3 className="font-manrope font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          Data Management
        </h3>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Export CSV */}
        <DataCard
          icon={Download}
          iconBg="var(--teal-dim)"
          iconColor="var(--teal)"
          title="Export to CSV"
          description={`Download all ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} as a spreadsheet. Works with Excel, Google Sheets, and any other tool.`}
        >
          <button
            onClick={onExportCSV}
            disabled={transactions.length === 0}
            className="self-start px-4 py-2 rounded-lg font-inter font-semibold text-xs transition-colors disabled:opacity-40"
            style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', cursor: 'pointer' }}
          >
            Download .CSV
          </button>
        </DataCard>

        {/* Danger Zone */}
        <DataCard
          icon={Trash2}
          iconBg="rgba(239,68,68,0.1)"
          iconColor="var(--red)"
          title="Danger Zone"
          titleColor="var(--red)"
          description="Permanently delete all transactions, budgets, goals, and custom categories. This cannot be undone."
          borderColor="rgba(239,68,68,0.25)"
        >
          <button
            onClick={onOpenResetConfirm}
            className="self-start px-4 py-2 rounded-lg font-inter font-bold text-xs transition-colors"
            style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer' }}
          >
            Reset All Data
          </button>
        </DataCard>

        {/* Secure Backup — full width */}
        <div
          className="flex flex-col p-5 rounded-xl md:col-span-2"
          style={{ border: '1.5px solid var(--teal)', background: 'var(--teal-dim)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--teal)', boxShadow: '0 0 15px rgba(20,184,166,0.4)' }}>
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <h4 className="font-inter font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Secure Encrypted Backup</h4>
              <p className="font-inter text-[length:var(--fs-overline)]" style={{ color: 'var(--teal)' }}>Professional Grade Security (AES-256)</p>
            </div>
          </div>
          <p className="font-inter text-xs mb-4" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Export your entire SpendWise database (Transactions, Budgets, Quests, Goals, Portfolio) into a single encrypted file.
            The data is locked with your password and can only be decrypted by SpendWise.{' '}
            <strong>This is the safest way to back up your wealth data.</strong>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenSecureExport}
              className="px-5 py-2.5 rounded-xl font-inter font-bold text-xs text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--teal)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,184,166,0.3)' }}
            >
              Generate Secure Backup (.swb)
            </button>
            <button
              onClick={onOpenRestore}
              className="px-5 py-2.5 rounded-xl font-inter font-bold text-xs transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--teal)', cursor: 'pointer' }}
            >
              Restore from Secure Backup
            </button>
          </div>
        </div>

        {/* Raw DB Backup - Dev Only */}
        {import.meta.env.DEV && (
          <div
            className="flex flex-col p-5 rounded-xl md:col-span-2 mt-0"
            style={{ border: '1.5px solid var(--border)', background: 'var(--surface-input)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <DownloadCloud size={16} style={{ color: '#6366f1' }} />
              </div>
              <h4 className="font-inter font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Raw Database Export/Import (.json) <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono ml-2">DEV ONLY</span></h4>
            </div>
            <p className="font-inter text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Export or import the raw IndexedDB database (unencrypted) for testing or moving to another device manually.
            </p>
            <div className="flex gap-3 items-center">
              <button
                onClick={onRawDBExport}
                className="px-4 py-2 rounded-lg font-inter font-semibold text-xs transition-colors"
                style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', cursor: 'pointer' }}
              >
                Download Raw JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg font-inter font-semibold text-xs transition-colors"
                style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', cursor: 'pointer' }}
              >
                Import Raw JSON
              </button>
              <input type="file" accept=".json" onChange={onRawDBImport} ref={fileInputRef} className="hidden" />
            </div>
          </div>
        )}

        {/* Transaction-only Import */}
        <div
          className="flex flex-col p-5 rounded-xl md:col-span-2 mt-0"
          style={{ border: '1.5px solid var(--border)', background: 'var(--surface-input)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.1)' }}>
              <Download size={16} style={{ color: 'var(--teal)' }} />
            </div>
            <h4 className="font-inter font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Import Transactions (.json)</h4>
          </div>
          <p className="font-inter text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Import transactions from a JSON file. This will MERGE them with your existing data.
          </p>
          <div className="flex gap-3 items-center">
            <label className="px-4 py-2 rounded-lg font-inter font-semibold text-xs transition-colors cursor-pointer"
              style={{ background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' }}>
              Select JSON File
              <input type="file" accept=".json" onChange={onImportTransactions} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataManagement;
