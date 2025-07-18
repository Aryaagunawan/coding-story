import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precaching
precacheAndRoute(self.__WB_MANIFEST);

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
        cacheName: 'image-cache'
    })
);

// Fallback for offline
registerRoute(
    ({ request }) => request.mode === 'navigate',
    async ({ event }) => {
        try {
            return await fetch(event.request);
        } catch (error) {
            return caches.match('/offline.html');
        }
    }
);