import { logger } from '@/core/observability';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  retryIf?: (error: unknown) => boolean;
}

const DEFAULTS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  jitter: true,
  onRetry: () => {},
  retryIf: () => true,
};

export function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  jitter: boolean
): number {
  const exponential = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  if (!jitter) return exponential;
  const half = exponential / 2;
  return half + Math.random() * half;
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...DEFAULTS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const shouldRetry = opts.retryIf(err);
      if (!shouldRetry || attempt === opts.maxAttempts - 1) {
        throw err;
      }
      const delayMs = calculateBackoff(attempt, opts.baseDelayMs, opts.maxDelayMs, opts.jitter);
      opts.onRetry(attempt + 1, err, delayMs);
      logger.system.warn(
        `Retry attempt ${attempt + 1}/${opts.maxAttempts - 1} after ${delayMs}ms`,
        { error: err }
      );
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export function isTransientError(err: unknown): boolean {
  if (
    err instanceof TypeError &&
    (err.message === 'Failed to fetch' ||
      err.message.includes('fetch') ||
      err.message.includes('network'))
  )
    return true;

  if (err instanceof DOMException && err.name === 'TimeoutError') return true;

  if (err && typeof err === 'object' && 'retryable' in err) {
    return (err as { retryable: boolean }).retryable === true;
  }

  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code: string }).code);
    return ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED', 'SERVER_ERROR'].includes(code);
  }

  if (err && typeof err === 'object' && 'status' in err) {
    const status = Number((err as { status: number }).status);
    return status === 429 || status >= 500;
  }

  return false;
}

export function isOfflineError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true;
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as { code: string }).code === 'NETWORK_ERROR';
  }
  return false;
}

export function clearApiTimings(): void {
  try {
    sessionStorage.removeItem('spendwise_api_timing');
  } catch {
    /* silently ignore — non-critical */
  }
}
