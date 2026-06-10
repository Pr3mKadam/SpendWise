import { useCallback, useEffect, useRef } from 'react';

export interface PushPayload {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

function isCapacitorAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform()
  );
}

export function useNativePush() {
  const callbackRef = useRef<((notification: PushPayload) => void) | null>(null);

  useEffect(() => {
    if (!isCapacitorAvailable()) return;

    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        // @ts-expect-error Capacitor plugin not installed
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const pushHandler = await PushNotifications.addListener(
          'pushReceived',
          (notification: { title?: string; body?: string; data?: Record<string, unknown> }) => {
            if (callbackRef.current) {
              callbackRef.current({
                title: notification.title,
                body: notification.body,
                data: notification.data,
              });
            }
          }
        );
        cleanup = () => pushHandler.remove();
      } catch {}
    };

    init();

    return () => {
      cleanup?.();
    };
  }, []);

  const registerPush = useCallback(async (): Promise<string | null> => {
    if (!isCapacitorAvailable()) return null;
    try {
      // @ts-expect-error Capacitor plugin not installed
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.requestPermissions();
      await PushNotifications.register();
      return new Promise<string | null>(resolve => {
        PushNotifications.addListener('registration', (token: { value: string }) => {
          resolve(token.value);
        });
      });
    } catch {
      return null;
    }
  }, []);

  const onPushReceived = useCallback((callback: (notification: PushPayload) => void) => {
    callbackRef.current = callback;
  }, []);

  return { registerPush, onPushReceived };
}
