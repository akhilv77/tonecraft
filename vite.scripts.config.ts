import { defineConfig } from 'vite'
import { resolve } from 'path'

// Secondary build: background service worker and content script as IIFE bundles.
// IIFE format avoids ES module import/export syntax, which Chrome MV3 service workers reject
// unless manifest.json explicitly sets "type": "module" (not done here for broad compatibility).
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Must NOT clear dist — the first build's output must be preserved

    lib: {
      entry: {
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      formats: ['iife'],
      name: 'ToneCraft',
    },

    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        inlineDynamicImports: false,
      },
    },
  },
})
