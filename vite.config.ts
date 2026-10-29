import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Served from the root of https://gym-app-demo.danialrashidi.ir/.
 * Set VITE_BASE_PATH=/gym-app-demo/ for the bare github.io project-site URL.
 */
const DEFAULT_BASE = '/'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const configuredBase = env.VITE_BASE_PATH?.trim() || DEFAULT_BASE
  const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`

  return {
    base,
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },
    server: {
      host: true,
    },
  }
})
