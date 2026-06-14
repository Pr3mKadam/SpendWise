import { logger, captureError } from '@/core/observability';
import { writeAuditLog } from '@/db/db';

const CRASH_COUNT_KEY = 'spendwise_crash_count';
const LAST_CRASH_KEY = 'spendwise_last_crash_time';
const MAX_CRASH_THRESHOLD = 3;
const CRASH_WINDOW_MS = 60_000;

export interface CrashInfo {
  count: number;
  lastCrashTime: number;
  withinWindow: boolean;
  exceededThreshold: boolean;
}

export function getCrashInfo(): CrashInfo {
  let count = 0;
  let lastCrashTime = 0;
  try {
    count = parseInt(localStorage.getItem(CRASH_COUNT_KEY) || '0', 10);
    lastCrashTime = parseInt(localStorage.getItem(LAST_CRASH_KEY) || '0', 10);
  } catch { /* silently ignore — non-critical */ }

  const withinWindow = Date.now() - lastCrashTime < CRASH_WINDOW_MS;
  const exceededThreshold = withinWindow && count >= MAX_CRASH_THRESHOLD;

  return { count, lastCrashTime, withinWindow, exceededThreshold };
}

export function recordCrash(): void {
  try {
    const info = getCrashInfo();
    const now = Date.now();
    const withinWindow = now - info.lastCrashTime < CRASH_WINDOW_MS;
    const newCount = withinWindow ? info.count + 1 : 1;

    localStorage.setItem(CRASH_COUNT_KEY, String(newCount));
    localStorage.setItem(LAST_CRASH_KEY, String(now));

    logger.system.error(`Crash recorded (${newCount} in window)`, {
      crashCount: newCount,
      withinWindow,
    });

    if (newCount >= MAX_CRASH_THRESHOLD && withinWindow) {
      logger.system.warn('Crash threshold exceeded, recovery mode activated');
    }
  } catch { /* silently ignore — non-critical */ }
}

export function clearCrashCount(): void {
  try {
    localStorage.removeItem(CRASH_COUNT_KEY);
    localStorage.removeItem(LAST_CRASH_KEY);
  } catch { /* silently ignore — non-critical */ }
}

export function isInRecoveryMode(): boolean {
  const info = getCrashInfo();
  return info.exceededThreshold;
}

export function getRecoveryAction(): 'reload' | 'reset-storage' | 'clear-cache' | 'none' {
  const info = getCrashInfo();
  if (!info.exceededThreshold) return 'none';
  if (info.count >= 5) return 'reset-storage';
  if (info.count >= 3) return 'reload';
  return 'none';
}

export async function performRecovery(): Promise<boolean> {
  const action = getRecoveryAction();
  logger.system.warn(`Performing recovery action: ${action}`);

  await writeAuditLog('_crash', 'UPDATE', 'recovery', undefined, `Recovery action: ${action}`);

  switch (action) {
    case 'reload':
      clearCrashCount();
      window.location.reload();
      return true;
    case 'reset-storage':
      try {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name);
        }
      } catch (e) {
        console.warn('[CrashRecovery] Failed to delete IndexedDB databases:', e);
      }
      localStorage.clear();
      clearCrashCount();
      window.location.reload();
      return true;
    case 'clear-cache':
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      clearCrashCount();
      window.location.reload();
      return true;
    case 'none':
      break;
  }
  return false;
}

export function registerCrashRecovery(): void {
  const prevUnload = window.onbeforeunload;
  window.onbeforeunload = (e: BeforeUnloadEvent) => {
    clearCrashCount();
    if (prevUnload) return prevUnload.call(window, e);
    return undefined;
  };

  if (isInRecoveryMode()) {
    performRecovery().then(recovered => {
      if (recovered) {
        captureError(new Error('App recovered from crash loop'), {
          recoveryAction: getRecoveryAction(),
        });
      }
    });
  }
}
