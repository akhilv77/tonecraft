import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Primary build: popup and options HTML entries (React + Tailwind CSS pipeline)
export default defineConfig({
  plugins: [react()],

  // Chrome extensions require relative asset paths, not absolute
  base: '',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,

    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
