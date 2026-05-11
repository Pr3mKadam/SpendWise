import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, User, Sparkles, TrendingDown, TrendingUp, AlertTriangle, X, Trash2, Mic, MicOff, Zap } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { getFinancialAdvice } from '../../utils/insights/advisor';
import { getSpendingPersonality } from '../../utils/insights/reporting';
import { useCurrency } from '../../contexts/CurrencyContext';
import EducationCards from '../features/advisor/EducationCards';

const ADVISOR_HISTORY_KEY = 'spendwise_advisor_history';
const MAX_HISTORY = 20;

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
  type?: 'text' | 'action_card' | 'briefing';
  data?: any;
}

const parseMarkdown = (text: string) => {
  // Split by lines first for list rendering
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ');
    const content = isBullet ? line.replace(/^[\s\-•]+/, '') : line;
    const parts = content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
    if (isBullet) {
      return <div key={lineIdx} className="flex items-start gap-1.5 my-0.5"><span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--teal)' }} /><span>{parts}</span></div>;
    }
    return <span key={lineIdx}>{parts}{lineIdx < lines.length - 1 && <br />}</span>;
  });
};

interface AdvisorViewProps {
  onNavigate?: (view: any) => void;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: "Hello! I'm your SpendWise Advisor. How can I help you with your finances today?",
  sender: 'ai',
  timestamp: new Date().toISOString()
};

