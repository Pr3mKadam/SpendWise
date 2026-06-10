self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/icons/pwa-192x192.png',
      badge: '/icons/pwa-192x192.png',
      tag: data.tag || 'default',
      data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(data.title || 'SpendWise', options));
  } catch (e) {
    // ignore malformed push
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
