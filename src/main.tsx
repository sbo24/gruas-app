import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { bootstrapLocalData } from './services/seedLocal.ts'

// Inicializar datos de prueba en localStorage si no existen
bootstrapLocalData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
