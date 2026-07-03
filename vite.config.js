import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import translations from './src/translations.js';


// Auto-sync translations.json on Vite config load
try {
  fs.writeFileSync('translations.json', JSON.stringify(translations, null, 2), 'utf-8');
} catch (err) {
  console.error('Failed to auto-sync translations.json:', err);
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Wilfredo Caro | Web3 & AI Development',
        short_name: 'W.Caro',
        description: 'Portfolio of Wilfredo Caro, specializing in Deep-Tech, Web3, and AI Bots.',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2018',
    rollupOptions: {
      input: {
        main: 'index.html',
        planner: 'planner.html',
        linkedin_helper: 'linkedin_helper.html'
      },
      output: {
      }
    }
  },
});
