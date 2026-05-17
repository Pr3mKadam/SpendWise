// SpendWise Service Worker for PWA Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'SpendWise Alert', body: 'New notification received', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
        if (event.notification.data?.url) {
          windowClients[0].navigate(event.notification.data.url);
        }
      } else {
        clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});
