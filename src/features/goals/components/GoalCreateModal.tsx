import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Err } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { GOAL_EMOJIS, GOAL_COLORS } from '@/features/shared/components/sharedConstants';

export function GoalCreateModal({
  show,
  onClose,
  onSubmit,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (p: {
    name: string;
    emoji: string;
    targetAmount: number;
    targetDate: string;
    color: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [target, setTgt] = useState('');
  const [date, setDate] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = parseFloat(target);
    if (!name.trim()) {
      setErr('Enter a goal name.');
      return;
    }
    if (!t || t <= 0) {
      setErr('Enter a valid target amount.');
      return;
    }
    if (!date) {
      setErr('Select a target date.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit({ name: name.trim(), emoji, targetAmount: t, targetDate: date, color });
      setName('');
      setTgt('');
      setDate('');
      onClose();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Failed to create goal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onClose={onClose} title="🎯 New Group Goal">
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Goal Name">
          <Inp
            placeholder="e.g. Goa Trip Fund"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Emoji
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {GOAL_EMOJIS.map(e => (
                <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Color
            </span>
            <div className="flex gap-1.5 flex-wrap mt-0.5">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-[26px] h-[26px] rounded-full cursor-pointer"
                  style={{
                    background: c,
                    border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`,
                  }} /* tailwind-migration:skip */
                />
              ))}
            </div>
          </div>
        </div>
        <Field label="Target Amount">
          <Inp
            type="number"
            min="1"
            placeholder="50000"
            value={target}
            onChange={e => setTgt(e.target.value)}
          />
        </Field>
        <Field label="Target Date">
          <Inp type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim() || !target || !date}>
          {busy ? (
            <>
              <Ico.Spin /> Creating…
            </>
          ) : (
            '🚀 Create Goal'
          )}
        </Btn>
      </form>
    </Modal>
  );
}
