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
                        src: '/src/assets/test.jpg',
                        sizes: '192x192',
                        type: 'image/jpg'
                    },
                    {
                        src: '/src/assets/test.jpg',
                        sizes: '512x512',
                        type: 'image/jpg'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
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
                    }
                ]
            }
        })
    ]
})