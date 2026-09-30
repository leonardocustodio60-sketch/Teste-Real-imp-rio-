import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/manrope'
import './index.css'
import App from './App'

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Em produção o HTML já vem pré-renderizado (SEO): apenas "hidratamos".
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
