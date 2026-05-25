import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'
import './styles/styles-v2.css'
import './styles/styles-v3.css'
import './styles/styles-v4.css'
import App from './App.tsx'
import { NavDataProvider } from './NavData.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NavDataProvider>
      <App />
    </NavDataProvider>
  </StrictMode>,
)
