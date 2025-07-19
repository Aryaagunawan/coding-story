import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

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
        }
    },
    publicDir: 'src/assets',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['**/*'],
            manifest: {
                name: 'Dicoding Story',
                short_name: 'DicodingStory',
                description: 'Aplikasi untuk berbagi cerita pengalaman di Dicoding',
                theme_color: '#4f46e5',
                icons: [
                    {
                        src: '/src/assets/icon-x192.png',
                        sizes: '192x192',
                        type: 'image/jpg'
                    },
                    {
                        src: '/src/assets/icon-x512.png',
                        sizes: '512x512',
                        type: 'image/jpg'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 // 1 hari
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
                            }
                        }
                    }
                ]
            }
        })
    ]
})