import { Building2, ArrowRight } from 'lucide-react';
import type { AppView } from '@/components/ui/types';

interface BankSyncCardProps {
  onNavigate?: (view: AppView) => void;
}

export function BankSyncCard({ onNavigate }: BankSyncCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--teal)]/10 to-[var(--teal)]/5 border border-[var(--border)]">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[var(--teal)]/20">
          <Building2 size={20} className="text-[var(--teal)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Connect Your Bank</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Auto-import 6 months of transactions. No manual entry needed.</p>
          <button
            onClick={() => onNavigate?.('sync')}
            className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl bg-[var(--teal)] text-white text-xs font-bold hover:opacity-90 transition-opacity border-none cursor-pointer"
          >
            Set Up Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
