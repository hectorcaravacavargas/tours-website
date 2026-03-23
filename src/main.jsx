import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './features/i18n/config/i18n.config.js'
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
