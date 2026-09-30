/**
 * Pré-renderização (SSG): injeta o HTML do React em dist/index.html.
 * Buscadores e agentes de IA recebem todo o conteúdo semântico (H1, H2, H3...)
 * sem precisar executar JavaScript; no navegador o React apenas "hidrata".
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const ssrDir = resolve(root, 'dist-ssr')
const target = resolve(root, 'dist/index.html')

const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const html = await readFile(target, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('Marcador <div id="root"></div> não encontrado em dist/index.html')

await writeFile(target, html.replace(marker, `<div id="root">${render()}</div>`))
await rm(ssrDir, { recursive: true, force: true })
console.log('✓ dist/index.html pré-renderizado')
