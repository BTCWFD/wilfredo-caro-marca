import { defineConfig } from 'vite';

// Explicit config so the build is unambiguous.
// The real entry files live at the project root:
//   index.html -> /main.js + /style.css  (NOT the old src/ template files)
//   main.js    -> ./src/translations.js
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2018',
  },
});
