import { ChevronDown, ChevronUp } from 'lucide-react';
import { parseUPISMS } from '../../utils/upiParser';

export function PasteUPI({
  pasteOpen,
  setPasteOpen,
  pasteText,
  setPasteText,
  handleApplyPaste,
  pasteHint,
}: {
  pasteOpen: boolean;
  setPasteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pasteText: string;
  setPasteText: (val: string) => void;
  handleApplyPaste: () => void;
  pasteHint: string | null;
}) {
  return (
    <div className="mt-4 border-t border-[var(--border-subtle,#e2e8f0)] pt-4">
      <button
        type="button"
        onClick={() => setPasteOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
        }}
      >
        <span>Paste UPI / bank SMS (auto-fill)</span>
        {pasteOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {pasteOpen && (
        <div className="mt-3 space-y-2">
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste message containing Rs. or INR amount…"
            rows={3}
            className="w-full resize-none rounded-xl text-sm focus:outline-none"
            style={{
              background: '#f8fafc',
              border: '2px solid #edf2f7',
              padding: '10px 12px',
              fontFamily: 'var(--font-inter)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={handleApplyPaste}
            className="w-full py-2 rounded-xl text-xs font-semibold"
            style={{
              background: '#edf2f7',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Apply to form
          </button>
          {pasteHint && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-inter)', margin: 0 }}>
              {pasteHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
