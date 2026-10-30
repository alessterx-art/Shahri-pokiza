import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  const rawBase = process.env.BASE_PATH;
  // If BASE_PATH is provided (e.g. by GitHub Actions configure-pages), use it.
  // Otherwise in production default to /Shahri-pokiza/ for GitHub Pages.
  // In development, default to / for local preview in AI Studio.
  const defaultBase = mode === 'production' ? '/Shahri-pokiza/' : '/';
  const base = rawBase ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`) : defaultBase;

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
