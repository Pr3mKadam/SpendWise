import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({ show, onClose, title, children, width = 460 }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/45 backdrop-blur-[12px]"
      />
      {/* Card */}
      <div 
        className="relative z-10 w-full max-h-[90vh] overflow-y-auto border rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          maxWidth: width,
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="m-0 font-extrabold text-[1.1rem]" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-xl p-2 cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: 'var(--surface-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
