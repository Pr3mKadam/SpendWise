import { urlBase64ToUint8Array } from './urlBase64ToUint8Array';
import { VAPID_PUBLIC_KEY } from '@/config/env';
import { supabaseRequest } from '@/core/api/supabase';

export async function setupPushNotifications(userId: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    const keys = subscription.toJSON().keys;
    await supabaseRequest('/push_subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }),
      headers: { Prefer: 'resolution=merge-duplicates' },
    });

    return subscription;
  } catch (err) {
    console.warn('Push notification setup failed:', err);
    return null;
  }
}
