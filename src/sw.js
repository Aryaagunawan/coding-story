import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precaching with Workbox (automatic) + manual cache for external dependencies
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
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
            })
        ]
    })
);

// Push Notification Event Listeners
self.addEventListener('push', (event) => {
    const payload = event.data?.json() || {
        title: 'Dicoding Story',
        body: 'Anda memiliki cerita baru',
        url: '/'
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/src/public/notification.png',
            badge: '/src/public/award.png',
            data: { url: payload.url || '/' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});