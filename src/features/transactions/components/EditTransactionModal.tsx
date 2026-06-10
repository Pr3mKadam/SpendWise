import React from 'react';
import { X, Save, Paperclip, Trash2, Loader2 } from 'lucide-react';
import { Transaction, Category } from '@/types';
import Portal from '@/components/ui/Portal';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/core/api/supabase';
import toast from 'react-hot-toast';

interface EditTransactionModalProps {
  tx: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  currency: string;
}

function EditForm({
  tx,
  onSave,
  onClose,
  currency,
}: {
  tx: Transaction;
  onSave: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  onClose: () => void;
  currency: string;
}) {
  const { allCategories } = useCategories();
  const [merchant, setMerchant] = React.useState(tx.merchant);
  const [amount, setAmount] = React.useState(String(tx.amount));
  const [category, setCategory] = React.useState<Category>(tx.category);
  const [type, setType] = React.useState<'credit' | 'debit'>(tx.type);
  const [description, setDescription] = React.useState(tx.description || '');
  const [date, setDate] = React.useState(tx.date?.substring(0, 10) || '');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleAttachReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) {
      toast.error('Cloud storage not configured. Enable Supabase in .env');
      return;
    }
    setUploading(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const userId = user?.id || 'guest';
      const path = `${userId}/${tx.id}.jpg`;

      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/receipts/${path}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? 'Upload failed');
      }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/receipts/${path}`;
      onSave(tx.id, { receiptUrl: publicUrl });
      toast.success('Receipt attached');
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      err: any
    ) {
      toast.error(err.message || 'Failed to upload receipt');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    onSave(tx.id, { receiptUrl: undefined });
    toast.success('Receipt removed');
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !date) return;

    onSave(tx.id, {
      merchant: merchant.trim(),
      amount: parsedAmount,
      category,
      type,
      description: description.trim(),
      date: new Date(date).toISOString(),
    });
    onClose();
  };

  return (
    <>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
            Merchant
          </label>
          <input
            type="text"
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
              Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'credit' | 'debit')}
              className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all cursor-pointer"
            >
              <option value="debit">Expense</option>
              <option value="credit">Income</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all cursor-pointer"
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
            Receipt
          </label>
          {tx.receiptUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/10 shrink-0">
                <img src={tx.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-1 truncate">
                Receipt attached
              </span>
              <button
                onClick={handleRemoveReceipt}
                disabled={uploading}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border-none cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--surface-input)] border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              {uploading ? 'Uploading...' : 'Attach Receipt'}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAttachReceipt}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] block mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl bg-[var(--surface-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--border)]">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-[var(--surface-input)] text-[var(--text-primary)] font-bold border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-[var(--teal)] text-white font-bold border-none cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    </>
  );
}

export function EditTransactionModal({
  tx,
  isOpen,
  onClose,
  onSave,
  currency,
}: EditTransactionModalProps) {
  if (!isOpen || !tx) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          aria-hidden="true"
        />
        <div
          className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
          }} /* tailwind-migration:skip */
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
              Edit Transaction
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--surface-input)] text-[var(--text-muted)] cursor-pointer bg-transparent border-none"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <EditForm key={tx.id} tx={tx} onSave={onSave} onClose={onClose} currency={currency} />
        </div>
      </div>
    </Portal>
  );
}

export default EditTransactionModal;
