import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  summary: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ summary, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '14px',
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.3)',
        marginTop: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#f59e0b',
          }}
        >
          High-value action — please confirm
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '14px',
          lineHeight: 1.4,
        }}
      >
        {summary}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            fontWeight: 700,
            background: '#22c55e',
            color: '#fff',
          }}
        >
          ✓ Confirm
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '9px 0',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            fontWeight: 700,
            background: 'var(--surface-input)',
            color: 'var(--text-secondary)',
          }}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}
