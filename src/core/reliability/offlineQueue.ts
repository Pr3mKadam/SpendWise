import { db, writeAuditLog } from '@/db/db';
import { withRetry, isOfflineError, RetryOptions } from './retry';
import { logger } from '@/core/observability';

export type QueueOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface QueueItem {
  id?: string;
  domain: string;
  operation: QueueOperation;
  entity: string;
  entityId: string;
  payload: unknown;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 2000,
  maxDelayMs: 60_000,
  jitter: true,
  retryIf: err => {
    if (isOfflineError(err)) return false;
    return true;
  },
};

export async function enqueue(
  op: Omit<QueueItem, 'id' | 'createdAt' | 'attempts' | 'maxAttempts'>
): Promise<string> {
  const id = crypto.randomUUID();
  const item: QueueItem = {
    ...op,
    id,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: 3,
  };
  await db.keyval.put({ key: `queue:${id}`, value: JSON.stringify(item) });
  await writeAuditLog(
    '_queue',
    'INSERT',
    id,
    undefined,
    `${op.operation} ${op.entity}:${op.entityId}`
  );
  return id;
}

export async function dequeue(id: string): Promise<void> {
  await db.keyval.delete(`queue:${id}`);
}

export async function peekQueue(): Promise<QueueItem[]> {
  const all: QueueItem[] = [];
  await db.keyval.each(item => {
    if (item.key?.startsWith('queue:')) {
      try {
        all.push(JSON.parse(item.value));
      } catch { /* silently ignore — non-critical */ }
    }
  });
  all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return all;
}

export async function processQueue(
  executor: (item: QueueItem) => Promise<void>
): Promise<{ processed: number; failed: number }> {
  const items = await peekQueue();
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    if (!item.id) continue;
    try {
      await withRetry(() => executor(item), {
        ...DEFAULT_RETRY,
        maxAttempts: item.maxAttempts,
      });
      await dequeue(item.id);
      processed++;
    } catch (err) {
      failed++;
      item.attempts++;
      item.lastError = err instanceof Error ? err.message : String(err);
      if (item.attempts >= item.maxAttempts) {
        logger.system.error(
          `Queue item ${item.id} failed after ${item.attempts} attempts, dropping`,
          { item, error: err }
        );
        await writeAuditLog(
          '_queue',
          'DELETE',
          item.id,
          undefined,
          `Dropped after ${item.attempts} attempts: ${item.lastError}`
        );
        await dequeue(item.id);
      } else {
        await db.keyval.put({ key: `queue:${item.id}`, value: JSON.stringify(item) });
      }
    }
  }

  if (processed > 0 || failed > 0) {
    logger.system.info(`Queue processed: ${processed} succeeded, ${failed} failed`);
  }

  return { processed, failed };
}

export async function queueSize(): Promise<number> {
  let count = 0;
  await db.keyval.each(item => {
    if (item.key?.startsWith('queue:')) count++;
  });
  return count;
}

export async function clearQueue(): Promise<void> {
  const toDelete: string[] = [];
  await db.keyval.each(item => {
    if (item.key?.startsWith('queue:')) {
      toDelete.push(item.key);
    }
  });
  await Promise.all(toDelete.map(key => db.keyval.delete(key)));
  logger.system.info('Offline queue cleared', { count: toDelete.length });
}
