import { useCallback, useEffect, useRef, useState } from 'react';

export interface UPITransaction {
  amount: number;
  upiId: string;
  reference: string;
  merchant?: string;
  date?: string;
  raw: string;
}

function parseUPITransaction(sms: string): UPITransaction | null {
  const amountMatch = sms.match(/(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?)/i);
  const refMatch = sms.match(/(?:UPI|txn?)\s*(?:ref|id|no)[:\s]*([A-Z0-9]+)/i);
  const upiMatch = sms.match(/(?:to|from|via)\s+([\w.@_-]+@[\w.]+)/i);

  if (!amountMatch) return null;

  return {
    amount: parseFloat(amountMatch[1]),
    upiId: upiMatch?.[1] ?? '',
    reference: refMatch?.[1] ?? '',
    raw: sms,
  };
}

function isCapacitorAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform()
  );
}

export function useSMSReader() {
  const [listening, setListening] = useState(false);
  const [lastSMS, setLastSMS] = useState<string | null>(null);
  const callbackRef = useRef<((txn: UPITransaction) => void) | null>(null);

  useEffect(() => {
    if (!isCapacitorAvailable()) return;

    let cleanup: (() => void) | undefined;

    const start = async () => {
      try {
        // @ts-expect-error Capacitor plugin not installed
        const { SMSRetriever } = await import('@capacitor-community/sms-retriever');
        const handler = await SMSRetriever.addListener(
          'smsReceived',
          (event: { message: string }) => {
            setLastSMS(event.message);
            const parsed = parseUPITransaction(event.message);
            if (parsed && callbackRef.current) {
              callbackRef.current(parsed);
            }
          }
        );
        cleanup = () => handler.remove();
      } catch {}
    };

    start();

    return () => {
      cleanup?.();
    };
  }, []);

  const startSMSRetriever = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      // @ts-expect-error Capacitor plugin not installed
      const { SMSRetriever } = await import('@capacitor-community/sms-retriever');
      await SMSRetriever.startListening();
      setListening(true);
    } catch {}
  }, []);

  const onSMSReceived = useCallback((callback: (txn: UPITransaction) => void) => {
    callbackRef.current = callback;
  }, []);

  return { startSMSRetriever, onSMSReceived, lastSMS, listening, parseSMS: parseUPITransaction };
}
