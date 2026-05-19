import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { CategorySpend, Transaction } from '@/types';
import { haptic } from '@/lib/haptic';
import { useCategories } from '@/hooks/useCategories';

interface CategoryAnalyzerProps {
  categorySpending: CategorySpend[];
  transactions: Transaction[];
  currency: string;
  userRole?: string;
}

export function CategoryAnalyzer({ categorySpending, transactions, currency, userRole }: CategoryAnalyzerProps) {
  const { categoryLimits } = useCategories();
  const insights = useMemo(() => {
    if (categorySpending.length === 0) return [];
    
    const list: { title: string; desc: string; type: 'positive' | 'warning' | 'insight'; icon: any }[] = [];

    // 1. Identify Highest Spending
    const top = [...categorySpending].sort((a, b) => b.value - a.value)[0];
    if (top) {
      list.push({
        title: `Dominant Spending: ${top.name}`,
        desc: `You spent ${currency}${top.value.toLocaleString()} here this month (${top.percent}% of total).`,
        type: 'insight',
        icon: Lightbulb
      });
      
      // Historical Comparison for Top Category
      const now = new Date();
      const last3Months = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (i + 1), 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      });

      const historicalSpend = last3Months.map(month => {
        return transactions
          .filter(t => t.category === top.name && t.type === 'debit' && t.date.startsWith(month))
          .reduce((sum, t) => sum + t.amount, 0);
      });

      const avgHistory = historicalSpend.reduce((a, b) => a + b, 0) / (historicalSpend.filter(v => v > 0).length || 1);
      
      if (top.value > avgHistory * 1.2 && avgHistory > 0) {
        list.push({
          title: 'Unusual Spending Spike',
          desc: `Your ${top.name} spend is 20%+ higher than your usual ${currency}${Math.round(avgHistory).toLocaleString()} average.`,
          type: 'warning',
          icon: TrendingUp
        });
      } else if (top.value < avgHistory * 0.8 && avgHistory > 0) {
        list.push({
          title: 'Saving Master!',
          desc: `Great job! Your ${top.name} spend is 20% lower than your historical average.`,
          type: 'positive',
          icon: TrendingDown
        });
      }
    }

    // 2. Trend Analysis (Simulated for demo, but could be real if we had monthlyHistory)
    // For now, let's look for weekend vs weekday patterns in the top category
    if (top) {
      const topTxs = transactions.filter(t => t.category === top.name);
      const weekendSpend = topTxs.filter(t => {
        const day = new Date(t.date).getDay();
        return day === 0 || day === 6;
      }).reduce((acc, t) => acc + t.amount, 0);
      
      const weekdaySpend = topTxs.reduce((acc, t) => acc + t.amount, 0) - weekendSpend;
      
      if (weekendSpend > weekdaySpend * 0.7) {
        list.push({
          title: 'Weekend Spike detected',
          desc: `Most of your ${top.name} spending happens on weekends. Consider a weekend budget!`,
          type: 'warning',
          icon: AlertCircle
        });
      }
    }

    // 3. Subscription Insight
    const subsCount = transactions.filter(t => t.category === 'Subscriptions').length;
    if (subsCount > 3) {
      list.push({
        title: 'Subscription Audit',
        desc: `You have ${subsCount} active subscriptions. Audit them to reclaim leaked cash flow.`,
        type: 'insight',
        icon: Sparkles
      });
    }

    // 4. Persona Specific Insights
    if (userRole === 'student') {
      const educationSpend = categorySpending.find(c => c.name === 'Education')?.value || 0;
      if (educationSpend === 0) {
        list.push({
          title: 'Student Tip',
          desc: 'No education expenses tracked. Remember to log tuition and book costs for tax credits!',
          type: 'insight',
          icon: Lightbulb
        });
      }
    } else if (userRole === 'business') {
      const opex = categorySpending.find(c => c.name === 'Business')?.value || 0;
      if (opex > 0) {
        list.push({
          title: 'Tax Deduction Alert',
          desc: `Your business expenses (${currency}${opex.toLocaleString()}) are potentially tax-deductible.`,
          type: 'positive',
          icon: TrendingUp
        });
      }
    }
    
    // 5. Category Limits
    Object.entries(categoryLimits).forEach(([cat, limit]) => {
      const spent = transactions
        .filter(t => t.category === cat && t.type === 'debit' && t.date.startsWith(new Date().toISOString().substring(0, 7)))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percent = (spent / limit) * 100;
      if (percent > 100) {
        list.push({
          title: `Limit Exceeded: ${cat}`,
          desc: `You've spent ${currency}${spent.toLocaleString()} in ${cat}, which is ${Math.round(percent - 100)}% over your ${currency}${limit} limit.`,
          type: 'warning',
          icon: AlertCircle
        });
      } else if (percent > 80) {
        list.push({
          title: `Approaching Limit: ${cat}`,
          desc: `You've used ${Math.round(percent)}% of your ${currency}${limit} limit for ${cat}.`,
          type: 'warning',
          icon: TrendingDown
        });
      }
    });

    return list;
  }, [categorySpending, transactions, currency, userRole, categoryLimits]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[var(--teal)]" />
        <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">Category Intelligence</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:shadow-md transition-all group cursor-default"
            onClick={() => haptic.light()}
          >
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                insight.type === 'positive' ? 'bg-teal-500/10 text-teal-500' :
                insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                <insight.icon size={20} />
              </div>
              <div>
                <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--teal)] transition-colors">
                  {insight.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  {insight.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
