import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { NetworkStatusProvider } from './context/NetworkStatusContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <NetworkStatusProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </NetworkStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
