import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Focusable element selectors for the focus-trap implementation.
 * We avoid a full package dependency and implement a lightweight trap inline.
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function Modal({
  show,
  onClose,
  title,
  children,
  width = 460,
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Prevent body scroll and trap focus
  useEffect(() => {
    if (!show) return;

    // Save the element that triggered the modal so we can restore focus on close
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the modal
    const frame = requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      el?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = '';
      // Restore focus to the triggering element
      previousFocusRef.current?.focus();
    };
  }, [show]);

  // Handle Escape key + focus-trap on Tab
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest('[hidden]'));

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift+Tab → wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab → wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[12px]"
        aria-hidden="true"
      />
      {/* Card */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-h-[90vh] overflow-y-auto border rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          maxWidth: width,
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            id="modal-title"
            className="m-0 font-extrabold text-[1.1rem]"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label="Close dialog"
            style={{
              backgroundColor: 'var(--surface-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
