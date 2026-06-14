import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

interface LinkingQRModalProps {
  show: boolean;
  onClose: () => void;
}

export function LinkingQRModal({ show, onClose }: LinkingQRModalProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (!show) return;
    
    // Defer the state updates to avoid synchronous cascading renders
    const timeoutId = setTimeout(() => {
      setTimestamp(Date.now());
      setTimeLeft(300);
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Regenerate QR
          setTimestamp(Date.now());
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeoutId);
    };
  }, [show]);

  if (!show || !user) return null;

  const linkData = JSON.stringify({
    type: 'spendwise_child_link',
    parentId: user.id,
    timestamp: timestamp,
  });

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-card)] rounded-2xl p-8 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">📱 Link Child Device</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Open SpendWise on your child's phone and scan this QR
        </p>
        <div className="mx-auto mb-6 flex justify-center bg-white p-4 rounded-xl inline-block">
          <QRCodeSVG value={linkData} size={200} />
        </div>
        <p className="text-xs text-[var(--text-muted)]">QR expires in {formattedTime}</p>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-xl bg-[var(--teal)] text-white font-bold text-sm hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}
