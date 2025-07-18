import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
        manifest: true  // Added this line
    },
    publicDir: 'src/assets',
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }

});