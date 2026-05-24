import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  dynamicQuickActions: string[];
}

export default function ChatInput({
  input,
  setInput,
  handleSend,
  isListening,
  toggleListening,
  isLoading,
  dynamicQuickActions,
}: ChatInputProps) {
  return (
    <div className="p-6 pt-0 relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
        {dynamicQuickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(action);
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--surface-input)] border border-[var(--border)] text-[length:var(--fs-overline)] font-medium text-[var(--text-primary)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all cursor-pointer"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Voice Listening Overlay */}
      {isListening && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-black/60 backdrop-blur-md z-40 rounded-3xl flex flex-col items-center justify-center animate-fade-in">
          <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            <div
              className="absolute inset-0 bg-[var(--teal)] rounded-full opacity-20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute inset-4 bg-[var(--teal)] rounded-full opacity-40 animate-ping"
              style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
            />
            <div className="relative w-16 h-16 bg-gradient-to-tr from-[var(--teal)] to-[var(--teal-dim)] rounded-full shadow-[0_0_40px_var(--teal)] flex items-center justify-center">
              <Mic size={32} className="text-white" />
            </div>
          </div>
          <h3 className="text-white font-manrope font-bold text-xl mb-2">Listening...</h3>
          <p className="text-white/70 text-sm">Speak your transaction or ask a question</p>
          <button
            onClick={toggleListening}
            className="mt-8 px-6 py-3 rounded-full bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about your spending..."
          className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-2xl px-5 py-4 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)] pr-24"
        />
        <div className="absolute right-3 flex items-center gap-1">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[var(--teal)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
