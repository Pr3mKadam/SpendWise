import { useState } from 'react';
import { Target, X } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { GOAL_EMOJIS, GOAL_COLORS } from '@/features/goals/components/constants';

export interface GoalFormData {
  name: string;
  emoji: string;
  targetAmount: string;
  savedAmount: string;
  targetDate: string;
  monthlyContribution: string;
  color: string;
}

function defaultForm(): GoalFormData {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return {
    name: '',
    emoji: '🎯',
    targetAmount: '',
    savedAmount: '0',
    targetDate: d.toISOString().split('T')[0],
    monthlyContribution: '',
    color: '#10b981',
  };
}

export function GoalModal({
  initial,
  onSave,
  onClose,
  currency,
}: {
  initial?: Partial<GoalFormData>;
  onSave: (data: GoalFormData) => void;
  onClose: () => void;
  currency: string;
}) {
  const [form, setForm] = useState<GoalFormData>({ ...defaultForm(), ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  const set = (key: keyof GoalFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Goal name is required';
    if (!form.targetAmount || Number(form.targetAmount) <= 0)
      errs.targetAmount = 'Enter a valid target amount';
    if (!form.targetDate) errs.targetDate = 'Select a target date';
    if (!form.monthlyContribution || Number(form.monthlyContribution) < 0)
      errs.monthlyContribution = 'Enter monthly contribution';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={onClose}
        />

        <div className="card relative w-full max-w-md animate-scale-in overflow-hidden rounded-2xl">
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, var(--teal), var(--blue))` }}
          />

          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
                className="flex items-center gap-2"
              >
                <Target size={18} style={{ color: 'var(--teal)' }} />
                {initial ? 'Edit Goal' : 'New Savings Goal'}
              </h3>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Icon
                  </label>
                  <div
                    className="flex flex-wrap w-28 gap-1 rounded-xl p-1.5"
                    style={{ background: '#f5f7fa' }}
                  >
                    {GOAL_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        className="h-7 w-7 rounded-lg text-sm transition-all hover:bg-[var(--surface-card)]"
                        style={{
                          background: form.emoji === e ? 'var(--surface-card)' : 'transparent',
                          boxShadow: form.emoji === e ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Emergency Fund"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      background: '#f5f7fa',
                      border: '1.5px solid transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--teal)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'transparent';
                    }}
                  />
                  {errors.name && (
                    <p
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: '11px',
                        color: 'var(--red)',
                        marginTop: '4px',
                      }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                >
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: form.color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Target ({currency}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.targetAmount}
                    onChange={set('targetAmount')}
                    placeholder="10000"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      background: '#f5f7fa',
                      border: '1.5px solid transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--teal)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'transparent';
                    }}
                  />
                  {errors.targetAmount && (
                    <p className="mt-1 text-[length:var(--fs-overline)] text-red-400">
                      {errors.targetAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Already Saved ({currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.savedAmount}
                    onChange={set('savedAmount')}
                    placeholder="0"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      background: '#f5f7fa',
                      border: '1.5px solid transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--teal)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'transparent';
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={set('targetDate')}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      background: '#f5f7fa',
                      border: '1.5px solid transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--teal)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'transparent';
                    }}
                  />
                  {errors.targetDate && (
                    <p className="mt-1 text-[length:var(--fs-overline)] text-red-400">
                      {errors.targetDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="mb-1.5 block text-[length:var(--fs-overline)] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Monthly ({currency}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.monthlyContribution}
                    onChange={set('monthlyContribution')}
                    placeholder="500"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      background: '#f5f7fa',
                      border: '1.5px solid transparent',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--teal)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'transparent';
                    }}
                  />
                  {errors.monthlyContribution && (
                    <p
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: '11px',
                        color: 'var(--red)',
                        marginTop: '4px',
                      }}
                    >
                      {errors.monthlyContribution}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: '#f5f7fa',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-inter)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{
                  background: 'var(--teal)',
                  fontFamily: 'var(--font-inter)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Target size={15} />
                {initial ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
