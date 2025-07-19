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
        // Enable modern builds for better performance
        target: 'esnext',
        minify: 'terser'
    },
    publicDir: 'src/assets',
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
                start_url: '/',
                icons: [
                    {
                        src: '/src/assets/icon-x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/src/assets/icon-x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/src/assets/icon-x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                screenshots: [
                    {
                        src: '/src/assets/dekstop.png',
                        sizes: '1280x800',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Desktop Screenshot'
                    },
                    {
                        src: '/src/assets/hp.png',
                        sizes: '750x1334',
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
                        url: '/#/add-story',
                        icons: [
                            {
                                src: '/src/assets/icon-x96.png',
                                sizes: '96x96'
                            }
                        ]
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,json,ico,png,jpg,jpeg,svg,woff2}'],
                runtimeCaching: [
                    // API caching
                    {
                        urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'stories-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 24 * 60 * 60 // 1 hari
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
                                maxAgeSeconds: 5 * 60 // 5 menit
                            }
                        }
                    },
                    // Google Fonts caching
                    {
                        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 tahun
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // Image caching
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
                            }
                        }
                    },
                    // Static assets
                    {
                        urlPattern: /\.(?:js|css|json)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-assets-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 7 * 24 * 60 * 60 // 1 minggu
                            }
                        }
                    }
                ],
                // Additional Workbox options
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
            },
            // Dev options
            devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: 'index.html'
            }
        })
    ]
});