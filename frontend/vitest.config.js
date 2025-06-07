import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    exclude: [
      'node_modules',
      'e2e',
      'dist',
      'coverage',
      '**/e2e/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'e2e',
        'dist',
        'coverage',
        '**/e2e/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        'src/test/setup.js'
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}) 