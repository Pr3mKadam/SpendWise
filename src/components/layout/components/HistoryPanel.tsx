import { CheckCircle2, XCircle } from 'lucide-react';
import { HistoryEntry } from '@/hooks/useMasterVoice';

const INTENT_LABELS: Record<string, string> = {
  BUDGET_UPDATE: '💰 Budget',
  TRANSACTION_ADD: '💳 Expense',
  LIABILITY_ADD: '🏦 Liability',
  PORTFOLIO_UPDATE: '📈 Investment',
  GOAL_ADD: '🎯 Goal',
  SUBSCRIPTION_ADD: '🔔 Subscription',
  REPORT_EXPORT: '📄 Export',
  NAVIGATE: '🧭 Navigate',
  UNKNOWN: '❓ Unknown',
};

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const age = Math.round((Date.now() - entry.timestamp) / 60000);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: 28 }}>
        {INTENT_LABELS[entry.command.intent] ?? '•'}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}
      >
        {entry.command.summary}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          color: 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {age < 1 ? 'now' : `${age}m ago`}
      </span>
      {entry.result.success ? (
        <CheckCircle2 size={12} style={{ color: '#22c55e', flexShrink: 0 }} />
      ) : (
        <XCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
      )}
    </div>
  );
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  isHeader: boolean;
}

export function HistoryPanel({ history, isHeader }: HistoryPanelProps) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: isHeader ? 'auto' : '138px',
        top: isHeader ? '80px' : 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9997,
        width: 'min(440px, calc(100vw - 2rem))',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-lg)',
        padding: '16px 18px',
        maxHeight: '280px',
        overflowY: 'auto',
        animation: isHeader ? 'micFadeDown 0.2s ease' : 'micFadeUp 0.2s ease',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}
      >
        Recent Commands
      </p>
      {history.map((entry, i) => (
        <HistoryRow key={i} entry={entry} />
      ))}
    </div>
  );
}
