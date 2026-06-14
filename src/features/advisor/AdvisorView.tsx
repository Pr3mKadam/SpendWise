import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Bot, Sparkles, TrendingDown, TrendingUp, AlertTriangle, X, Trash2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { SpendingPersonality } from '@/types';
import {
  getFinancialAdvice,
  getSpendingPersonality,
  ConversationMessage,
} from '@/features/analytics/insights/advisor';
import { useCurrency } from '@/contexts/CurrencyContext';
import EducationCards from '@/features/education/components/EducationCards';
import EmptyState from '@/components/ui/EmptyState';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import AdvisorViewMobile from '@/features/advisor/AdvisorViewMobile';
import { isSupabaseConfigured } from '@/core/api/supabase';

const ADVISOR_HISTORY_KEY = 'spendwise_advisor_history';
const MAX_HISTORY = 20;

import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import { Message, MessageData } from './types';

interface AdvisorViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNavigate?: (view: any) => void;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: "Hello! I'm your SpendWise Advisor. How can I help you with your finances today?",
  sender: 'ai',
  timestamp: new Date().toISOString(),
};

export default function AdvisorView({ onNavigate }: AdvisorViewProps) {
  const isMobile = useIsMobile();
  const { transactions, monthlyStats } = useTransactions();
  const { format, activeCurrency } = useCurrency();
  const [input, setInput] = useState('');
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY || isSupabaseConfigured;

  // Persist messages in localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(ADVISOR_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* silently ignore — non-critical */ }
    return [INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [personality, setPersonality] = useState<SpendingPersonality | null>(null);
  const [isAnalyzingPersonality, setIsAnalyzingPersonality] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist messages whenever they change
  useEffect(() => {
    try {
      const toSave = messages.slice(-MAX_HISTORY);
      localStorage.setItem(ADVISOR_HISTORY_KEY, JSON.stringify(toSave));
    } catch { /* silently ignore — non-critical */ }
  }, [messages]);

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isLoading || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      const streamingMsgId = (Date.now() + 1).toString();
      const streamingMsg: Message = {
        id: streamingMsgId,
        text: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        streaming: true,
      };

      setMessages(prev => [...prev, userMsg, streamingMsg]);
      setInput('');
      setIsLoading(true); // show typing dots before first token

      try {
        // Map messages to ConversationMessage format
        const history: ConversationMessage[] = messages
          .filter(m => !m.streaming && m.type !== 'action_card' && m.type !== 'briefing')
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          }));

        let accumulated = await getFinancialAdvice(text, transactions, history, activeCurrency);

        setIsLoading(false);
        setIsStreaming(true);

        // Finalise: extract [ACTION:...] tag and set proper type
        let actionTag: string | null = null;
        const actionMatch = accumulated.match(/\[ACTION:([A-Z_]+)\]/);
        if (actionMatch) {
          actionTag = actionMatch[1];
          accumulated = accumulated.replace(actionMatch[0], '').trim();
        }

        setMessages(prev =>
          prev.map(m =>
            m.id === streamingMsgId
              ? {
                  ...m,
                  text: accumulated,
                  streaming: false,
                  type: actionTag ? 'action_card' : 'text',
                  data: actionTag ? { action: actionTag as MessageData['action'] } : undefined,
                }
              : m
          )
        );
      } catch (error) {
        console.error('Advisor streaming error:', error);
        const fallbackText =
          transactions.length > 0
            ? `I had trouble processing your question. Based on your **${transactions.length} transactions**, your top focus area right now is tracking your spending.`
            : 'I had trouble processing that. Once you add some transactions, I can give you personalised advice!';
        setMessages(prev =>
          prev.map(m =>
            m.id === streamingMsgId ? { ...m, text: fallbackText, streaming: false } : m
          )
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [input, isLoading, isStreaming, transactions, messages, activeCurrency]
  );

  useEffect(() => {
    // Proactive Daily Briefing
    const hasBriefing = messages.some(m => m.type === 'briefing');
    if (!hasBriefing && transactions.length > 0) {
      const briefingMsg: Message = {
        id: 'briefing',
        text: 'Your Daily Financial Briefing is ready.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'briefing',
        data: {
          balance: monthlyStats.totalIncome - monthlyStats.totalExpenses,
          expenses: monthlyStats.totalExpenses,
          topCategory: monthlyStats.topCategory,
          savingsRate:
            monthlyStats.totalIncome > 0
              ? (
                  ((monthlyStats.totalIncome - monthlyStats.totalExpenses) /
                    monthlyStats.totalIncome) *
                  100
                ).toFixed(1)
              : '0',
        },
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(prev => [prev[0], briefingMsg, ...prev.slice(1)]);
    }
  }, [transactions, monthlyStats, messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const RecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new RecognitionClass() as SpeechRecognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
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

  const dynamicQuickActions = useMemo(() => {
    const actions = [];
    if (monthlyStats.totalExpenses > monthlyStats.totalIncome && monthlyStats.totalIncome > 0) {
      actions.push('How can I avoid going negative?');
    }
    if (monthlyStats.topCategory) {
      actions.push(`Why is my ${monthlyStats.topCategory} spending so high?`);
    }
    actions.push('What was my biggest expense?');
    actions.push('How can I save more?');
    return actions.slice(0, 4);
  }, [monthlyStats]);

  const handleAnalyzePersonality = async () => {
    setIsAnalyzingPersonality(true);
    try {
      const result = await getSpendingPersonality(transactions);
      setPersonality({
        archetype: result.archetype,
        description: result.description,
        traits: [result.challenge, result.tip],
        advice: result.tip,
      });
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
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  if (isMobile) {
    return (
      <AdvisorViewMobile
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        isListening={isListening}
        toggleListening={toggleListening}
        onClearChat={handleClearChat}
        monthlyStats={monthlyStats}
        dynamicQuickActions={dynamicQuickActions}
        hasGemini={hasGemini}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
        <EducationCards />

        {/* Quick Stats Mini-Card */}
        <div className="card p-5 bg-gradient-to-br from-[var(--purple)] to-[#818cf8] border-none text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)]/20 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[length:var(--fs-overline)] font-bold opacity-80 uppercase tracking-widest">
                Financial Health
              </p>
              <h4 className="font-manrope font-bold text-lg">Smart Insights</h4>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-80">Savings Rate</span>
              <span className="text-sm font-bold">
                {monthlyStats.totalIncome > 0
                  ? (
                      ((monthlyStats.totalIncome - monthlyStats.totalExpenses) /
                        monthlyStats.totalIncome) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--surface-card)]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--surface-card)]"
                style={{
                  width: `${Math.min(100, Math.max(0, monthlyStats.totalIncome > 0 ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) / monthlyStats.totalIncome) * 100 : 0))}%`,
                }}
              />
            </div>
            <p className="text-[length:var(--fs-overline)] opacity-70 leading-relaxed mt-2">
              {(() => {
                const rate =
                  monthlyStats.totalIncome > 0
                    ? ((monthlyStats.totalIncome - monthlyStats.totalExpenses) /
                        monthlyStats.totalIncome) *
                      100
                    : 0;
                if (rate <= 0) return 'Start saving to improve your financial health!';
                if (rate < 10) return 'Try to save at least 10% of your income each month.';
                if (rate < 20)
                  return 'Good progress! Aim for 20% savings rate for long-term stability.';
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
                <span className="text-[length:var(--fs-overline)] text-[var(--text-muted)]">
                  Active • Powered by Local Intelligence
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!personality && (
              <button
                onClick={handleAnalyzePersonality}
                disabled={isAnalyzingPersonality || transactions.length < 5}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--teal)] text-white text-[length:var(--fs-overline)] font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
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

        {!hasGemini && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs font-bold text-yellow-500">Local Advisor Mode Active</p>
              <p className="text-[length:var(--fs-overline)] text-yellow-500/80 mt-0.5">
                Gemini API key is not configured. The advisor is using the local rule-based fallback
                engine. Set VITE_GEMINI_API_KEY in .env for AI advice.
              </p>
            </div>
          </div>
        )}

        {/* Personality Card */}
        {personality && (
          <div className="mx-6 mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">
                  🎭
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-lg text-[var(--text-primary)]">
                    {personality.archetype}
                  </h3>
                  <p className="text-[length:var(--fs-overline)] font-bold text-purple-500 uppercase tracking-widest">
                    Your Spending Archetype
                  </p>
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
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-[var(--surface-card)]/5 border border-white/10 text-[length:var(--fs-overline)] font-medium text-[var(--text-muted)]"
                >
                  {trait}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/10">
              <p className="text-[length:var(--fs-overline)] font-bold text-purple-500 uppercase mb-1">
                Expert Advice
              </p>
              <p className="text-xs text-[var(--text-primary)]">{personality.advice}</p>
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {transactions.length === 0 && messages.length <= 1 && (
          <EmptyState
            title="No data yet"
            subtitle="Add your first transaction to unlock AI-powered financial insights."
            onAction={() => onNavigate?.('transactions')}
          />
        )}

        {/* Messages */}
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          format={format}
          onNavigate={onNavigate}
          scrollRef={scrollRef}
        />

        {/* Insights Bar */}
        {transactions.length > 0 && (
          <div className="px-6 py-3 bg-[var(--surface-input)] border-t border-[var(--border)] flex gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-card)]/5 border border-[var(--border)]">
              <TrendingUp size={12} className="text-[var(--teal)]" />
              <span className="text-[length:var(--fs-overline)] font-medium text-[var(--text-muted)]">
                Saved{' '}
                {format(
                  monthlyStats.totalIncome - monthlyStats.totalExpenses > 0
                    ? monthlyStats.totalIncome - monthlyStats.totalExpenses
                    : 0
                )}{' '}
                this month
              </span>
            </div>
            {monthlyStats.topCategory && (
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-card)]/5 border border-[var(--border)]">
                <TrendingDown size={12} className="text-red-500" />
                <span className="text-[length:var(--fs-overline)] font-medium text-[var(--text-muted)]">
                  Most spent on {monthlyStats.topCategory}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions & Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={() => handleSend()}
          isListening={isListening}
          toggleListening={toggleListening}
          isLoading={isLoading}
          dynamicQuickActions={dynamicQuickActions}
        />
      </div>
    </div>
  );
}

