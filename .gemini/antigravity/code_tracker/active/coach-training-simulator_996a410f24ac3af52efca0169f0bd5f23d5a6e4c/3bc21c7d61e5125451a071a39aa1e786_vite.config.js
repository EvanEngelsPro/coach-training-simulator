³import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
    },
});
³"(996a410f24ac3af52efca0169f0bd5f23d5a6e4c2Jfile:///home/epitech/technicalTest/coach-training-simulator/vite.config.js:;file:///home/epitech/technicalTest/coach-training-simulator