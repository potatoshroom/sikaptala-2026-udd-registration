import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to the repo name for GitHub Pages deployment.
  // Change 'sikaptala-2026-udd-registration' if the repo name differs.
  base: '/sikaptala-2026-udd-registration/',
  build: {
    rollupOptions: {
      output: {
        // Split Firebase into its own chunk to keep the main bundle smaller.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
})
