import Card from '../../common/Card';

const TEXT_PRIMARY = '#0f1117';
const TEXT_MUTED = '#9197a6';

interface DailyStatsProps {
  currency: string;
  dailySpendRate: number;
  streak: number;
  transactionCount: number;
}

export default function DailyStats({ currency, dailySpendRate, streak, transactionCount }: DailyStatsProps) {
  return (
    <Card style={{ padding: 16, height: '100%' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 12, fontFamily: 'var(--font-manrope)' }}>Today's Stats</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Daily burn rate', value: `${currency}${dailySpendRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#f87171' },
          { label: 'Logging streak', value: `${streak} days`, color: '#fbbf24' },
          { label: 'Transactions', value: String(transactionCount), color: '#6366f1' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: TEXT_MUTED }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
