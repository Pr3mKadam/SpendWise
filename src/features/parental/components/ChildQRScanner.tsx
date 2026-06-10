import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface ChildQRScannerProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (parentId: string) => void;
}

export function ChildQRScanner({ show, onClose, onSuccess }: ChildQRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrcodeScannerRef = useRef<any>(null);

  useEffect(() => {
    if (!show || !scannerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).Html5QrcodeScanner) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scanner = new (window as any).Html5QrcodeScanner(
        'child-qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.type === 'spendwise_child_link' && data.parentId) {
              scanner.clear();
              onSuccess(data.parentId);
            } else {
              setError('Invalid QR code format. Please scan a SpendWise Parent QR.');
            }
          } catch (_e) {
            setError('Could not read QR code. Please try again.');
          }
        },
        (_errorMessage: string) => {
          // ignore scan errors (they happen every frame)
        }
      );
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('QR Scanner library failed to load.');
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [show, onSuccess]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-card)] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--teal)]" />
            <h3 className="font-bold text-[var(--text-primary)]">Scan Parent QR</h3>
          </div>
          <button
            onClick={() => {
              if (html5QrcodeScannerRef.current) {
                html5QrcodeScannerRef.current.clear().catch(console.error);
              }
              onClose();
            }}
            className="p-1 hover:bg-[var(--surface-input)] rounded-lg text-[var(--text-muted)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <div
            id="child-qr-reader"
            ref={scannerRef}
            className="w-full rounded-xl overflow-hidden border-2 border-[var(--border)]"
          />

          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            Point your camera at the QR code on your parent's device to link your account.
          </p>
        </div>
      </div>
    </div>
  );
}
