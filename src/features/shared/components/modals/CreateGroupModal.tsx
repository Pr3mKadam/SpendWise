import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { MEMBER_EMOJIS } from '../sharedConstants';

export function CreateGroupModal({
  show,
  onClose,
  onSubmit,
  userName,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (name: string, purpose: string, emoji: string) => Promise<void>;
  userName: string;
}) {
  const [name, setName] = useState('');
  const [purpose, setPur] = useState('friends');
  const [emoji, setEmoji] = useState('👑');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function reset() {
    setName('');
    setPur('friends');
    setEmoji('👑');
    setErr('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr('Please enter a group name.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit(name.trim(), purpose, emoji);
      reset();
      onClose();
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to create group — please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      show={show}
      onClose={() => {
        reset();
        onClose();
      }}
      title="✨ Create a Group"
    >
      <form onSubmit={submit}>
        <Err msg={err} />
        <Field label="Group Name">
          <Inp
            placeholder="e.g. Goa Trip 2025"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Purpose">
          <Sel value={purpose} onChange={e => setPur(e.target.value)}>
            <option value="friends">🎉 Friends</option>
            <option value="roommates">🏠 Roommates</option>
            <option value="family">👨‍👩‍👧 Family</option>
            <option value="other">🤝 Other</option>
          </Sel>
        </Field>
        <Field label="Your Avatar">
          <div className="flex gap-1.5 flex-wrap">
            {MEMBER_EMOJIS.map(e => (
              <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
            ))}
          </div>
        </Field>
        <p className="text-[0.8rem] text-[var(--text-secondary)] -mt-1 mb-4 leading-normal">
          You'll be added as <strong className="text-[var(--text)]">{userName}</strong> {emoji}
        </p>
        <Btn full v="primary" type="submit" disabled={busy || !name.trim()}>
          {busy ? (
            <>
              <Ico.Spin /> Creating…
            </>
          ) : (
            '🚀 Create Group'
          )}
        </Btn>
      </form>
    </Modal>
  );
}

// TODO: consolidate with sharedModals/GroupQRModal.tsx - duplicate logic (window.QRCode vs qrcode.react)
