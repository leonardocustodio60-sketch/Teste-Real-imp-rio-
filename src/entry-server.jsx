import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

/** Usado no build para pré-renderizar o HTML (SSG) — conteúdo indexável sem JavaScript. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
