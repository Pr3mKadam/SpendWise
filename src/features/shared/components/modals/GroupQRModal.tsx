import React, { useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';

export function GroupQRModal({
  groupData,
  groupName,
  show,
  onClose,
}: {
  groupData: string;
  groupName: string;
  show: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !ref.current || !groupData) return;
    ref.current.innerHTML = '';

    try {
      // @ts-expect-error QRCode types not installed
      new window.QRCode(ref.current, { text: groupData, width: 180, height: 180 });
    } catch (e) {
      console.error('Failed to generate QR:', e);
    }
  }, [show, groupData]);

  if (!show) return null;
  return (
    <Modal show={show} onClose={onClose} title={`Join "${groupName}"`}>
      <div className="text-center pb-4">
        <p className="text-sm text-[var(--text-secondary)] mb-6">Scan to join this shared wallet</p>
        <div
          ref={ref}
          className="flex justify-center mx-auto mb-6 bg-[var(--surface-card)] p-4 rounded-xl inline-block"
        />
        <Btn full v="primary" onClick={onClose}>
          Done
        </Btn>
      </div>
    </Modal>
  );
}
