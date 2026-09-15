import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './app'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing in index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
