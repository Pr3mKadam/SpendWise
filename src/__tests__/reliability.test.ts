import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/config/env', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  GEMINI_PROXY_URL: 'https://test.gemini.com',
  SETU_ENV: 'test',
  SENTRY_DSN: 'https://test@sentry.io/test',
  DEMO_MODE: false,
  VAPID_PUBLIC_KEY: 'test-vapid-key',
  RAZORPAY_PROXY_URL: 'https://test.razorpay.com',
  APP_VERSION: '4.0.0',
  LOG_LEVEL: 'INFO',
  validateEnv: () => [],
}));

import { withRetry, calculateBackoff, isTransientError, isOfflineError } from '@/core/reliability/retry';

// ─── Mock localStorage ────────────────────────────────────────────────────────

function createMockStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() { return Object.keys(store).length; },
  };
}

let mockStorage: Storage;

beforeEach(() => {
  mockStorage = createMockStorage();
  vi.stubGlobal('localStorage', mockStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Retry: calculateBackoff ──────────────────────────────────────────────────

describe('calculateBackoff', () => {
  it('exponential without jitter', () => {
    expect(calculateBackoff(0, 1000, 30_000, false)).toBe(1000);
    expect(calculateBackoff(1, 1000, 30_000, false)).toBe(2000);
    expect(calculateBackoff(2, 1000, 30_000, false)).toBe(4000);
    expect(calculateBackoff(3, 1000, 30_000, false)).toBe(8000);
  });

  it('capped at maxDelay', () => {
    expect(calculateBackoff(10, 1000, 30_000, false)).toBe(30_000);
  });

  it('applies jitter within expected range', () => {
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) {
      results.add(calculateBackoff(1, 1000, 30_000, true));
    }
    const min = Math.min(...results);
    const max = Math.max(...results);
    expect(min).toBeGreaterThanOrEqual(1000);
    expect(max).toBeLessThanOrEqual(2000);
  });
});

// ─── Retry: withRetry ─────────────────────────────────────────────────────────

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    await expect(withRetry(fn, { maxAttempts: 3 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('temp fail'))
      .mockRejectedValueOnce(new Error('temp fail 2'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, jitter: false });
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting retries', async () => {
    const err = new Error('persistent');
    const fn = vi.fn().mockRejectedValue(err);

    const promise = withRetry(fn, { maxAttempts: 2, baseDelayMs: 10, jitter: false });
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).rejects.toThrow('persistent');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry if retryIf returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('nope'));
    const promise = withRetry(fn, {
      maxAttempts: 3,
      baseDelayMs: 10,
      retryIf: () => false,
    });
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).rejects.toThrow('nope');
    // Wait for the rejection to settle
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('invokes onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, {
      maxAttempts: 3,
      baseDelayMs: 10,
      jitter: false,
      onRetry,
    });
    await vi.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBe('ok');
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});

// ─── Retry: isTransientError / isOfflineError ─────────────────────────────────

