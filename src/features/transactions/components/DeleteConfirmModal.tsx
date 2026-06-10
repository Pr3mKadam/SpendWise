import { AlertCircle } from 'lucide-react';

interface DeleteConfirmModalProps {
  deleteConfirmId: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteConfirmModal({
  deleteConfirmId,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!deleteConfirmId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="card rounded-3xl p-6 shadow-2xl w-80 animate-fade-in-up"
        style={{ border: '1.5px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4"
          style={{ background: 'var(--red-dim)' }}
        >
          <AlertCircle size={22} style={{ color: 'var(--red)' }} />
        </div>
        <h3
          className="text-center font-bold text-base mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-manrope)' }}
        >
          Delete Transaction?
        </h3>
        <p
          className="text-center text-xs mb-5"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
        >
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors"
            style={{ background: 'var(--surface-input)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteConfirmId)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-colors"
            style={{ background: 'var(--red)', color: '#fff' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
