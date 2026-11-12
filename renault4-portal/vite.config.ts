import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * COOP + COEP habilitan `crossOriginIsolated`, requisito para SharedArrayBuffer
 * (sorting multihilo de @mkkellogg/gaussian-splats-3d). Se aplican en dev y preview;
 * en producción las mismas cabeceras viven en public/_headers y wrangler.toml.
 */
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  plugins: [tailwindcss()],
  server: { headers: isolationHeaders },
  preview: { headers: isolationHeaders },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
});
