import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/index.css'
import LandingPage from './Landing'

createRoot(document.getElementById('landing')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)
