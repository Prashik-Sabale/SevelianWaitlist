import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Serve under a sub-path such as /pre-order/ when deployed beside the
  // main store; defaults to the domain root (e.g. a dedicated subdomain).
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [
      react(),
      {
        name: 'sevelian-site-url',
        transformIndexHtml: (html) =>
          html.replaceAll('__SITE_URL__', env.VITE_SITE_URL || 'https://sevelian.com/pre-order/'),
      },
    ],
    server: {
      proxy: {
        // Local reference API (npm run dev:api)
        '/api': { target: `http://localhost:${env.API_PORT || 8787}`, changeOrigin: true },
      },
    },
    build: {
      target: 'es2020',
      cssMinify: true,
    },
  }
})
