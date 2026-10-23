import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import netlify from '@netlify/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), netlify({ edgeFunctions: { enabled: false } })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
