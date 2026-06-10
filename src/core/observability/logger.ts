import { getCurrentHub } from './sentry';
import { LOG_LEVEL } from '@/config/env';

export const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 } as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export type LogContext =
  | 'auth'
  | 'transactions'
  | 'sync'
  | 'ai'
  | 'payments'
  | 'admin'
  | 'system'
  | 'backup'
  | 'navigation'
  | 'performance';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

const currentLevel: LogLevel = (LOG_LEVEL || 'INFO') as LogLevel;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function toConsole(entry: LogEntry): void {
  const formatted = `[${entry.timestamp}] [${entry.level}] [${entry.context}] ${entry.message}`;
  switch (entry.level) {
    case 'ERROR':
      console.error(formatted, entry.error ?? '', entry.data ?? '');
      break;
    case 'WARN':
      console.warn(formatted, entry.data ?? '');
      break;
    default:
      console.warn(formatted, entry.data ?? '');
  }
}

async function toSentry(entry: LogEntry): Promise<void> {
  const hub = getCurrentHub();
  if (!hub) return;

  if (entry.level === 'ERROR') {
    const err = entry.error
      ? Object.assign(new Error(entry.error.message), {
          name: entry.error.name,
          stack: entry.error.stack,
        })
      : new Error(entry.message);
    hub.captureException(err, {
      level: 'error',
      tags: { context: entry.context },
      extra: entry.data,
    });
  } else {
    hub.addBreadcrumb({
      category: entry.context,
      message: entry.message,
      level: entry.level === 'WARN' ? 'warning' : 'info',
      data: entry.data,
      timestamp: Date.now() / 1000,
    });
  }
}

function createLogger(context: LogContext) {
  const entry = (
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: unknown
  ): LogEntry => ({
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    data,
    error: error
      ? {
          name: (error as Error).name || 'Error',
          message: (error as Error).message || String(error),
          stack: (error as Error).stack,
        }
      : undefined,
  });

  const log = (
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: unknown
  ) => {
    if (!shouldLog(level)) return;
    const e = entry(level, message, data, error);
    toConsole(e);
    toSentry(e);
  };

  return {
    debug: (msg: string, data?: Record<string, unknown>) => log('DEBUG', msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('INFO', msg, data),
    warn: (msg: string, data?: Record<string, unknown>, error?: unknown) =>
      log('WARN', msg, data, error),
    error: (msg: string, data?: Record<string, unknown>, error?: unknown) =>
      log('ERROR', msg, data, error),
  };
}

export const logger = {
  auth: createLogger('auth'),
  tx: createLogger('transactions'),
  sync: createLogger('sync'),
  ai: createLogger('ai'),
  payments: createLogger('payments'),
  admin: createLogger('admin'),
  system: createLogger('system'),
  backup: createLogger('backup'),
  nav: createLogger('navigation'),
  perf: createLogger('performance'),
};
