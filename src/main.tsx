// React Imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Components Imports
import App from './App.tsx'

// Styles Imports
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