export default function AdvisorView({ onNavigate }: AdvisorViewProps) {
  const { transactions, monthlyStats } = useTransactions();
  const { format } = useCurrency();
  const [input, setInput] = useState('');

  // Persist messages in localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(ADVISOR_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [INITIAL_MESSAGE];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<any>(null);
  const [isAnalyzingPersonality, setIsAnalyzingPersonality] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist messages whenever they change
  useEffect(() => {
    try {
      const toSave = messages.slice(-MAX_HISTORY);
      localStorage.setItem(ADVISOR_HISTORY_KEY, JSON.stringify(toSave));
    } catch { /* ignore */ }
  }, [messages]);

  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let response = await getFinancialAdvice(text, transactions);
      
      let actionTag = null;
      const actionMatch = response.match(/\[ACTION:([A-Z_]+)\]/);
      if (actionMatch) {
        actionTag = actionMatch[1];
        response = response.replace(actionMatch[0], '').trim();
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: actionTag ? 'action_card' : 'text',
        data: actionTag ? { action: actionTag } : undefined
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to my brain right now. Please check your API key.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, transactions]);



  useEffect(() => {
    // Proactive Daily Briefing
    const hasBriefing = messages.some(m => m.type === 'briefing');
    if (!hasBriefing && transactions.length > 0) {
      const briefingMsg: Message = {
        id: 'briefing',
        text: "Your Daily Financial Briefing is ready.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'briefing',
        data: {
          balance: monthlyStats.totalIncome - monthlyStats.totalExpenses,
          expenses: monthlyStats.totalExpenses,
          topCategory: monthlyStats.topCategory,
          savingsRate: monthlyStats.totalIncome > 0 ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome * 100).toFixed(1) : '0'
        }
      };
      setMessages(prev => [prev[0], briefingMsg, ...prev.slice(1)]);
    }
  }, [transactions, monthlyStats]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        // Auto-send after voice input
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [handleSend]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const dynamicQuickActions = React.useMemo(() => {
    const actions = [];
    if (monthlyStats.totalExpenses > monthlyStats.totalIncome && monthlyStats.totalIncome > 0) {
      actions.push("How can I avoid going negative?");
    }
    if (monthlyStats.topCategory) {
      actions.push(`Why is my ${monthlyStats.topCategory} spending so high?`);
    }
    actions.push("What was my biggest expense?");
    actions.push("How can I save more?");
    return actions.slice(0, 4);
  }, [monthlyStats]);

  const handleAnalyzePersonality = async () => {
    setIsAnalyzingPersonality(true);
    try {
      const result = await getSpendingPersonality(transactions);
      setPersonality(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingPersonality(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Hello! I'm your SpendWise Advisor. I've cleared our chat history. How can I help you today?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
        <EducationCards />
        
        {/* Quick Stats Mini-Card */}
        <div className="card p-5 bg-gradient-to-br from-[var(--purple)] to-[#818cf8] border-none text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Financial Health</p>
              <h4 className="font-manrope font-bold text-lg">Smart Insights</h4>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-80">Savings Rate</span>
              <span className="text-sm font-bold">{monthlyStats.totalIncome > 0 ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome * 100).toFixed(1) : '0'}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white" 
                style={{ width: `${Math.min(100, Math.max(0, monthlyStats.totalIncome > 0 ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome * 100) : 0))}%` }} 
              />
            </div>
            <p className="text-[10px] opacity-70 leading-relaxed mt-2">
              {(() => {
                const rate = monthlyStats.totalIncome > 0
                  ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome * 100)
                  : 0;
                if (rate <= 0) return 'Start saving to improve your financial health!';
                if (rate < 10) return 'Try to save at least 10% of your income each month.';
                if (rate < 20) return 'Good progress! Aim for 20% savings rate for long-term stability.';
                if (rate < 30) return 'Great savings rate! You are outpacing most households.';
                return `Excellent! A ${rate.toFixed(0)}% savings rate puts you in the top tier.`;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-8 flex flex-col bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-input)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--teal-dim)] flex items-center justify-center">
              <Bot className="text-[var(--teal)]" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">AI Financial Advisor</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-[var(--text-muted)]">Active • Powered by Local Intelligence</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!personality && (
              <button 
                onClick={handleAnalyzePersonality}
                disabled={isAnalyzingPersonality || transactions.length < 5}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--teal)] text-white text-[10px] font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              >
                {isAnalyzingPersonality ? 'Analyzing...' : 'Analyze Personality'}
              </button>
            )}
            <button 
              onClick={handleClearChat}
              className="p-2 rounded-lg hover:bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Personality Card */}
        {personality && (
          <div className="mx-6 mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">
                  🎭
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">{personality.archetype}</h3>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Your Spending Archetype</p>
                </div>
              </div>
              <button 
                onClick={() => setPersonality(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed italic">
              "{personality.description}"
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {personality.traits.map((trait: string, i: number) => (
                <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-[var(--text-muted)]">
                  {trait}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/10">
              <p className="text-[10px] font-bold text-purple-500 uppercase mb-1">Expert Advice</p>
              <p className="text-xs text-[var(--text-primary)]">{personality.advice}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${
                  msg.sender === 'user' ? 'bg-[var(--teal)] text-white' : 'bg-[var(--surface-input)] text-[var(--teal)] border border-[var(--border)]'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="flex flex-col gap-2">
                  {msg.type === 'briefing' ? (
                    <div className="glass-card p-5 border-l-4 border-l-[var(--teal)] shadow-lg max-w-sm animate-float">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-yellow-500" />
                        <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)]">Daily Briefing</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Net Balance</p>
                          <p className="text-sm font-bold text-[var(--teal)]">{format(msg.data.balance)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Savings Rate</p>
                          <p className="text-sm font-bold text-purple-500">{msg.data.savingsRate}%</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          You've spent <span className="font-bold">{format(msg.data.expenses)}</span> this month. 
                          Your top category is <span className="font-bold text-[var(--teal)]">{msg.data.topCategory}</span>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-[var(--teal)] text-white' 
                          : 'bg-[var(--surface-input)] text-[var(--text-primary)] border border-[var(--border)]'
                      }`}>
                        {msg.sender === 'ai' ? parseMarkdown(msg.text) : msg.text}
                      </div>
                      
                      {msg.type === 'action_card' && msg.data?.action && (
                        <div className="flex gap-2">
                          {msg.data.action === 'CREATE_BUDGET' && (
                            <button onClick={() => onNavigate && onNavigate('budget')} className="px-4 py-2 bg-[var(--teal)] text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-sm border-none cursor-pointer">
                              Create a Budget
                            </button>
                          )}
                          {msg.data.action === 'VIEW_ANALYTICS' && (
                            <button onClick={() => onNavigate && onNavigate('analytics')} className="px-4 py-2 bg-[var(--purple)] text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-sm border-none cursor-pointer">
                              View Analytics
                            </button>
                          )}
                          {msg.data.action === 'SET_GOAL' && (
                            <button onClick={() => onNavigate && onNavigate('goals')} className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-sm border-none cursor-pointer">
                              Set a Goal
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <span className={`text-[9px] text-[var(--text-dim)] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-input)] text-[var(--teal)] flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--surface-input)] flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insights Bar */}
        {transactions.length > 0 && (
          <div className="px-6 py-3 bg-[var(--surface-input)] border-t border-[var(--border)] flex gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border)]">
              <TrendingUp size={12} className="text-[var(--teal)]" />
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                Saved {format(monthlyStats.totalIncome - monthlyStats.totalExpenses > 0 
                  ? (monthlyStats.totalIncome - monthlyStats.totalExpenses) 
                  : 0)} this month
              </span>
            </div>
            {monthlyStats.topCategory && (
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border)]">
                <TrendingDown size={12} className="text-red-500" />
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  Most spent on {monthlyStats.topCategory}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions & Input */}
        <div className="p-6 pt-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
            {dynamicQuickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(action);
                }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--surface-input)] border border-[var(--border)] text-[10px] font-medium text-[var(--text-primary)] hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] transition-all cursor-pointer"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Voice Listening Overlay */}
          {isListening && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center animate-fade-in">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-[var(--teal)] rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-4 bg-[var(--teal)] rounded-full opacity-40 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
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
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-muted)] hover:bg-[var(--surface-card)]'
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
      </div>
    </div>
  );
}
