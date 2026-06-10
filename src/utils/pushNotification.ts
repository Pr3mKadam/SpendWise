export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendBrowserNotification(
  title: string,
  body: string,
  icon = '/icons/pwa-192x192.png'
) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon, badge: '/icons/pwa-192x192.png' });
}