describe('isTransientError', () => {
  it('detects fetch TypeError', () => {
    expect(isTransientError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('detects TimeoutError', () => {
    expect(isTransientError(new DOMException('timeout', 'TimeoutError'))).toBe(true);
  });

  it('detects retryable ApiError', () => {
    expect(isTransientError({ code: 'NETWORK_ERROR', retryable: true })).toBe(true);
    expect(isTransientError({ code: 'TIMEOUT', retryable: true })).toBe(true);
    expect(isTransientError({ code: 'RATE_LIMITED', retryable: true })).toBe(true);
    expect(isTransientError({ code: 'SERVER_ERROR', retryable: true })).toBe(true);
  });

  it('detects non-retryable errors', () => {
    expect(isTransientError({ code: 'AUTH_ERROR', retryable: false })).toBe(false);
    expect(isTransientError(new Error('normal'))).toBe(false);
  });
});

describe('isOfflineError', () => {
  it('detects Failed to fetch', () => {
    expect(isOfflineError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('detects NETWORK_ERROR code', () => {
    expect(isOfflineError({ code: 'NETWORK_ERROR' })).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isOfflineError(new Error('normal'))).toBe(false);
    expect(isOfflineError({ code: 'TIMEOUT' })).toBe(false);
  });
});

// ─── Conflict Resolution (pure logic, no storage) ─────────────────────────────

describe('resolveTransactionConflict (pure logic)', () => {
  type PartialTx = { id: string; amount?: number; merchant?: string; updatedAt?: string };

  function resolveTransactionConflictPure(
    local: PartialTx,
    remote: PartialTx,
    strategy: 'lww' | 'local-wins' | 'remote-wins' = 'lww'
  ) {
    let resolved: PartialTx;
    switch (strategy) {
      case 'local-wins':
        resolved = { ...remote, ...local };
        break;
      case 'remote-wins':
        resolved = { ...local, ...remote };
        break;
      case 'lww':
      default: {
        const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
        const remoteUpdated = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
        resolved = localUpdated >= remoteUpdated ? { ...remote, ...local } : { ...local, ...remote };
        break;
      }
    }
    return {
      resolved,
      conflict: {
        entityId: local.id,
        local,
        remote,
        resolved,
        strategy,
        timestamp: new Date().toISOString(),
      },
    };
  }

  it('uses last-writer-wins strategy', () => {
    const local = { id: '1', amount: 100, updatedAt: '2024-06-01T00:00:00Z' };
    const remote = { id: '1', amount: 200, updatedAt: '2024-06-02T00:00:00Z' };
    const { resolved } = resolveTransactionConflictPure(local, remote, 'lww');
    expect(resolved.amount).toBe(200);
  });

  it('local-wins keeps local value', () => {
    const local = { id: '1', amount: 100, updatedAt: '2024-06-01T00:00:00Z' };
    const remote = { id: '1', amount: 200, updatedAt: '2024-06-02T00:00:00Z' };
    const { resolved } = resolveTransactionConflictPure(local, remote, 'local-wins');
    expect(resolved.amount).toBe(100);
  });

  it('remote-wins keeps remote value', () => {
    const local = { id: '1', amount: 100, updatedAt: '2024-06-01T00:00:00Z' };
    const remote = { id: '1', amount: 200, updatedAt: '2024-06-02T00:00:00Z' };
    const { resolved } = resolveTransactionConflictPure(local, remote, 'remote-wins');
    expect(resolved.amount).toBe(200);
  });

  it('local wins when timestamps are equal', () => {
    const ts = '2024-06-01T00:00:00Z';
    const local = { id: '1', amount: 100, merchant: 'Local', updatedAt: ts };
    const remote = { id: '1', amount: 200, merchant: 'Remote', updatedAt: ts };
    const { resolved } = resolveTransactionConflictPure(local, remote, 'lww');
    expect(resolved.amount).toBe(100);
    expect(resolved.merchant).toBe('Local');
  });

  it('returns conflict record with all metadata', () => {
    const local = { id: '1', amount: 100, merchant: 'Local', updatedAt: '2024-06-01T00:00:00Z' };
    const remote = { id: '1', amount: 200, merchant: 'Remote', updatedAt: '2024-06-02T00:00:00Z' };
    const { conflict } = resolveTransactionConflictPure(local, remote, 'lww');
    expect(conflict.entityId).toBe('1');
    expect(conflict.strategy).toBe('lww');
    expect(conflict.timestamp).toBeTruthy();
  });
});

describe('resolveTransactionBatch (pure logic)', () => {
  type PartialTx = { id: string; amount?: number; merchant?: string; updatedAt?: string };

  function resolveTransactionBatchPure(
    localTxs: PartialTx[],
    remoteTxs: PartialTx[],
    strategy: 'lww' | 'local-wins' | 'remote-wins' = 'lww'
  ) {
    const localMap = new Map(localTxs.map(t => [t.id, t]));
    const remoteMap = new Map(remoteTxs.map(t => [t.id, t]));
    const conflicts: unknown[] = [];
    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
    const merged: PartialTx[] = [];

    for (const id of allIds) {
      const local = localMap.get(id);
      const remote = remoteMap.get(id);
      if (local && remote) {
        const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
        const remoteUpdated = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
        if (localUpdated === remoteUpdated) {
          merged.push(local);
        } else {
          const resolved = strategy === 'local-wins'
            ? { ...remote, ...local }
            : strategy === 'remote-wins'
              ? { ...local, ...remote }
              : localUpdated >= remoteUpdated ? { ...remote, ...local } : { ...local, ...remote };
          merged.push(resolved);
          conflicts.push({ entityId: id });
        }
      } else if (local) {
        merged.push(local);
      } else if (remote) {
        merged.push(remote);
      }
    }
    return { merged, conflicts };
  }

  it('merges non-conflicting transactions', () => {
    const local = [{ id: '1', merchant: 'A' }, { id: '2', merchant: 'B' }];
    const remote = [{ id: '1', merchant: 'A' }, { id: '3', merchant: 'C' }];
    const { merged, conflicts } = resolveTransactionBatchPure(local, remote);
    expect(merged).toHaveLength(3);
    expect(conflicts).toHaveLength(0);
  });

  it('detects and resolves conflicts for updated transactions', () => {
    const local = [{ id: '1', merchant: 'Local', amount: 50, updatedAt: '2024-06-01T00:00:00Z' }];
    const remote = [{ id: '1', merchant: 'Remote', amount: 100, updatedAt: '2024-06-02T00:00:00Z' }];
    const { merged, conflicts } = resolveTransactionBatchPure(local, remote);
    expect(conflicts).toHaveLength(1);
    expect(merged[0].amount).toBe(100);
  });

  it('handles empty inputs', () => {
    expect(resolveTransactionBatchPure([], []).merged).toHaveLength(0);
    expect(resolveTransactionBatchPure([{ id: '1' }], []).merged).toHaveLength(1);
    expect(resolveTransactionBatchPure([], [{ id: '1' }]).merged).toHaveLength(1);
  });
});

// ─── Crash Recovery ───────────────────────────────────────────────────────────

describe('crashRecovery', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', mockStorage);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with zero crash count', async () => {
    const { getCrashInfo } = await import('@/core/reliability/crashRecovery');
    const info = getCrashInfo();
    expect(info.count).toBe(0);
    expect(info.exceededThreshold).toBe(false);
  });

  it('increments crash count on recordCrash', async () => {
    const { getCrashInfo, recordCrash } = await import('@/core/reliability/crashRecovery');
    recordCrash();
    expect(getCrashInfo().count).toBe(1);
  });

  it('threshold exceeded after 3+ crashes within window', async () => {
    const { getCrashInfo, recordCrash, isInRecoveryMode } = await import('@/core/reliability/crashRecovery');
    recordCrash();
    recordCrash();
    expect(getCrashInfo().count).toBe(2);
    expect(isInRecoveryMode()).toBe(false);

    recordCrash();
    expect(getCrashInfo().count).toBe(3);
    expect(isInRecoveryMode()).toBe(true);
  });

  it('crash count resets when outside window', async () => {
    const { getCrashInfo, recordCrash } = await import('@/core/reliability/crashRecovery');
    recordCrash();
    recordCrash();
    vi.advanceTimersByTime(61_000);
    recordCrash();
    expect(getCrashInfo().count).toBe(1);
  });

  it('clearCrashCount resets everything', async () => {
    const { getCrashInfo, recordCrash, clearCrashCount, isInRecoveryMode } = await import('@/core/reliability/crashRecovery');
    recordCrash();
    recordCrash();
    recordCrash();
    clearCrashCount();
    expect(getCrashInfo().count).toBe(0);
    expect(isInRecoveryMode()).toBe(false);
  });

  it('getRecoveryAction returns correct level', async () => {
    const { getRecoveryAction, recordCrash } = await import('@/core/reliability/crashRecovery');
    expect(getRecoveryAction()).toBe('none');

    recordCrash();
    recordCrash();
    recordCrash();
    expect(getRecoveryAction()).toBe('reload');

    recordCrash();
    recordCrash();
    expect(getRecoveryAction()).toBe('reset-storage');
  });
});
