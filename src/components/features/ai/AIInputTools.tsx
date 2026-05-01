import { Loader2, Camera, Mic } from 'lucide-react';
import { RefObject } from 'react';
import { parseUPISMS } from '../../../utils/parsers/upi';
import { useCategories } from '../../../hooks/useCategories';
import { useStore } from '../../../store';
import { parseVoiceLocally } from '../../../utils/parsers/voice';
import { compressImage } from '../../../utils/imageUtils';
import { recognizeReceipt, parseOfflineReceipt } from '../../../utils/parsers/ocr';

const PulsingWave = () => (
  <div className="flex items-center gap-[3px] h-4">
    {[0.3, 0.5, 0.8, 0.5, 0.3, 0.6, 0.9, 0.6, 0.3].map((h, i) => (
      <div
        key={i}
        className="w-[3px] rounded-full"
        style={{
          background: 'var(--red)',
          height: `${h * 100}%`,
          animation: `wave-bar 0.8s ease-in-out ${i * 0.07}s infinite alternate`,
        }}
      />
    ))}
    <style>{`
      @keyframes wave-bar {
        from { transform: scaleY(0.3); opacity: 0.6; }
        to   { transform: scaleY(1);   opacity: 1;   }
      }
    `}</style>
  </div>
);

export function AIInputTools({
  isScanning,
  isListening,
  scanStatus,
  handleFileChange,
  handleVoiceInput,
  fileInputRef,
}: {
  isScanning: boolean;
  isListening: boolean;
  scanStatus?: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVoiceInput: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="mt-4 border-t border-[var(--border-subtle,#e2e8f0)] pt-4 flex flex-col gap-2">
      <div className="flex gap-2">
        {/* ── Snap Receipt ─────────────────────────────────────────── */}
        <label
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: isScanning ? 'var(--teal-dim)' : 'var(--teal-dim)',
            color: 'var(--teal)',
            border: `1.5px dashed ${isScanning ? 'var(--teal)' : 'var(--teal-glow)'}`,
            fontFamily: 'var(--font-inter)',
            cursor: isScanning || isListening ? 'not-allowed' : 'pointer',
            opacity: isListening ? 0.5 : 1,
          }}
        >
          {isScanning
            ? <><Loader2 size={15} className="animate-spin" /> Scanning…</>
            : <><Camera size={15} /> Snap Receipt</>}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isScanning || isListening}
          />
        </label>

        {/* ── Magic Mic ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isScanning || isListening}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: isListening ? 'var(--red-dim)' : 'rgba(59,130,246,0.1)',
            color: isListening ? 'var(--red)' : '#3b82f6',
            border: `1.5px dashed ${isListening ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.3)'}`,
            fontFamily: 'var(--font-inter)',
            cursor: isListening ? 'default' : 'pointer',
          }}
        >
          {isListening
            ? <><PulsingWave /></>
            : <><Mic size={15} /> Magic Mic</>}
        </button>
      </div>

      {/* Live scan/voice status hint */}
      {scanStatus && (
        <p
          className="text-center text-[11px] font-medium px-2 py-1 rounded-lg"
          style={{
            background: 'var(--surface-input)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-inter)',
            lineHeight: 1.4,
          }}
        >
          {scanStatus}
        </p>
      )}
    </div>
  );
}
