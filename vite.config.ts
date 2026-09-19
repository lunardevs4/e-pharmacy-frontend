/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : undefined,

  build: {
    modulePreload: false,
    // Raise the warning threshold slightly — we're splitting anyway
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          // ── Vendor chunks ──────────────────────────────────────────────
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs')) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/rwanda-geo-data')) {
            return 'vendor-locations'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios'
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack')) {
            return 'vendor-state'
          }
          if (id.includes('node_modules/zod') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms'
          }
          // ── App portal chunks ──────────────────────────────────────────
          // ── Shared app code ────────────────────────────────────────────
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },

  preview: {
    allowedHosts: true,
  },
}))
