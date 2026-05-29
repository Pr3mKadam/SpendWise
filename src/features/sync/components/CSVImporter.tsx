import React, { useState, useCallback, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, FileText, X } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { parseCSVLocally } from '@/features/sync/parsers/csv';

interface CSVImporterProps {
  onImport: (transactions: Transaction[]) => void;
}

type MappingKey = 'date' | 'merchant' | 'amount' | 'category' | 'type' | 'skip';
interface ColumnMapping { [colIndex: number]: MappingKey; }

const VALID_CATEGORIES: Category[] = ['Food', 'Subscriptions', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Income', 'Transfer'];
const REQUIRED_FIELDS: MappingKey[] = ['date', 'merchant', 'amount'];
const FIELD_LABELS: Record<MappingKey, string> = {
  date:     '📅 Date',
  merchant: '🏪 Merchant',
  amount:   '💰 Amount',
  category: '🏷️ Category',
  type:     '↕️ Type (credit/debit)',
  skip:     '— Skip',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim()); current = '';
    } else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function guessMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  headers.forEach((h, i) => {
    const lower = h.toLowerCase().replace(/[^a-z]/g, '');
    if (['date', 'transactiondate', 'txdate', 'posted'].includes(lower))             mapping[i] = 'date';
    else if (['merchant', 'description', 'payee', 'name', 'vendor'].includes(lower)) mapping[i] = 'merchant';
    else if (['amount', 'value', 'sum', 'debit', 'credit'].includes(lower))          mapping[i] = 'amount';
    else if (['category', 'type', 'kind'].includes(lower))                            mapping[i] = 'category';
    else                                                                               mapping[i] = 'skip';
  });
  return mapping;
}

function parseDate(raw: string): string {
  const cleaned = raw.replace(/['"]/g, '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  const m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

function guessCategory(raw: string): Category {
  const lower = raw.toLowerCase();
  if (['food', 'dining', 'restaurant', 'groceries', 'cafe'].some(k => lower.includes(k))) return 'Food';
  if (['subscription', 'netflix', 'spotify'].some(k => lower.includes(k))) return 'Subscriptions';
  if (['transport', 'uber', 'lyft', 'gas'].some(k => lower.includes(k))) return 'Transport';
  return 'Shopping';
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = 'upload' | 'mapping' | 'preview' | 'done';

export default function CSVImporter({ onImport }: CSVImporterProps) {
  const [step, setStep] = useState<Step>('upload');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [parsed, setParsed] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload'); setRawRows([]); setHeaders([]);
    setMapping({}); setParsed([]); setError(''); setFileName('');
  };

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file'); return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { setError('CSV must have at least a header row and one data row.'); return; }
      const hdrs = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(parseCSVLine).filter(r => r.some(c => c));
      setHeaders(hdrs); setRawRows(rows); setMapping(guessMapping(hdrs));
      setError(''); setStep('mapping');
    };
    reader.readAsText(file);
  }, []);

  const [isParsing, setIsParsing] = useState(false);

  const buildPreview = async () => {
    setIsParsing(true);
    setError('');

    const sampleRows = rawRows.slice(0, 200).map(r => r.join(',')).join('\n');
    const csvContent = headers.join(',') + '\n' + sampleRows;

    try {
      const txs = parseCSVLocally(csvContent);

      if (txs && txs.length > 0) {
        setParsed(txs.map((tx, i) => ({
          ...tx,
          id: tx.id || `csv-${Date.now()}-${i}`
        })));
        setStep('preview');
      } else {
        setError('Could not parse transactions. Check that date, merchant and amount columns are mapped correctly.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while parsing the CSV.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="font-manrope font-bold text-[var(--text-primary)] text-sm">Native CSV Import</h3>
          <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-0.5">Drag and drop bank statements</p>
        </div>
        {step !== 'upload' && (
          <button onClick={reset} className="p-2 rounded-lg hover:bg-[var(--surface-input)] text-[var(--text-muted)] border-none bg-transparent cursor-pointer">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="p-5">
        {step === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[var(--teal)] bg-[var(--teal-dim)]' : 'border-[var(--border)] bg-[var(--surface-input)]'}`}
          >
            <input ref={fileRef} type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
            <Upload size={24} className={`mx-auto mb-3 ${isDragging ? 'text-[var(--teal)]' : 'text-[var(--text-dim)]'}`} />
            <p className="font-inter text-xs font-bold text-[var(--text-primary)]">Drop CSV statement</p>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">or click to browse</p>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-[var(--teal-dim)] border border-[var(--teal-glow)] flex items-center gap-2">
              <FileText size={12} className="text-[var(--teal)]" />
              <span className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)] truncate">{fileName}</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-input)] border border-[var(--border)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[length:var(--fs-overline)] font-bold text-[var(--text-primary)] truncate">{h || `Col ${i+1}`}</p>
                    <p className="text-[length:var(--fs-overline)] text-[var(--text-dim)] truncate">e.g. {rawRows[0]?.[i] || '—'}</p>
                  </div>
                  <select
                    value={mapping[i] ?? 'skip'}
                    onChange={e => setMapping(p => ({ ...p, [i]: e.target.value as MappingKey }))}
                    className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)] bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    {(Object.keys(FIELD_LABELS) as MappingKey[]).map(k => <option key={k} value={k}>{FIELD_LABELS[k]}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button 
              onClick={buildPreview} 
              disabled={isParsing}
              className="w-full py-2.5 rounded-xl bg-[var(--teal)] text-white font-bold text-xs border-none cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? 'Parsing...' : 'Preview Data'}
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-3">
            <div className="max-h-[240px] overflow-y-auto border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
              {parsed.map((tx, i) => (
                <div key={i} className="p-2.5 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[length:var(--fs-caption)] font-bold text-[var(--text-primary)] truncate">{tx.merchant}</p>
                    <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">{tx.date} · {tx.category}</p>
                  </div>
                  <p className="text-[length:var(--fs-caption)] font-bold text-[var(--text-primary)]">₹{tx.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('mapping')} className="flex-1 py-2.5 rounded-xl bg-[var(--surface-input)] text-[var(--text-secondary)] font-bold text-xs border border-[var(--border)] cursor-pointer">
                Back
              </button>
              <button onClick={() => { onImport(parsed); setStep('done'); }} className="flex-1 py-2.5 rounded-xl bg-[var(--teal)] text-white font-bold text-xs border-none cursor-pointer hover:opacity-90">
                Import All
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <p className="font-bold text-[var(--text-primary)] text-sm">Import Complete!</p>
            <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-1">{parsed.length} transactions added</p>
            <button onClick={reset} className="mt-4 px-6 py-2 rounded-lg bg-[var(--surface-input)] text-[var(--text-primary)] font-bold text-[length:var(--fs-overline)] border border-[var(--border)] cursor-pointer">
              Import Another
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-2 items-center">
            <AlertCircle size={12} className="text-red-500 shrink-0" />
            <p className="text-[length:var(--fs-overline)] text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
