import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Err, Ok } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { MEMBER_EMOJIS } from '../sharedConstants';

export function InviteModal({
  show,
  onClose,
  onSubmit,
  groupName,
  groupId,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string, emoji: string) => Promise<void>;
  groupName?: string;
  groupId?: string;
}) {
  const [email, setEmail] = useState('');
  const [dname, setDname] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  function reset() {
    setEmail('');
    setDname('');
    setEmoji('😊');
    setErr('');
    setOk('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setErr('Enter an email address.');
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setErr('Enter a valid email address (e.g., friend@gmail.com).');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit(email.trim(), dname.trim() || email.split('@')[0], emoji);

      // Mailto fallback
      if (groupName && groupId) {
        const subject = encodeURIComponent(`Join my SpendWise group: ${groupName}`);
        const body = encodeURIComponent(
          `Hi!\n\nI'd like you to join my shared wallet "${groupName}" on SpendWise.\n\n` +
            `Open SpendWise and enter this Group ID to join: ${groupId}\n\n` +
            `SpendWise — Smart Finance Tracker`
        );
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
      }

      setOk(`Invite sent to ${email.split('@')[0]}! They'll see it when they log in.`);
      setTimeout(() => {
        reset();
        onClose();
      }, 2000);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ex: any
    ) {
      setErr(ex?.message ?? 'Failed to send invite.');
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
      title="📨 Invite a Member"
    >
      <form onSubmit={submit}>
        <Err msg={err} />
        <Ok msg={ok} />
        {!ok && (
          <>
            <Field label="Email Address">
              <Inp
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Display Name (optional)">
              <Inp
                placeholder="e.g. Rahul"
                value={dname}
                onChange={e => setDname(e.target.value)}
              />
            </Field>
            <Field label="Their Avatar">
              <div className="flex gap-1.5 flex-wrap">
                {MEMBER_EMOJIS.map(e => (
                  <EmojiBtn key={e} e={e} active={emoji === e} onPick={setEmoji} />
                ))}
              </div>
            </Field>
            <Btn full v="primary" type="submit" disabled={busy || !email.trim()}>
              {busy ? (
                <>
                  <Ico.Spin /> Sending…
                </>
              ) : (
                <>
                  <Ico.Mail /> Send Invite
                </>
              )}
            </Btn>
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  if (!window.location) return;
                  const inviteLink = `https://spendwise.app/join?group=${groupId || ''}`;
                  navigator.clipboard.writeText(inviteLink);
                  setOk('Invite link copied!');
                  setTimeout(() => setOk(''), 2000);
                }}
                className="bg-transparent border-none cursor-pointer text-[var(--teal)] font-bold text-sm hover:underline"
              >
                📋 Copy Invite Link
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
