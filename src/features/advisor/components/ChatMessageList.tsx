import React from 'react';
import { Bot, User, Zap } from 'lucide-react';
import { Message } from '../types';

export const parseMarkdown = (text: string) => {
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
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 my-0.5">
          <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0 bg-[var(--teal)]" />
          <span>{parts}</span>
        </div>
      );
    }
    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
};

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  format: (amount: number) => string;
  onNavigate?: (view: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessageList({
  messages,
  isLoading,
  format,
  onNavigate,
  scrollRef,
}: ChatMessageListProps) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
        >
          <div
            className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[var(--teal)] text-white'
                  : 'bg-[var(--surface-input)] text-[var(--teal)] border border-[var(--border)]'
              }`}
            >
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className="flex flex-col gap-2">
              {msg.type === 'briefing' ? (
                <div className="glass-card p-5 border-l-4 border-l-[var(--teal)] shadow-lg max-w-sm animate-float bg-[var(--surface-card)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-yellow-500" />
                    <h4 className="font-manrope font-bold text-sm text-[var(--text-primary)]">
                      Daily Briefing
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] uppercase font-bold">
                        Net Balance
                      </p>
                      <p className="text-sm font-bold text-[var(--teal)]">
                        {format(msg.data?.balance ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[length:var(--fs-overline)] text-[var(--text-muted)] uppercase font-bold">
                        Savings Rate
                      </p>
                      <p className="text-sm font-bold text-purple-500">
                        {msg.data?.savingsRate ?? '0'}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <p className="text-[length:var(--fs-caption)] text-[var(--text-secondary)]">
                      You've spent{' '}
                      <span className="font-bold">{format(msg.data?.expenses ?? 0)}</span> this
                      month. Your top category is{' '}
                      <span className="font-bold text-[var(--teal)]">
                        {msg.data?.topCategory ?? 'Unknown'}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[var(--teal)] text-white'
                        : 'bg-[var(--surface-input)] text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      <>
                        {parseMarkdown(msg.text || '\u200b')}
                        {msg.streaming && (
                          <span
                            className="inline-block w-[2px] h-[13px] ml-0.5 align-middle rounded-sm bg-[var(--teal)]"
                            style={{ animation: 'blink 0.9s step-end infinite' }}
                          />
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {msg.type === 'action_card' && msg.data?.action && (
                    <div className="flex gap-2">
                      {msg.data.action === 'CREATE_BUDGET' && (
                        <button
                          onClick={() => onNavigate && onNavigate('budget')}
                          className="px-4 min-h-[48px] bg-[var(--teal)] text-white rounded-xl text-[var(--fs-caption)] font-bold hover:opacity-90 shadow-sm border-none cursor-pointer flex items-center"
                        >
                          Create a Budget
                        </button>
                      )}
                      {msg.data.action === 'VIEW_ANALYTICS' && (
                        <button
                          onClick={() => onNavigate && onNavigate('analytics')}
                          className="px-4 min-h-[48px] bg-[var(--purple)] text-white rounded-xl text-[var(--fs-caption)] font-bold hover:opacity-90 shadow-sm border-none cursor-pointer flex items-center"
                        >
                          View Analytics
                        </button>
                      )}
                      {msg.data.action === 'SET_GOAL' && (
                        <button
                          onClick={() => onNavigate && onNavigate('goals')}
                          className="px-4 min-h-[48px] bg-yellow-500 text-white rounded-xl text-[var(--fs-caption)] font-bold hover:opacity-90 shadow-sm border-none cursor-pointer flex items-center"
                        >
                          Set a Goal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <span
                className={`text-[length:var(--fs-overline)] text-[var(--text-dim)] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start animate-fade-in-up">
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-input)] text-[var(--teal)] flex items-center justify-center border border-[var(--border)]">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface-input)] border border-[var(--border)] flex gap-1.5 items-center">
              <div
                className="w-2 h-2 rounded-full bg-[var(--teal)] animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[var(--teal)] animate-bounce"
                style={{ animationDelay: '160ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[var(--teal)] animate-bounce"
                style={{ animationDelay: '320ms' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
