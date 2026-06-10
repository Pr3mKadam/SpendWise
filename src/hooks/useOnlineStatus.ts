import { useState, useEffect, useCallback } from 'react';
import { processQueue, queueSize } from '@/core/reliability/offlineQueue';
import { logger } from '@/core/observability';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  pendingQueueCount: number;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  const updateQueueCount = useCallback(async () => {
    const count = await queueSize();
    setPendingQueueCount(count);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (wasOffline) {
        logger.system.info('Connection restored, processing offline queue');
        const { processed, failed } = await processQueue(async item => {
          const handler = getQueueHandler(item.domain);
          if (handler) await handler(item);
        });
        logger.system.info(`Offline queue processed: ${processed} ok, ${failed} failed`);
        setWasOffline(false);
      }
      await updateQueueCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      logger.system.warn('Connection lost, operations will be queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateQueueCount();

    const interval = setInterval(updateQueueCount, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [wasOffline, updateQueueCount]);

  return { isOnline, wasOffline, pendingQueueCount };
}

type QueueHandler = (item: import('@/core/reliability/offlineQueue').QueueItem) => Promise<void>;

const queueHandlers = new Map<string, QueueHandler>();

export function registerQueueHandler(domain: string, handler: QueueHandler): void {
  queueHandlers.set(domain, handler);
}

function getQueueHandler(domain: string): QueueHandler | undefined {
  return queueHandlers.get(domain);
}
