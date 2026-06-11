import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Explicit config so the build is unambiguous.
// The real entry files live at the project root:
//   index.html -> /main.js + /style.css  (NOT the old src/ template files)
//   main.js    -> ./src/translations.js
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
      output: {
      }
    }
  },
});
