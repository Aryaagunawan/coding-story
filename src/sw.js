import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precaching dengan Workbox (otomatis) + cache manual untuk dependensi eksternal
precacheAndRoute([
    ...self.__WB_MANIFEST,
    {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        revision: '6.4.0'
    },
    {
        url: 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
        revision: '1.9.3'
    },
    {
        url: 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
        revision: '1.9.3'
    }
]);

// Cache API responses
registerRoute(
    ({ url }) => url.pathname.startsWith('/v1/'),
    new StaleWhileRevalidate({
        cacheName: 'api-cache'
    })
);

// Cache images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Hari
            })
        ]
    })
);

// Push notifications (diperbarui dari versi Anda)
self.addEventListener('push', event => {
    const payload = event.data ? JSON.parse(event.data.text()) : {};
    const title = payload.title || 'Dicoding Story';
    const options = {
        body: payload.options?.body || 'You have a new notification',
        icon: '/src/assets/icon-192.png',
        badge: '/src/assets/icon-192.png',
        data: {
            url: payload.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});