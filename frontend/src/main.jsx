import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx'

createRoot(document.querySelector('#root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
