import { fileURLToPath, URL } from 'node:url';

import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        vue(),
        // basicSsl()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        // https: true,
        proxy: {
            '/api': 'http://localhost:3000',
            '/uploads': 'http://localhost:3000',
        },
    },
});
