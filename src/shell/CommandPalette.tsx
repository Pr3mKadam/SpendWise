import { useState, useEffect, useRef } from 'react';
import { Search, Compass, DollarSign, Activity, FileText, Target, Wallet, RefreshCw, User, PiggyBank, ArrowRight, X } from 'lucide-react';
import { AppView, Transaction } from '@/types';
import Portal from '@/ui/Portal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  transactions: Transaction[];
  currency: string;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, transactions, currency }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const VIEWS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass size={16} />, keywords: 'home start overview stats' },
    { id: 'budget', label: 'Budgets', icon: <DollarSign size={16} />, keywords: 'limit allowance rings' },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={16} />, keywords: 'charts graphs data' },
    { id: 'history', label: 'History', icon: <FileText size={16} />, keywords: 'transactions list export report pdf csv' },
    { id: 'goals', label: 'Savings Goals', icon: <Target size={16} />, keywords: 'vault piggy stash target' },
    { id: 'shared', label: 'Shared Wallets', icon: <Wallet size={16} />, keywords: 'group roommates split expense' },
    { id: 'sync', label: 'Bank Sync', icon: <RefreshCw size={16} />, keywords: 'upi phonepe gpay offline csv' },
    { id: 'profile', label: 'Profile', icon: <User size={16} />, keywords: 'account name pin parental' },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Activity size={16} />, keywords: 'recurring monthly fixed netflix' },
    { id: 'portfolio', label: 'Portfolio', icon: <PiggyBank size={16} />, keywords: 'net worth assets crypto stocks' },
  ];

  // Filter Views
  const lowerQuery = query.toLowerCase();
  const matchedViews = query ? VIEWS.filter(v => 
    v.label.toLowerCase().includes(lowerQuery) || 
    v.keywords.includes(lowerQuery)
  ) : VIEWS;

  // Filter Transactions (max 5)
  const matchedTx = query ? transactions.filter(t => 
    t.merchant.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery) ||
    (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
    (t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  ).slice(0, 5) : [];

  const totalResults = matchedViews.length + matchedTx.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(totalResults, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (totalResults === 0) return;
        if (selectedIndex < matchedViews.length) {
          onNavigate(matchedViews[selectedIndex].id as AppView);
          onClose();
        } else {
          // If selected transaction, navigate to history (or we could open edit modal if we had one)
          onNavigate('history');
          onClose(); // In a future iteration, we can deep-link into a history filter.
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, matchedViews, matchedTx, totalResults, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
            <Search size={20} className="text-[var(--text-muted)] mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search views, transactions, or #tags..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-none outline-none font-manrope font-semibold text-[15px] sm:text-[17px] text-[var(--text-primary)]"
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--surface-input)] text-[var(--text-muted)] cursor-pointer bg-transparent border-none">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto py-2">
            {totalResults === 0 && (
              <div className="px-6 py-8 text-center text-[var(--text-muted)] font-inter text-sm">
                No results found for "{query}"
              </div>
            )}

            {matchedViews.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] uppercase tracking-wider font-inter">
                  Navigation
                </div>
                {matchedViews.map((view, i) => {
                  const isSelected = selectedIndex === i;
                  return (
                    <div
                      key={view.id}
                      onMouseEnter={() => setSelectedIndex(i)}
                      onClick={() => { onNavigate(view.id as AppView); onClose(); }}
                      className="mx-2 px-3 py-2.5 flex items-center justify-between rounded-xl cursor-pointer transition-colors"
                      style={{ background: isSelected ? 'var(--surface-input)' : 'transparent', color: isSelected ? 'var(--teal)' : 'var(--text-primary)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color: isSelected ? 'var(--teal)' : 'var(--text-muted)' }}>{view.icon}</span>
                        <span className="font-inter text-[14px] font-medium">{view.label}</span>
                      </div>
                      {isSelected && <ArrowRight size={16} />}
                    </div>
                  );
                })}
              </div>
            )}

            {matchedTx.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[length:var(--fs-caption)] font-bold text-[var(--text-muted)] uppercase tracking-wider font-inter border-t border-[var(--border)]">
                  Transactions
                </div>
                {matchedTx.map((tx, i) => {
                  const absoluteIndex = matchedViews.length + i;
                  const isSelected = selectedIndex === absoluteIndex;
                  return (
                    <div
                      key={tx.id}
                      onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                      onClick={() => { onNavigate('history'); onClose(); }}
                      className="mx-2 px-3 py-2.5 flex items-center justify-between rounded-xl cursor-pointer transition-colors"
                      style={{ background: isSelected ? 'var(--surface-input)' : 'transparent' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: tx.type === 'credit' ? 'var(--green-dim)' : 'var(--surface-card)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '14px' }}>{tx.type === 'credit' ? '💵' : '🛒'}</span>
                        </div>
                        <div>
                          <p className="font-inter font-semibold text-[13px] text-[var(--text-primary)] leading-tight">{tx.merchant}</p>
                          <p className="font-inter text-[length:var(--fs-caption)] text-[var(--text-muted)]">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-inter font-semibold text-[13px]" style={{ color: tx.type === 'credit' ? 'var(--green)' : 'var(--text-primary)' }}>
                        {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-input)] flex items-center gap-4 text-[length:var(--fs-caption)] text-[var(--text-muted)] font-inter">
            <span className="flex items-center gap-1"><kbd className="bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm">↑</kbd> <kbd className="bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm font-sans">↵</kbd> to select</span>
            <span className="flex items-center gap-1"><kbd className="bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm">esc</kbd> to dismiss</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}

