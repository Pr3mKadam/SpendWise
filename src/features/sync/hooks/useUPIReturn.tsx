/* eslint-disable react-refresh/only-export-components */
/**
 * useUPIReturn Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Detects when the user returns from a UPI payment app and processes the result.
 *
 * Detection strategy (multi-layered):
 * 1. On mount: Check current URL for UPI return params
 * 2. On `visibilitychange`: App resumes — check pending payment, ask user
 * 3. On `pageshow` (bfcache restore): Same as above
 */

import React, { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  parseUPIReturnParams,
  getPendingUPIPayment,
  clearPendingUPIPayment,
  upiResultToTransaction,
  UPIPaymentResult,
  PendingUPIPayment,
} from '@/utils/upiPayment';
import { Transaction } from '@/types';

interface UseUPIReturnOptions {
  onTransactionAdded: (txs: Transaction[]) => void;
  onPaymentDetected?: (result: UPIPaymentResult) => void;
}

function cleanURLParams() {
  const url = new URL(window.location.href);
  [
    'upi_status',
    'upi_tr',
    'upi_pa',
    'upi_pn',
    'upi_am',
    'upi_tn',
    'Status',
    'txnId',
    'txnRef',
    'responseCode',
    'ApprovalRefNo',
  ].forEach(k => url.searchParams.delete(k));
  window.history.replaceState({}, '', url.toString());
}

async function addUPITransaction(
  result: UPIPaymentResult,
  onTransactionAdded: (txs: Transaction[]) => void
) {
  const loadId = toast.loading('🧠 AI is categorising your UPI payment...');
  try {
    const tx = await upiResultToTransaction(result);
    onTransactionAdded([tx]);
    toast.success(
      `✅ ₹${result.amount.toFixed(0)} to ${result.pn || 'Merchant'} added to SpendWise!`,
      {
        id: loadId,
        duration: 6000,
      }
    );
  } catch {
    toast.error('Could not categorise payment. Please add manually.', { id: loadId });
  }
}

let confirmToastId: string | null = null;

function UPIConfirmToast({
  t,
  pending,
  onTransactionAdded,
}: {
  t: { id: string };
  pending: PendingUPIPayment;
  onTransactionAdded: (txs: Transaction[]) => void;
}) {
  const name = pending.pn || pending.pa.split('@')[0] || 'Merchant';

  const handleYes = async () => {
    toast.dismiss(t.id);
    confirmToastId = null;
    clearPendingUPIPayment();
    await addUPITransaction(
      {
        status: 'SUCCESS',
        transactionId: `upi_confirm_${Date.now()}`,
        transactionRef: pending.tr,
        responseCode: '00',
        amount: pending.am,
        pa: pending.pa,
        pn: pending.pn,
        tn: pending.tn,
      },
      onTransactionAdded
    );
  };

  const handleNo = () => {
    toast.dismiss(t.id);
    confirmToastId = null;
    clearPendingUPIPayment();
    toast.error('Payment not recorded.', { duration: 3000 });
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: '240px' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>💸 UPI Payment Detected</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
        ₹{pending.am.toFixed(0)} to {name} — did it succeed?
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleYes}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 10,
            border: 'none',
            background: '#14b8a6',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ✅ Yes, add
        </button>
        <button
          onClick={handleNo}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 10,
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ❌ Failed
        </button>
      </div>
    </div>
  );
}

function showUPIConfirmToast(
  pending: PendingUPIPayment,
  onTransactionAdded: (txs: Transaction[]) => void
) {
  if (confirmToastId) {
    toast.dismiss(confirmToastId);
    confirmToastId = null;
  }

  confirmToastId = toast(
    t => <UPIConfirmToast t={t} pending={pending} onTransactionAdded={onTransactionAdded} />,
    { duration: Infinity, style: { maxWidth: 340, padding: '16px' } }
  );

  setTimeout(() => {
    if (confirmToastId) {
      toast.dismiss(confirmToastId);
      confirmToastId = null;
      clearPendingUPIPayment();
    }
  }, 120_000);
}

export function useUPIReturn({ onTransactionAdded, onPaymentDetected }: UseUPIReturnOptions) {
  const processingRef = useRef(false);

  const handleUPIReturn = useCallback(
    async (result: UPIPaymentResult) => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const pending = getPendingUPIPayment();
        const enriched: UPIPaymentResult = {
          ...result,
          amount: result.amount || pending?.am || 0,
          pa: result.pa || pending?.pa || '',
          pn: result.pn || pending?.pn || '',
          tn: result.tn || pending?.tn || '',
        };

        cleanURLParams();

        if (enriched.status === 'SUCCESS' || enriched.status === 'SUBMITTED') {
          clearPendingUPIPayment();
          onPaymentDetected?.(enriched);
          if (enriched.amount > 0) {
            await addUPITransaction(enriched, onTransactionAdded);
          } else {
            toast.success('💸 UPI payment returned. Verify your transaction history.', {
              duration: 5000,
            });
          }
        } else if (enriched.status === 'FAILURE') {
          clearPendingUPIPayment();
          toast.error('❌ UPI payment was not completed.', { duration: 4000 });
        }
      } finally {
        processingRef.current = false;
      }
    },
    [onTransactionAdded, onPaymentDetected]
  );

  // Strategy 1: URL params on mount (immediate redirect return from UPI app)
  useEffect(() => {
    const result = parseUPIReturnParams();
    if (result) handleUPIReturn(result);
  }, [handleUPIReturn]);

  // Strategy 2: visibilitychange — app resumes after switching from UPI app
  useEffect(() => {
    let lastHidden = 0;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHidden = Date.now();
        return;
      }
      // Only act if the app was hidden for at least 1 second
      if (Date.now() - lastHidden < 1000) return;

      const urlResult = parseUPIReturnParams();
      if (urlResult) {
        handleUPIReturn(urlResult);
        return;
      }

      const pending = getPendingUPIPayment();
      if (pending) showUPIConfirmToast(pending, onTransactionAdded);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [onTransactionAdded, handleUPIReturn]);

  // Strategy 3: pageshow event (back navigation / bfcache restore)
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const pending = getPendingUPIPayment();
      if (pending) showUPIConfirmToast(pending, onTransactionAdded);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [onTransactionAdded]);
}
