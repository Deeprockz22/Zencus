import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset paths, so the same build works at a domain root and under
  // https://deeprockz22.github.io/Zencus/ (GitHub Pages serves the repo there)
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Two pages: the app (index.html) and the marketing landing page (landing.html)
    rolldownOptions: {
      input: {
        main: 'index.html',
        landing: 'landing.html',
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
  }
})
