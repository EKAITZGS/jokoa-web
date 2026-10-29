import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, /ws, /img y /uploads se piden a la API real
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': { target: 'https://jokoa.duckdns.org', changeOrigin: true },
      '/img': { target: 'https://jokoa.duckdns.org', changeOrigin: true },
      '/uploads': { target: 'https://jokoa.duckdns.org', changeOrigin: true },
    },
  },
});
