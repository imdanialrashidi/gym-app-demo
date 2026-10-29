import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages project-site default. Override VITE_BASE_PATH=/ when serving
 * from a user root site or a custom domain.
 */
const DEFAULT_BASE = '/gym-app-demo/'

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
