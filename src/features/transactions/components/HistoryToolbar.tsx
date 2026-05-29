import { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Transaction } from '@/types';
import { haptic } from '@/core/haptic';
import { exportCSV, exportJSON } from '@/utils/export';

interface HistoryToolbarProps {
  filtered:      Transaction[];
  currency:      string;
  onImportClick?: () => void;
  onPDFReport?:   () => void;
  onImportJSON:  (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function HistoryToolbar({
  filtered, currency, onImportClick, onPDFReport, onImportJSON,
}: HistoryToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = filtered.length === 0;

  const btnBase = "flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors";
  const cardBtn = { background: 'var(--surface-card)', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter)', border: '1.5px solid #edf2f7', cursor: 'pointer', boxShadow: 'var(--shadow-card)' };
  const tealBtn = (d: boolean) => ({ background: 'var(--teal-dim)', color: 'var(--teal)', fontFamily: 'var(--font-inter)', border: '1.5px solid var(--teal-glow)', cursor: d ? 'not-allowed' : 'pointer' });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onImportClick && (
        <button onClick={onImportClick} aria-label="Import transactions" className={btnBase} style={cardBtn}>
          <Upload size={14} /><span className="hidden sm:inline">Import</span>
        </button>
      )}
      {onPDFReport && (
        <button onClick={onPDFReport} aria-label="Generate PDF report" className={btnBase} style={cardBtn}>
          <FileText size={14} /><span className="hidden sm:inline">PDF Report</span>
        </button>
      )}
      <button
        onClick={() => { haptic.medium(); exportCSV(filtered); }}
        disabled={disabled}
        aria-label="Export CSV"
        className={`${btnBase} disabled:opacity-40`}
        style={tealBtn(disabled)}
      >
        <Download size={14} /><span className="hidden sm:inline">Export CSV</span>
      </button>
      <button
        onClick={() => { haptic.medium(); exportJSON(filtered); }}
        disabled={disabled}
        aria-label="Export JSON"
        className={`${btnBase} disabled:opacity-40`}
        style={tealBtn(disabled)}
      >
        <Download size={14} /><span className="hidden sm:inline">JSON</span>
      </button>
      {typeof navigator !== 'undefined' && !!navigator.share && (
        <button
          onClick={async () => {
            haptic.medium();
            const { shareTransactions } = await import('@/utils/share');
            shareTransactions(filtered, currency);
          }}
          disabled={disabled}
          aria-label="Share history"
          className={`${btnBase} disabled:opacity-40`}
          style={{ background: 'var(--premium-dim)', color: 'var(--premium)', fontFamily: 'var(--font-inter)', border: '1.5px solid var(--premium-glow)', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <Upload size={14} className="rotate-90" /><span className="hidden sm:inline">Share</span>
        </button>
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        aria-label="Import JSON file"
        className={btnBase}
        style={cardBtn}
      >
        <Upload size={14} /><span className="hidden sm:inline">Import JSON</span>
      </button>
      <input type="file" ref={fileInputRef} onChange={onImportJSON} accept=".json" className="hidden" />
    </div>
  );
}
