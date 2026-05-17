import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

interface LinkingQRModalProps {
  show: boolean;
  onClose: () => void;
}

export function LinkingQRModal({ show, onClose }: LinkingQRModalProps) {
  const { user } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !qrRef.current || !user) return;
    qrRef.current.innerHTML = ''; // Clear previous
    const linkData = JSON.stringify({
      type: 'spendwise_child_link',
      parentId: user.id,
      timestamp: Date.now(),
    });
    
    // Allow script to load if missing
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).QRCode) {
        new (window as any).QRCode(qrRef.current, {
          text: linkData,
          width: 200, height: 200,
          colorDark: '#0f172a', colorLight: '#ffffff',
        });
      }
    }, 100);
  }, [show, user]);

  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}>
      <div className="bg-[var(--surface-card)] rounded-2xl p-8 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">📱 Link Child Device</h3>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Open SpendWise on your child's phone and scan this QR
        </p>
        <div ref={qrRef} className="mx-auto mb-6 flex justify-center" />
        <p className="text-xs text-[var(--text-muted)]">QR expires in 5 minutes</p>
        <button onClick={onClose}
          className="mt-4 px-6 py-2 rounded-xl bg-[var(--teal)] text-white font-bold text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
