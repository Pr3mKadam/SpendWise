import { RefreshCw } from 'lucide-react';

export function RolloverToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all duration-200"
      style={{
        background: enabled ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
        border: `1px solid ${enabled ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`,
        cursor: 'pointer',
        color: enabled ? '#818cf8' : 'var(--text-muted)',
        fontFamily: 'var(--font-inter)',
        fontSize: '13px',
        fontWeight: 600,
      }}
      title="Carry unspent budget forward to the next period"
    >
      <RefreshCw size={14} style={{ flexShrink: 0 }} />
      <span>Rollover</span>
      {/* iOS-style pill */}
      <span
        className="relative inline-flex items-center shrink-0"
        style={{
          width: '34px',
          height: '20px',
          background: enabled ? '#818cf8' : 'var(--border)',
          borderRadius: '999px',
          transition: 'background 0.25s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: enabled ? '16px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.25s',
          }}
        />
      </span>
    </button>
  );
}
