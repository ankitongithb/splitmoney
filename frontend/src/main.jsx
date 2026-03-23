import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '10px',
          background: 'var(--bg-card)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          fontSize: '14px',
        },
      }}
    />
  </React.StrictMode>
)
