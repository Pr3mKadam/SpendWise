import { useState, useCallback, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { Transaction, Category } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ImportCSVModalProps {
  isOpen:  boolean;
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
}

type MappingKey = 'date' | 'merchant' | 'amount' | 'category' | 'type' | 'skip';

interface ColumnMapping {
  [colIndex: number]: MappingKey;
}

const VALID_CATEGORIES: Category[] = ['Food', 'Subscriptions', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Income'];
const REQUIRED_FIELDS: MappingKey[] = ['date', 'merchant', 'amount'];

const FIELD_LABELS: Record<MappingKey, string> = {
  date:     '📅 Date',
  merchant: '🏪 Merchant',
  amount:   '💰 Amount',
  category: '🏷️ Category',
  type:     '↕️ Type (credit/debit)',
  skip:     '— Skip',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
    } else {
      current += ch;
    }
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
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  // MM/DD/YYYY
  const m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  // DD-MMM-YYYY
  const m2 = cleaned.match(/^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/);
  if (m2) {
    const months: Record<string, string> = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06', jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
    const mo = months[m2[2].toLowerCase()];
    if (mo) return `${m2[3]}-${mo}-${m2[1].padStart(2, '0')}`;
  }
  // Fallback: try Date constructor
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

function guessCategory(raw: string): Category {
  const lower = raw.toLowerCase();
  if (['food', 'dining', 'restaurant', 'groceries', 'cafe', 'coffee'].some(k => lower.includes(k))) return 'Food';
  if (['subscription', 'netflix', 'spotify', 'streaming'].some(k => lower.includes(k)))              return 'Subscriptions';
  if (['transport', 'uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking'].some(k => lower.includes(k))) return 'Transport';
  if (['entertainment', 'movie', 'game', 'cinema'].some(k => lower.includes(k)))                     return 'Entertainment';
  if (['shopping', 'amazon', 'retail', 'store', 'shop'].some(k => lower.includes(k)))                return 'Shopping';
  if (['utility', 'electric', 'water', 'internet', 'phone', 'billing'].some(k => lower.includes(k))) return 'Utilities';
  if (['health', 'medical', 'pharmacy', 'doctor', 'gym', 'fitness'].some(k => lower.includes(k)))    return 'Health';
  if (['salary', 'paycheck', 'income', 'deposit', 'transfer in'].some(k => lower.includes(k)))       return 'Income';
  return 'Shopping';
}

// ─── Component ─────────────────────────────────────────────────────────────────

type Step = 'upload' | 'mapping' | 'preview' | 'done';

export default function ImportCSVModal({ isOpen, onClose, onImport }: ImportCSVModalProps) {
  const [step, setStep]               = useState<Step>('upload');
  const [rawRows, setRawRows]         = useState<string[][]>([]);
  const [headers, setHeaders]         = useState<string[]>([]);
  const [mapping, setMapping]         = useState<ColumnMapping>({});
  const [parsed, setParsed]           = useState<Transaction[]>([]);
  const [error, setError]             = useState('');
  const [isDragging, setIsDragging]   = useState(false);
  const [fileName, setFileName]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload'); setRawRows([]); setHeaders([]);
    setMapping({}); setParsed([]); setError(''); setFileName('');
  };

  const handleClose = () => { reset(); onClose(); };

  // ── File parsing ────────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file'); return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text  = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { setError('CSV must have at least a header row and one data row.'); return; }
      const hdrs = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(parseCSVLine).filter(r => r.some(c => c));
      setHeaders(hdrs);
      setRawRows(rows);
      setMapping(guessMapping(hdrs));
      setError('');
      setStep('mapping');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Preview ─────────────────────────────────────────────────────────────────

  const buildPreview = () => {
    const mapped = REQUIRED_FIELDS.every(f => Object.values(mapping).includes(f));
    if (!mapped) { setError(`Please map the required fields: ${REQUIRED_FIELDS.join(', ')}`); return; }

    const dateIdx     = Object.entries(mapping).find(([, v]) => v === 'date')?.[0];
    const merchantIdx = Object.entries(mapping).find(([, v]) => v === 'merchant')?.[0];
    const amountIdx   = Object.entries(mapping).find(([, v]) => v === 'amount')?.[0];
    const categoryIdx = Object.entries(mapping).find(([, v]) => v === 'category')?.[0];
    const typeIdx     = Object.entries(mapping).find(([, v]) => v === 'type')?.[0];

    const txs: Transaction[] = rawRows.map((row, i) => {
      const rawAmount = parseFloat((row[Number(amountIdx)] ?? '0').replace(/[^0-9.\-]/g, ''));
      const isNeg     = rawAmount < 0;
      const rawType   = typeIdx ? (row[Number(typeIdx)] ?? '').toLowerCase() : '';
      const type: 'credit' | 'debit' = rawType.includes('credit') || rawType.includes('income') || rawType.includes('+') ? 'credit'
        : rawType.includes('debit') || rawType.includes('expense') || isNeg ? 'debit'
        : Math.abs(rawAmount) > 0 && rawAmount > 0 ? 'debit'
        : 'debit';

      const rawCat  = categoryIdx ? (row[Number(categoryIdx)] ?? '') : '';
      const catLook = VALID_CATEGORIES.find(c => c.toLowerCase() === rawCat.toLowerCase());
      const category: Category = catLook ?? (type === 'credit' ? 'Income' : guessCategory(row[Number(merchantIdx)] ?? ''));

      return {
        id:       `import-${Date.now()}-${i}`,
        date:     parseDate(row[Number(dateIdx)] ?? ''),
        merchant: (row[Number(merchantIdx)] ?? 'Unknown').replace(/^["']|["']$/g, '').trim() || 'Unknown',
        amount:   Math.abs(rawAmount) || 0,
        category,
        type,
      };
    }).filter(tx => tx.amount > 0);

    setParsed(txs);
    setError('');
    setStep('preview');
  };

  // ── Confirm import ──────────────────────────────────────────────────────────

  const confirmImport = () => {
    onImport(parsed);
    setStep('done');
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="animate-scale-in w-full flex flex-col"
        style={{ maxWidth: '680px', background: 'var(--surface-card)', borderRadius: '20px', boxShadow: 'var(--shadow-modal)', maxHeight: '90vh', overflow: 'hidden' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1.5px solid #f0f2f5', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Import Transactions
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {step === 'upload'  && 'Upload a CSV file from your bank or spreadsheet'}
              {step === 'mapping' && `${rawRows.length} rows found — map your columns`}
              {step === 'preview' && `${parsed.length} transactions ready to import`}
              {step === 'done'    && 'Import complete!'}
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-2 px-6 py-3" style={{ background: 'var(--surface-input)', borderBottom: '1.5px solid #f0f2f5', flexShrink: 0 }}>
          {(['upload', 'mapping', 'preview'] as Step[]).map((s, idx) => {
            const steps: Step[] = ['upload', 'mapping', 'preview', 'done'];
            const currentIdx = steps.indexOf(step);
            const done = currentIdx > idx;
            const active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? 'var(--teal)' : active ? 'var(--teal-dim)' : '#edf2f7', border: active ? '2px solid var(--teal)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: done ? '#fff' : active ? 'var(--teal)' : 'var(--text-dim)', flexShrink: 0 }}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: active ? 600 : 400, color: active ? 'var(--teal)' : done ? 'var(--text-secondary)' : 'var(--text-dim)', textTransform: 'capitalize' }}>{s}</span>
                </div>
                {idx < 2 && <ChevronRight size={12} style={{ color: 'var(--text-dim)' }} />}
              </div>
            );
          })}
        </div>

        {/* ── Content (scrollable) ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--teal)' : '#e2e8f0'}`,
                  borderRadius: '16px',
                  background: isDragging ? 'var(--teal-dim)' : 'var(--surface-input)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileInput} style={{ display: 'none' }} />
                <div style={{ width: 52, height: 52, borderRadius: '14px', background: isDragging ? 'var(--teal)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Upload size={24} style={{ color: isDragging ? '#fff' : 'var(--text-dim)' }} />
                </div>
                <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Drop your CSV here
                </p>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)' }}>
                  or click to browse · .csv files only
                </p>
              </div>

              {/* Tips */}
              <div style={{ marginTop: '20px', background: 'var(--teal-dim)', borderRadius: '12px', padding: '14px 16px', border: '1.5px solid var(--teal-glow)' }}>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600, color: 'var(--teal)', marginBottom: '6px' }}>💡 Tips for a smooth import</p>
                <ul style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '14px', lineHeight: 1.7 }}>
                  <li>Most bank exports work out of the box</li>
                  <li>Required columns: Date, Merchant/Description, Amount</li>
                  <li>Optional: Category, Type (credit/debit)</li>
                  <li>Date formats: YYYY-MM-DD, MM/DD/YYYY, DD-Mon-YYYY</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: 'var(--red-dim)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={15} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--red)' }}>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Column Mapping ── */}
          {step === 'mapping' && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: 'var(--teal-dim)', border: '1.5px solid var(--teal-glow)' }}>
                <FileText size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--teal)' }}>
                  <strong>{fileName}</strong> · {rawRows.length} rows · columns auto-detected
                </p>
              </div>

              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Map each CSV column to a SpendWise field. Required: Date, Merchant, Amount.
              </p>

              <div style={{ display: 'grid', gap: '10px' }}>
                {headers.map((header, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-input)', border: '1.5px solid #edf2f7' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{header || `Column ${i + 1}`}</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: 'var(--text-dim)' }}>
                        {rawRows[0]?.[i] ? `e.g. "${rawRows[0][i]}"` : '—'}
                      </p>
                    </div>
                    <select
                      value={mapping[i] ?? 'skip'}
                      onChange={e => setMapping(prev => ({ ...prev, [i]: e.target.value as MappingKey }))}
                      style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--teal)', background: 'var(--surface-card)', border: '1.5px solid var(--teal-glow)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
                    >
                      {(Object.keys(FIELD_LABELS) as MappingKey[]).map(k => (
                        <option key={k} value={k}>{FIELD_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: 'var(--red-dim)', border: '1.5px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={15} style={{ color: 'var(--red)', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--red)' }}>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === 'preview' && (
            <div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #edf2f7' }}>
                <div className="flex items-center gap-4 px-4 py-2.5" style={{ background: 'var(--surface-input)', borderBottom: '1.5px solid #edf2f7' }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', flex: '0 0 90px' }}>Date</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', flex: 1 }}>Merchant</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', flex: '0 0 100px' }}>Category</span>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', flex: '0 0 90px', textAlign: 'right' }}>Amount</span>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {parsed.map((tx, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-2.5" style={{ borderBottom: i < parsed.length - 1 ? '1px solid #f7f8fa' : 'none' }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', flex: '0 0 90px' }}>{tx.date}</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }} className="truncate">{tx.merchant}</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-dim)', borderRadius: '20px', padding: '2px 8px', flex: '0 0 100px', textAlign: 'center' }}>{tx.category}</span>
                      <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: tx.type === 'credit' ? 'var(--green)' : 'var(--text-primary)', flex: '0 0 90px', textAlign: 'right' }}>
                        {tx.type === 'credit' ? '+' : '−'}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                {parsed.length} transaction{parsed.length !== 1 ? 's' : ''} will be added to SpendWise
              </p>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--teal)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Import Successful!
              </h3>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {parsed.length} transaction{parsed.length !== 1 ? 's' : ''} added to SpendWise
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={reset} className="ghost-button" style={{ borderRadius: '10px', padding: '10px 20px' }}>
                  <RefreshCw size={14} /> Import More
                </button>
                <button onClick={handleClose} className="primary-button" style={{ borderRadius: '10px', padding: '10px 20px' }}>
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer actions ── */}
        {step !== 'done' && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1.5px solid #f0f2f5', flexShrink: 0 }}>
            <button
              onClick={step === 'upload' ? handleClose : () => setStep(step === 'preview' ? 'mapping' : 'upload')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 12px' }}
            >
              {step === 'upload' ? 'Cancel' : '← Back'}
            </button>
            {step === 'mapping' && (
              <button onClick={buildPreview} className="primary-button" style={{ borderRadius: '10px', padding: '10px 24px' }}>
                Preview Import <ChevronRight size={14} />
              </button>
            )}
            {step === 'preview' && (
              <button onClick={confirmImport} className="primary-button" style={{ borderRadius: '10px', padding: '10px 24px' }}>
                Import {parsed.length} Transactions ✓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
