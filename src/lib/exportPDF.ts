import { Transaction, MonthlyStats, Budget, SavingsGoal } from '../types';

interface PDFReportData {
  transactions: Transaction[];
  monthlyStats:  MonthlyStats;
  budgets:       Budget[];
  goals:         SavingsGoal[];
  currency:      string;
  month:         string; // e.g. "April 2026"
}

// ─── Inline styles (no external CSS needed for print window) ───────────────────

const TEAL    = '#14b8a6';
const DARK    = '#1a202c';
const MUTED   = '#718096';
const BG_CARD = '#f8fafc';
const GREEN   = '#10b981';
const RED     = '#ef4444';
const AMBER   = '#f59e0b';

function fmt(currency: string, amount: number): string {
  return `${currency}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(val: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((val / total) * 100)}%`;
}

// ─── Category aggregation ──────────────────────────────────────────────────────

function aggregateByCategory(txs: Transaction[]): { category: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  txs.forEach(tx => {
    if (tx.type === 'debit') {
      const e = map.get(tx.category) ?? { total: 0, count: 0 };
      map.set(tx.category, { total: e.total + tx.amount, count: e.count + 1 });
    }
  });
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);
}

// ─── HTML template ─────────────────────────────────────────────────────────────

function buildHTML(data: PDFReportData): string {
  const { transactions, monthlyStats, budgets, goals, currency, month } = data;
  const catBreakdown = aggregateByCategory(transactions);
  const totalExpenses = monthlyStats.totalExpenses || 0;
  const totalIncome   = monthlyStats.totalIncome   || 0;
  const netCashFlow   = monthlyStats.netCashFlow;
  const savingsRate   = monthlyStats.savingsRate;
  const generatedAt   = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

  const netColor = netCashFlow >= 0 ? GREEN : RED;
  const savingsColor = savingsRate >= 20 ? GREEN : savingsRate >= 10 ? AMBER : RED;

  // ── Transaction rows (top 20 for PDF readability) ──────────────────────────
  const recentTxs = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const txRows = recentTxs.map(tx => {
    const isCredit = tx.type === 'credit';
    const color = isCredit ? GREEN : DARK;
    const sign  = isCredit ? '+' : '−';
    return `
      <tr style="border-bottom:1px solid #edf2f7">
        <td style="padding:8px 10px;font-size:12px;color:${MUTED}">${tx.date}</td>
        <td style="padding:8px 10px;font-size:13px;font-weight:600;color:${DARK}">${tx.merchant}</td>
        <td style="padding:8px 10px">
          <span style="background:${isCredit ? 'rgba(16,185,129,0.1)' : 'rgba(20,184,166,0.1)'};color:${isCredit ? GREEN : TEAL};border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">
            ${tx.category}
          </span>
        </td>
        <td style="padding:8px 10px;font-size:13px;font-weight:700;color:${color};text-align:right">${sign}${fmt(currency, tx.amount)}</td>
      </tr>`;
  }).join('');

  // ── Budget rows ────────────────────────────────────────────────────────────
  const budgetRows = budgets.map(b => {
    const barColor = b.status === 'danger' ? RED : b.status === 'warning' ? AMBER : TEAL;
    const pctVal   = Math.min(b.percent, 100);
    return `
      <tr style="border-bottom:1px solid #edf2f7">
        <td style="padding:8px 10px;font-size:13px;font-weight:600;color:${DARK}">${b.category}</td>
        <td style="padding:8px 10px;font-size:12px;color:${MUTED}">${fmt(currency, b.spent)} / ${fmt(currency, b.limit)}</td>
        <td style="padding:8px 10px;min-width:120px">
          <div style="background:#edf2f7;border-radius:8px;height:7px;width:100%">
            <div style="background:${barColor};border-radius:8px;height:7px;width:${pctVal}%"></div>
          </div>
        </td>
        <td style="padding:8px 10px;font-size:12px;font-weight:700;color:${barColor};text-align:right">${pctVal}%</td>
      </tr>`;
  }).join('');

  // ── Goals rows ─────────────────────────────────────────────────────────────
  const goalRows = goals.map(g => {
    const progress = g.targetAmount > 0 ? Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100) : 0;
    const statusColor = g.status === 'achieved' ? GREEN : g.status === 'at-risk' ? RED : TEAL;
    return `
      <tr style="border-bottom:1px solid #edf2f7">
        <td style="padding:8px 10px;font-size:14px">${g.emoji} <span style="font-size:13px;font-weight:600;color:${DARK}">${g.name}</span></td>
        <td style="padding:8px 10px;font-size:12px;color:${MUTED}">${fmt(currency, g.savedAmount)} / ${fmt(currency, g.targetAmount)}</td>
        <td style="padding:8px 10px;min-width:120px">
          <div style="background:#edf2f7;border-radius:8px;height:7px;width:100%">
            <div style="background:${g.color || TEAL};border-radius:8px;height:7px;width:${progress}%"></div>
          </div>
        </td>
        <td style="padding:8px 10px;font-size:12px;font-weight:700;color:${statusColor};text-align:right">${progress}%</td>
      </tr>`;
  }).join('');

  // ── Category breakdown rows ────────────────────────────────────────────────
  const catRows = catBreakdown.map(c => `
    <tr style="border-bottom:1px solid #edf2f7">
      <td style="padding:8px 10px;font-size:13px;font-weight:600;color:${DARK}">${c.category}</td>
      <td style="padding:8px 10px;font-size:12px;color:${MUTED}">${c.count} transaction${c.count !== 1 ? 's' : ''}</td>
      <td style="padding:8px 10px;min-width:120px">
        <div style="background:#edf2f7;border-radius:8px;height:7px;width:100%">
          <div style="background:${TEAL};border-radius:8px;height:7px;width:${pct(c.total, totalExpenses)}"></div>
        </div>
      </td>
      <td style="padding:8px 10px;font-size:13px;font-weight:700;color:${DARK};text-align:right">${fmt(currency, c.total)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SpendWise — ${month} Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: ${DARK}; font-size: 14px; }
    @page { margin: 20mm 15mm; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: ${DARK}; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${MUTED}; padding: 8px 10px; border-bottom: 2px solid #edf2f7; }
    th:last-child { text-align: right; }
    .section { margin-bottom: 28px; background: ${BG_CARD}; border-radius: 12px; padding: 18px; border: 1px solid #edf2f7; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: ${BG_CARD}; border-radius: 10px; padding: 14px 16px; border: 1px solid #edf2f7; }
    .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${MUTED}; margin-bottom: 6px; }
    .stat-value { font-size: 22px; font-weight: 800; line-height: 1; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: ${TEAL}; color: #fff; border: none; border-radius: 10px; padding: 12px 22px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(20,184,166,0.4); z-index: 999; }
    .print-btn:hover { background: #2dd4bf; }
    .header { padding: 24px 0 20px; margin-bottom: 20px; border-bottom: 2px solid #edf2f7; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: ${DARK}; }
    .brand span { color: ${TEAL}; }
    .meta { font-size: 12px; color: ${MUTED}; }
  </style>
</head>
<body style="padding: 24px 32px; max-width: 900px; margin: 0 auto;">

  <button class="no-print print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>

  <div class="header">
    <div>
      <div class="brand">SPEND<span>Wise</span>.</div>
      <div class="meta">Monthly Financial Report · ${month}</div>
    </div>
    <div style="text-align:right">
      <div class="meta">Generated</div>
      <div style="font-size:12px;font-weight:600;color:${DARK}">${generatedAt}</div>
    </div>
  </div>

  <!-- Summary Stats -->
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">Total Income</div>
      <div class="stat-value" style="color:${GREEN}">${fmt(currency, totalIncome)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value" style="color:${RED}">${fmt(currency, totalExpenses)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Net Cash Flow</div>
      <div class="stat-value" style="color:${netColor}">${netCashFlow >= 0 ? '+' : '−'}${fmt(currency, netCashFlow)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Savings Rate</div>
      <div class="stat-value" style="color:${savingsColor}">${savingsRate}%</div>
    </div>
  </div>

  <!-- Spending by Category -->
  <div class="section">
    <h2>Spending by Category</h2>
    <table>
      <thead><tr><th>Category</th><th>Transactions</th><th>Share of Expenses</th><th>Total Spent</th></tr></thead>
      <tbody>${catRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:' + MUTED + '">No expenses this period</td></tr>'}</tbody>
    </table>
  </div>

  <!-- Budgets -->
  ${budgets.length ? `
  <div class="section">
    <h2>Budget Performance</h2>
    <table>
      <thead><tr><th>Category</th><th>Spent / Limit</th><th>Progress</th><th>Used</th></tr></thead>
      <tbody>${budgetRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Goals -->
  ${goals.length ? `
  <div class="section">
    <h2>Savings Goals</h2>
    <table>
      <thead><tr><th>Goal</th><th>Saved / Target</th><th>Progress</th><th>Complete</th></tr></thead>
      <tbody>${goalRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Recent Transactions -->
  <div class="section">
    <h2>Recent Transactions ${transactions.length > 20 ? '(Top 20)' : ''}</h2>
    <table>
      <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Amount</th></tr></thead>
      <tbody>${txRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:' + MUTED + '">No transactions this period</td></tr>'}</tbody>
    </table>
  </div>

  <div style="text-align:center;font-size:11px;color:${MUTED};margin-top:20px;padding-top:16px;border-top:1px solid #edf2f7">
    SpendWise · All data stored locally · No data leaves your device 🔒
  </div>

</body>
</html>`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function generatePDFReport(data: PDFReportData): void {
  const html = buildHTML(data);
  const win  = window.open('', '_blank', 'width=960,height=800');
  if (!win) {
    alert('Pop-up blocked! Please allow pop-ups for SpendWise to generate the PDF report.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Give browser a moment to render before auto-focusing
  setTimeout(() => { win.focus(); }, 300);
}
