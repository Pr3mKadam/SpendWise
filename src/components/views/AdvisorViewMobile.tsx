import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Mic, MicOff, Trash2, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useCurrency } from '../../contexts/CurrencyContext';
import { haptic } from '../../lib/haptic';

interface AdvisorViewMobileProps {
  messages: any[];
  onSend: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  toggleListening: () => void;
  onClearChat: () => void;
  monthlyStats: any;
  dynamicQuickActions: string[];
  hasGemini: boolean;
}

export default function AdvisorViewMobile({
  messages,
  onSend,
  isLoading,
  isListening,
  toggleListening,
  onClearChat,
  monthlyStats,
  dynamicQuickActions,
  hasGemini
}: AdvisorViewMobileProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { format } = useCurrency();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
    haptic.light();
  };

  return (
    <div className="view-enter flex flex-col h-[calc(100vh-140px)]">
      {/* 1. Header */}
      <div className="px-1 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--teal)] flex items-center justify-center text-white shadow-lg">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">AI Advisor</h2>
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> ONLINE
            </p>
          </div>
        </div>
        <button 
          onClick={() => { haptic.medium(); onClearChat(); }}
          className="p-2 text-[var(--text-muted)] active:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {!hasGemini && (
        <div className="mx-1 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
          <div>
            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Local Mode</p>
            <p className="text-[10px] text-yellow-500/80 mt-1 leading-snug">Gemini API key missing. Using local rule-based advisor fallback.</p>
          </div>
        </div>
      )}

      {/* 2. Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-1 space-y-4 mb-4 no-scrollbar"
      >
        {messages.map((msg: any) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.sender === 'user' 
                ? 'bg-[var(--teal)] text-white shadow-md' 
                : 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm'
            }`}>
              {msg.type === 'briefing' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[var(--teal)] mb-1">
                    <Zap size={14} className="fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Daily Briefing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--surface-input)] p-2 rounded-xl border border-[var(--border)]">
                      <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase">Balance</p>
                      <p className="text-xs font-black">{format(msg.data?.balance ?? 0)}</p>
                    </div>
                    <div className="bg-[var(--surface-input)] p-2 rounded-xl border border-[var(--border)]">
                      <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase">Savings</p>
                      <p className="text-xs font-black text-purple-500">{msg.data?.savingsRate ?? '0'}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Spent <span className="font-bold">{format(msg.data?.expenses ?? 0)}</span> on <span className="font-bold text-[var(--teal)]">{msg.data?.topCategory ?? 'Unknown'}</span>.
                  </p>
                </div>
              ) : (
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
              <p className={`text-[8px] mt-2 opacity-50 font-bold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface-card)] rounded-2xl p-4 border border-[var(--border)] flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* 3. Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {dynamicQuickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => { haptic.light(); setInput(action); }}
            className="px-4 py-2 bg-[var(--surface-card)] border border-[var(--border)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap active:bg-[var(--teal)] active:text-white active:border-[var(--teal)] transition-all"
          >
            {action}
          </button>
        ))}
      </div>

      {/* 4. Input Area */}
      <div className="relative">
        {isListening && (
          <div className="absolute -top-20 left-0 right-0 flex flex-col items-center justify-center animate-bounce">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <Mic size={24} />
            </div>
            <p className="text-[10px] font-black text-red-500 uppercase mt-2">Listening...</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { haptic.medium(); toggleListening(); }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full h-12 bg-[var(--surface-card)] border border-[var(--border)] rounded-2xl px-4 pr-12 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--teal)] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[var(--teal)] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
