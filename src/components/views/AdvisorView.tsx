import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, TrendingDown, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { useFinanceState } from '../../hooks/useFinanceState';
import { getFinancialAdvice } from '../../utils/insights/advisor';
import { getSpendingPersonality } from '../../utils/insights/reporting';
import { Transaction } from '../../types';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: string;
}

export default function AdvisorView({ transactions }: { transactions: Transaction[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your SpendWise Local Advisor. I've analyzed your recent transactions. How can I help you save more today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<any>(null);
  const [isAnalyzingPersonality, setIsAnalyzingPersonality] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFinancialAdvice(input, transactions);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date().toISOString()
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
  };

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

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto bg-[var(--surface-card)] rounded-3xl border border-[var(--border)] overflow-hidden">
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
              <span className="text-[10px] text-[var(--text-muted)]">Powered by SpendWise Local AI</span>
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
              {isAnalyzingPersonality ? 'Analyzing...' : 'Generate Personality'}
            </button>
          )}
          <button className="p-2 rounded-lg hover:bg-[var(--surface-card)] text-[var(--text-muted)] transition-colors">
            <Sparkles size={16} />
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
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-[var(--teal)] text-white' : 'bg-[var(--surface-input)] text-[var(--teal)]'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-[var(--teal)] text-white' 
                  : 'bg-[var(--surface-input)] text-[var(--text-primary)]'
              }`}>
                {msg.text}
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

      {/* Insights (Optional Mini Sidebar/Bar) */}
      {transactions.length > 0 && (
        <div className="px-6 py-3 bg-[var(--surface-input)] border-t border-[var(--border)] flex gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border)]">
            <TrendingDown size={12} className="text-red-500" />
            <span className="text-[10px] font-medium text-[var(--text-muted)]">Spending up 12% in Food</span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border)]">
            <TrendingUp size={12} className="text-[var(--teal)]" />
            <span className="text-[10px] font-medium text-[var(--text-muted)]">Saved ₹2,400 this month</span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border)]">
            <AlertTriangle size={12} className="text-orange-500" />
            <span className="text-[10px] font-medium text-[var(--text-muted)]">3 Subscriptions due soon</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 pt-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me about your spending..."
            className="w-full bg-[var(--surface-input)] border border-[var(--border)] rounded-2xl px-5 py-4 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)] pr-14"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-2.5 rounded-xl bg-[var(--teal)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
