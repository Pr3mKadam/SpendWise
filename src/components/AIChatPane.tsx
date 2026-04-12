import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Sparkles, Flame, Loader2 } from 'lucide-react';
import { generateChatResponse, ChatMessage, CoachContext } from '../services/ai';

interface AIChatPaneProps {
  isOpen: boolean;
  onClose: () => void;
  isRoastMode: boolean;
  contextData: CoachContext;
}

export default function AIChatPane({ isOpen, onClose, isRoastMode, contextData }: AIChatPaneProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically add an initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: isRoastMode
            ? "I'm looking at your wallet, and honestly, it's tragic. What excuse do you want to ask me about first?"
            : "Hello! I have your financial context loaded. How can I help you analyze your spending today?",
        },
      ]);
    }
  }, [isOpen, messages.length, isRoastMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(newHistory, contextData, isRoastMode);
      setMessages([...newHistory, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'model', content: "I'm having trouble connecting to my brain right now. Try again later!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const accentColor = isRoastMode ? 'var(--red)' : 'var(--teal)';
  const accentDim = isRoastMode ? 'var(--red-dim)' : 'var(--teal-dim)';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Pane */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-[var(--surface-card)] shadow-2xl z-[101] flex flex-col animate-slide-in-right border-l border-[var(--border)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentDim }}>
              {isRoastMode ? <Flame size={18} style={{ color: accentColor }} /> : <Sparkles size={18} style={{ color: accentColor }} />}
            </div>
            <div>
              <h3 className="font-manrope font-bold text-[17px] text-[var(--text-primary)]">
                {isRoastMode ? 'Savage AI Coach' : 'Smart AI Coach'}
              </h3>
              <p className="font-inter text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Connected to your data
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface-input)] text-[var(--text-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ background: 'var(--bg)' }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${isUser ? 'bg-[var(--surface-input)] border border-[var(--border)]' : ''}`} style={{ background: !isUser ? accentDim : undefined }}>
                  {isUser ? <User size={14} className="text-[var(--text-secondary)]" /> : (isRoastMode ? <Flame size={14} style={{ color: accentColor }} /> : <Sparkles size={14} style={{ color: accentColor }} />)}
                </div>
                
                {/* Bubble */}
                <div 
                  className="px-4 py-3 rounded-2xl shadow-sm text-[13px] font-inter leading-relaxed"
                  style={{
                    background: isUser ? accentColor : 'var(--surface-card)',
                    color: isUser ? '#ffffff' : 'var(--text-secondary)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    borderTopRightRadius: isUser ? '4px' : '16px',
                    borderTopLeftRadius: !isUser ? '4px' : '16px',
                  }}
                >
                  {/* Since Gemini output can contain light markdown, we render it cleanly. */}
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j} className="block min-h-[1em]">{line.replace(/\*\*/g, '')}</span>
                  ))}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] self-start animate-fade-in">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentDim }}>
                <Loader2 size={14} className="animate-spin" style={{ color: accentColor }} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-muted)] text-[13px]">
                Analyzing your mess...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--surface-card)] border-t border-[var(--border)]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your spending..."
              className="flex-1 bg-[var(--surface-input)] text-[var(--text-primary)] px-4 py-3.5 rounded-xl text-[13px] font-inter focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accentColor } as any}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: accentColor }}
            >
              <Send size={18} className={isTyping ? "opacity-0" : ""} />
              {isTyping && <Loader2 size={18} className="absolute animate-spin" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
