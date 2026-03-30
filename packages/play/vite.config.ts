import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4200,
    strictPort: true,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:12021',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:12021',
        changeOrigin: true,
        ws: true
      },
      '/scans': {
        target: 'http://127.0.0.1:12021',
        changeOrigin: true
      },
      '/avatars': {
        target: 'http://127.0.0.1:12021',
        changeOrigin: true
      }
    },
    fs: {
      allow: ['..']
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4200,
    strictPort: true
  },
  build: {
    outDir: 'dist/ptcg-play',
    emptyOutDir: true
  }
});
