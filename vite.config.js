import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/coding-story/',
    server: {
        open: true,
        port: 3000
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        },
        target: 'esnext',
        minify: 'terser'
    },
    publicDir: 'src/public',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
            manifest: {
                name: 'Dicoding Story',
                short_name: 'DicodingStory',
                description: 'Aplikasi untuk berbagi cerita pengalaman di Dicoding',
                theme_color: '#4f46e5',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/coding-story/',
                icons: [
                    {
                        src: 'src/public/icons/icon-72x72.png',
                        sizes: '72x72',
                        type: 'image/png'
                    },
                    {
                        src: 'src/public/icons/icon-96x96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    },
                    {
                        src: 'src/public/icons/icon-128x128.png',
                        sizes: '128x128',
                        type: 'image/png'
                    },
                    {
                        src: 'src/public/icons/icon-144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'src/public/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'src/public/icons/icon-384x384.png',
                        sizes: '384x384',
                        type: 'image/png'
                    },
                    {
                        src: 'src/public/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                screenshots: [
                    {
                        src: 'src/public/screenshots/desktop.png', // Fixed typo from 'dekstop'
                        sizes: '1920x932',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Desktop Screenshot'
                    },
                    {
                        src: 'src/public/screenshots/mobile.png',
                        sizes: '928x1252',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Mobile Screenshot'
                    }
                ],
                shortcuts: [
                    {
                        name: 'Add New Story',
                        short_name: 'Add Story',
                        description: 'Tambahkan cerita baru',
                        url: '/coding-story/#/add-story', // Updated path
                        icons: [
                            {
                                src: 'src/public/icons/icon-96x96.png',
                                sizes: '96x96'
                            }
                        ]
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,json,ico,png,jpg,jpeg,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'stories-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 24 * 60 * 60
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 5 * 60
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:js|css|json)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-assets-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 7 * 24 * 60 * 60
                            }
                        }
                    }
                ],
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
            },
            devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: 'index.html'
            }
        })
    ]
});