import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startClearance } from './lib/clearance'

// Before the first render, and outside React so StrictMode's double
// effects cannot run it twice. A no-op for almost every visitor.
startClearance()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
