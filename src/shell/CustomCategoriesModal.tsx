import { useState } from 'react';
import { X, Plus, Trash2, Edit3, Tag as TagIcon } from 'lucide-react';
import { CustomCategoryDef, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { formatLocalYYYYMMDD } from '@/utils/date';

interface CustomCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: CustomCategoryDef[];
  onAdd: (def: Omit<CustomCategoryDef, 'id'>) => void;
  onUpdate: (id: string, def: Partial<CustomCategoryDef>) => void;
  onDelete: (id: string) => void;
  transactions?: Transaction[];
  onReassign?: (oldCategoryName: string, newCategoryName: string) => void;
}

const EMOJI_OPTIONS = ['🛍️', '🍔', '✈️', '🎮', '🚗', '💡', '🏥', '💰', '🐶', '📚', '☕', '🎫', '🍷', '🛠️', '🎓'];
const COLOR_OPTIONS = [
  '#f43f5e', // Rose
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#10b981', // Emerald
  '#22c55e', // Green
  '#eab308', // Yellow
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#64748b', // Slate
];

export default function CustomCategoriesModal({
  isOpen, onClose, customCategories, onAdd, onUpdate, onDelete, transactions = [], onReassign
}: CustomCategoriesModalProps) {
  const { allCategories, mergedIcons, suggestedCategories, addCustomCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reassigningCat, setReassigningCat] = useState<CustomCategoryDef | null>(null);
  const [selectedFallback, setSelectedFallback] = useState<string>('Other');
  
  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🛍️');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId('new');
    setName('');
    setIcon(EMOJI_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setMonthlyLimit('');
  };

  const handleStartEdit = (cat: CustomCategoryDef) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setMonthlyLimit(cat.monthlyLimit?.toString() || '');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    const limit = monthlyLimit ? parseFloat(monthlyLimit) : undefined;
    
    if (editingId === 'new') {
      onAdd({ name: name.trim(), icon, color, monthlyLimit: limit });
    } else if (editingId) {
      onUpdate(editingId, { name: name.trim(), icon, color, monthlyLimit: limit });
    }
    setEditingId(null);
  };

  const handleDeleteAttempt = (cat: CustomCategoryDef) => {
    // Check if any transactions exist for this category
    const usedCount = transactions.filter(t => t.category === cat.name).length;
    if (usedCount > 0 && onReassign) {
      setReassigningCat(cat);
      // Auto-select first available alternative category
      const fallback = allCategories.find(c => c !== cat.name) || 'Other';
      setSelectedFallback(fallback);
    } else {
      onDelete(cat.id);
    }
  };

  const handleConfirmReassign = () => {
    if (!reassigningCat) return;
    if (onReassign) onReassign(reassigningCat.name, selectedFallback);
    onDelete(reassigningCat.id);
    setReassigningCat(null);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-scale-in w-full flex flex-col"
        style={{ maxWidth: '440px', background: 'var(--surface-card)', borderRadius: '20px', boxShadow: 'var(--shadow-modal)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1.5px solid #f0f2f5', flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <TagIcon size={18} style={{ color: 'var(--teal)' }} />
            <h2 style={{ fontFamily: 'var(--font-manrope)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Custom Categories
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {reassigningCat ? (
            // REASSIGNMENT VIEW
            <div className="space-y-5 animate-fade-in-up">
              <div className="text-center">
                <div className="w-14 h-14 bg-[var(--red-dim)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={24} className="text-[var(--red)]" />
                </div>
                <h3 className="text-title" style={{ fontFamily: 'var(--font-manrope)' }}>Category in Use</h3>
                <p className="text-body mt-2">
                  You have <strong className="text-[var(--text-primary)]">{transactions.filter(t => t.category === reassigningCat.name).length}</strong> transaction(s) categorized as <strong>"{reassigningCat.name}"</strong>.
                  Before deleting this category, please select a new category for these transactions.
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">Move transactions to...</label>
                <select
                  value={selectedFallback}
                  onChange={e => setSelectedFallback(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-sm font-medium focus:outline-none transition-all"
                  style={{ background: 'var(--surface-input)', border: '2px solid transparent', color: 'var(--text-primary)' }}
                  onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
                  onBlur={e => { e.target.style.border = '2px solid transparent'; }}
                >
                  {allCategories.filter(c => c !== reassigningCat.name).map(c => (
                    <option key={c} value={c}>{mergedIcons[c] || '📦'} {c}</option>
                  ))}
                  {!allCategories.includes('Other') && (
                    <option value="Other">📦 Other</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setReassigningCat(null)} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors bg-[#f5f7fa] dark:bg-[var(--surface-input)] text-[var(--text-secondary)]">
                  Cancel
                </button>
                <button onClick={handleConfirmReassign} className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all bg-[var(--red)] border-none cursor-pointer">
                  Move & Delete
                </button>
              </div>
            </div>
          ) : !editingId ? (
            // LIST VIEW
            <div>
              {customCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    You haven't added any custom categories yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {customCategories.map(cat => (
                    <div key={cat.id} className="p-3 rounded-xl card-hover border border-[var(--surface-border)]" style={{ background: 'var(--surface-card)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex w-10 h-10 items-center justify-center rounded-xl text-lg shrink-0" style={{ background: `${cat.color}15` }}>
                            {cat.icon}
                          </span>
                          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {cat.monthlyLimit && (
                            <span className="px-2 py-1 rounded-lg bg-[var(--surface-submerged)] border border-[var(--surface-border)] text-[length:var(--fs-overline)] font-bold text-[var(--text-primary)]">
                              ${cat.monthlyLimit}
                            </span>
                          )}
                          <button onClick={() => handleStartEdit(cat)} className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteAttempt(cat)} className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {cat.monthlyLimit && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-[var(--surface-submerged)] rounded-full overflow-hidden">
                            {(() => {
                              const spent = transactions
                                .filter(t => t.category === cat.name && t.type === 'debit' && t.date.startsWith(formatLocalYYYYMMDD().substring(0, 7)))
                                .reduce((s, t) => s + t.amount, 0);
                              const pct = Math.min(100, (spent / cat.monthlyLimit) * 100);
                              return (
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${spent > cat.monthlyLimit ? 'bg-red-500' : 'bg-[var(--teal)]'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <button onClick={handleStartAdd} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1.5px dashed var(--teal-glow)', cursor: 'pointer' }}>
                <Plus size={16} /> Create New Category
              </button>
            </div>
          ) : (
            // EDIT VIEW
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Travel, Pets..."
                  autoFocus
                  className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                  style={{ background: 'var(--surface-input)', border: '2px solid transparent', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
                  onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
                  onBlur={e => { e.target.style.border = '2px solid transparent'; }}
                />

                {editingId === 'new' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Suggested for your Role
                      </p>
                      {suggestedCategories.filter(c => !allCategories.includes(c)).length > 1 && (
                        <button 
                          onClick={() => {
                            suggestedCategories.filter(c => !allCategories.includes(c)).forEach(sug => {
                              onAdd({
                                name: sug,
                                icon: '🏷️',
                                color: '#14b8a6', // Default teal
                                monthlyLimit: 0
                              });
                            });
                          }}
                          className="text-[length:var(--fs-overline)] font-bold text-[var(--teal)] hover:underline"
                        >
                          Add All
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedCategories.filter(c => !allCategories.includes(c)).map(sug => (
                        <button
                          key={sug}
                          onClick={() => setName(sug)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal-glow)] hover:scale-105 transition-transform"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Choose Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setIcon(em)}
                      className="w-10 h-10 text-lg flex items-center justify-center rounded-xl transition-all"
                      style={{
                        background: icon === em ? 'var(--teal-dim)' : 'var(--surface-input)',
                        border: icon === em ? '2px solid var(--teal)' : '2px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Choose Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(col => (
                    <button
                      key={col}
                      onClick={() => setColor(col)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
                      style={{
                        background: col,
                        border: 'none',
                        cursor: 'pointer',
                        transform: color === col ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: color === col ? `0 0 0 2px var(--surface-card), 0 0 0 4px ${col}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Monthly Spending Limit (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">$</span>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={e => setMonthlyLimit(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--surface-input)', border: '2px solid transparent', fontFamily: 'var(--font-inter)', color: 'var(--text-primary)' }}
                    onFocus={e => { e.target.style.border = '2px solid var(--teal)'; }}
                    onBlur={e => { e.target.style.border = '2px solid transparent'; }}
                  />
                </div>
                <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] mt-2 italic">
                  Leave empty for no limit. This helps SpendWise track your budget health.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-colors" style={{ background: '#f5f7fa', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50" style={{ background: 'var(--teal)', border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
                  {editingId === 'new' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
