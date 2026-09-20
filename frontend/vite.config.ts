import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Overridable for project-subpath hosts (e.g. GitHub Pages): VITE_BASE=/SmartCorpAI/
  base: process.env.VITE_BASE ?? '/',
  server: { host: '0.0.0.0', port: 5173, allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'] },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'] },
  build: { outDir: 'dist', sourcemap: false },
});
