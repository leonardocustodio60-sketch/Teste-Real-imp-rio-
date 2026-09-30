import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import seoPlugin, { resolveSiteUrl } from './scripts/seo-plugin.js'

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const site = resolveSiteUrl(env)

  return {
    plugins: [react(), tailwindcss(), seoPlugin({ siteUrl: site.url, isFallback: site.isFallback })],
    // Caminhos relativos: o build funciona na raiz do domínio ou em subpastas (GitHub Pages).
    base: './',
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1200,
      rolldownOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          privacidade: resolve(import.meta.dirname, 'politica-de-privacidade/index.html'),
        },
      },
    },
  }
})
