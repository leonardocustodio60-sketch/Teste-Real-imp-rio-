import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import seoPlugin, { resolveSiteUrl } from './scripts/seo-plugin.js'

/**
 * Build de APRESENTAÇÃO: gera um único arquivo HTML (JS, CSS, fontes e 3D embutidos)
 * que abre com dois cliques, sem servidor e sem internet — ideal para mostrar ao cliente.
 *   npm run build:demo  →  demo/real-imperio-apresentacao.html
 */
const favicon = `data:image/svg+xml;base64,${readFileSync(resolve(import.meta.dirname, 'public/favicon.svg')).toString('base64')}`

function inlineIcons() {
  return {
    name: 'demo-inline-icons',
    transformIndexHtml: (html) =>
      html
        .replace('href="/favicon.svg"', `href="${favicon}"`)
        .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, ''),
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const site = resolveSiteUrl(env)
  return {
    plugins: [react(), tailwindcss(), seoPlugin({ siteUrl: site.url, isFallback: false }), inlineIcons(), viteSingleFile()],
    publicDir: false,
    base: './',
    build: {
      outDir: 'demo',
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: 100_000_000,
      chunkSizeWarningLimit: 5000,
      rolldownOptions: { input: resolve(import.meta.dirname, 'index.html') },
    },
  }
})
