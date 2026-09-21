import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Overridable for project-subpath hosts (e.g. GitHub Pages): VITE_BASE=/SmartCorpAI/
  base: process.env.VITE_BASE ?? '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.e2b.app', '.app.github.dev', 'localhost', '127.0.0.1'],
    // Development-only convenience (e.g. Codespaces): proxy same-origin /api
    // requests to the local Django backend. Pair with VITE_API_URL=/api.
    // Affects only `vite dev` — never `vite build` output or production serving.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: ['.e2b.app', '.app.github.dev', 'localhost', '127.0.0.1'] },
  build: { outDir: 'dist', sourcemap: false },
});
