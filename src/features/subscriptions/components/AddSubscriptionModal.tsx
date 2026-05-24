import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '@/store';
import { useCategories } from '@/hooks/useCategories';
import { RecurringFrequency, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export default function AddSubscriptionModal({ isOpen, onClose, currency = '$' }: AddSubscriptionModalProps) {
  const addRecurringTransaction = useStore(s => s.addRecurringTransaction);
  const { allCategories } = useCategories();
  
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Subscriptions');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextOccurrence, setNextOccurrence] = useState(() => formatLocalYYYYMMDD());

  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount || !nextOccurrence) return;

    addRecurringTransaction({
      id: `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      merchant,
      amount: parseFloat(amount),
      category,
      frequency,
      lastProcessed: null,
      nextOccurrence,
      isTrial,
      trialEndsAt: isTrial ? trialEndsAt : undefined,
    });
    
    // Reset and close
    setMerchant('');
    setAmount('');
    setCategory('Subscriptions');
    setFrequency('monthly');
    setIsTrial(false);
    setTrialEndsAt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-manrope font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Plus size={18} className="text-teal-500" />
            Add Subscription
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Netflix, Gym"
              className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isTrial"
              checked={isTrial}
              onChange={(e) => setIsTrial(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isTrial" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This is a free trial
            </label>
          </div>

          {isTrial && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Trial Ends At
              </label>
              <input
                type="date"
                value={trialEndsAt}
                onChange={(e) => setTrialEndsAt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
                required={isTrial}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category as string}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
              >
                {allCategories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Next Billing Date
              </label>
              <input
                type="date"
                value={nextOccurrence}
                onChange={(e) => setNextOccurrence(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/50"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl py-3.5 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
