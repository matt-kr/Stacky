import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DebugIntegration from './debug/DebugIntegration.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <DebugIntegration />
  </StrictMode>,
)
