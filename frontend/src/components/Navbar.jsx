import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Bell } from 'lucide-react'

const titles = {
  '/':           'Dashboard',
  '/expenses':   'Expenses',
  '/friends':    'Friends & Balances',
  '/trips':      'Trip Splitting',
  '/wallet':     'Wallet',
  '/payments':   'Payments',
  '/budget':     'Budget & Alerts',
  '/reports':    'Reports',
}

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const title = titles[location.pathname] || 'SplitMoney'

  return (
    <div className="flex-between" style={{ marginBottom: 24 }}>
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="flex-center gap-8">
        <button onClick={toggle} className="btn btn-ghost" style={{ padding: 8, borderRadius: '50%' }} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  )
}
