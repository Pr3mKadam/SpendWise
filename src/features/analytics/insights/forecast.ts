import { Transaction, Category } from '@/types';

export interface CategoryForecast {
  category: Category;
  avgMonthly: number;
  lastMonth: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
}

export interface SpendingForecast {
  predictedTotal: number;
  predictedIncome: number;
  predictedSavings: number;
  categoryForecasts: CategoryForecast[];
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
  daysRemaining: number;
  spentSoFar: number;
  runRate: number; // projected spend if current rate continues
}

/**
 * Pure local forecast — zero API calls.
 * Uses a simple weighted average (recent months weigh more)
 * and a "burn rate" extrapolation for the current month.
 */
export function forecastNextMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): SpendingForecast {
  const now = referenceDate;
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = totalDaysInMonth - daysElapsed;

  // Group transactions by YYYY-MM
  const byMonth: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const ym = tx.date.slice(0, 7);
    if (!byMonth[ym]) byMonth[ym] = [];
    byMonth[ym].push(tx);
  }

  // Sort months ascending, exclude current month from historical average
  const historicalMonths = Object.keys(byMonth)
    .filter(ym => ym < currentYM)
    .sort();

  const months = historicalMonths.slice(-6); // last 6 completed months

  const confidence: SpendingForecast['confidence'] =
    months.length >= 4 ? 'high' : months.length >= 2 ? 'medium' : 'low';
  const confidenceReason =
    months.length === 0
      ? 'No historical data — add more transactions for forecasts'
      : months.length < 2
        ? 'Only 1 month of history — predictions improve with more data'
        : months.length < 4
          ? `Based on ${months.length} months of data`
          : `Based on ${months.length} months of data — high confidence`;

  // Weighted average (last month = 3x, second to last = 2x, rest = 1x)
  const weights = months.map((_, i) => {
    const fromEnd = months.length - 1 - i;
    if (fromEnd === 0) return 3;
    if (fromEnd === 1) return 2;
    return 1;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

  // Per-category weighted averages
  const allCategories = new Set<string>();
  const catTotals: Record<string, number[]> = {};

  for (const ym of months) {
    const txs = byMonth[ym] || [];
    const catSpend: Record<string, number> = {};
    for (const tx of txs) {
      if (tx.type !== 'debit') continue;
      catSpend[tx.category] = (catSpend[tx.category] || 0) + tx.amount;
      allCategories.add(tx.category);
    }
    for (const cat of allCategories) {
      if (!catTotals[cat]) catTotals[cat] = [];
      catTotals[cat].push(catSpend[cat] || 0);
    }
  }

  // Pad shorter arrays with 0
  for (const cat of allCategories) {
    while (catTotals[cat].length < months.length) {
      catTotals[cat].unshift(0);
    }
  }

  // Build category forecasts
  const lastMonthYM = months[months.length - 1];
  const lastMonthTxs = lastMonthYM ? byMonth[lastMonthYM] || [] : [];
  const lastMonthCatSpend: Record<string, number> = {};
  for (const tx of lastMonthTxs) {
    if (tx.type !== 'debit') continue;
    lastMonthCatSpend[tx.category] = (lastMonthCatSpend[tx.category] || 0) + tx.amount;
  }

  const categoryForecasts: CategoryForecast[] = [];
  let predictedTotal = 0;

  for (const cat of allCategories) {
    const vals = catTotals[cat];
    const avgMonthly = vals.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
    const lastMonth = lastMonthCatSpend[cat] || 0;
    const predicted = Math.round(avgMonthly);
    const trendPct = lastMonth > 0 ? ((predicted - lastMonth) / lastMonth) * 100 : 0;
    const trend: 'up' | 'down' | 'stable' =
      Math.abs(trendPct) < 5 ? 'stable' : trendPct > 0 ? 'up' : 'down';

    categoryForecasts.push({
      category: cat as Category,
      avgMonthly: Math.round(avgMonthly),
      lastMonth: Math.round(lastMonth),
      predicted,
      trend,
      trendPct: Math.round(trendPct),
    });
    predictedTotal += predicted;
  }

  // Sort by predicted spend descending
  categoryForecasts.sort((a, b) => b.predicted - a.predicted);

  // Income forecast from historical credit months
  const incomeByMonth = months.map(ym => {
    return (byMonth[ym] || [])
      .filter(tx => tx.type === 'credit')
      .reduce((s, tx) => s + tx.amount, 0);
  });
  const predictedIncome = Math.round(
    incomeByMonth.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight
  );

  // Current month spending (so far)
  const currentMonthTxs = byMonth[currentYM] || [];
  const spentSoFar = currentMonthTxs
    .filter(tx => tx.type === 'debit')
    .reduce((s, tx) => s + tx.amount, 0);

  // Run-rate: if we continue spending at current pace (with minimum telemetry guard of 5 days)
  const MIN_DAYS = 5;
  let runRate: number;
  let finalConfidence = confidence;
  let finalConfidenceReason = confidenceReason;

  if (daysElapsed >= MIN_DAYS) {
    const dailyRate = spentSoFar / daysElapsed;
    runRate = Math.round(dailyRate * totalDaysInMonth);
  } else {
    // Graceful fallback to predicted total if historical data is available, otherwise simple projection
    runRate =
      months.length > 0
        ? predictedTotal
        : Math.round(spentSoFar * (totalDaysInMonth / Math.max(1, daysElapsed)));
    finalConfidence = 'low';
    finalConfidenceReason =
      'Early in the month — confidence will increase after the 5th day when active telemetry stabilizes.';
  }

  const predictedSavings = predictedIncome - (months.length > 0 ? predictedTotal : runRate);

  return {
    predictedTotal,
    predictedIncome,
    predictedSavings,
    categoryForecasts,
    confidence: finalConfidence,
    confidenceReason: finalConfidenceReason,
    daysRemaining,
    spentSoFar: Math.round(spentSoFar),
    runRate,
  };
}
