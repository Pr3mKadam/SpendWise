import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';

export function ExportModal({
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
  if (!show) return null;
  return (
    <Modal show={show} onClose={onClose} title={`Join "${groupName}"`}>
      <div className="text-center pb-4">
        <p className="text-sm text-[var(--text-secondary)] mb-6">Scan to join this shared wallet</p>
        <div className="flex justify-center mx-auto mb-6 bg-[var(--surface-card)] p-4 rounded-xl inline-block">
          <QRCodeSVG value={groupData} size={180} className="max-w-full h-auto" />
        </div>
        <Btn full v="primary" onClick={onClose}>
          Done
        </Btn>
      </div>
    </Modal>
  );
}
