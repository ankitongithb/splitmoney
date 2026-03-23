import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Receipt, Users, Map, Wallet,
  CreditCard, PieChart, FileText, LogOut, TrendingUp, Menu, X, ArrowRightLeft
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses',  icon: Receipt,          label: 'Expenses' },
  { to: '/friends',   icon: Users,            label: 'Friends' },
  { to: '/trips',     icon: Map,              label: 'Trips' },
  { to: '/wallet',    icon: Wallet,           label: 'Wallet' },
  { to: '/payments',  icon: CreditCard,       label: 'Payments' },
  { to: '/budget',    icon: PieChart,         label: 'Budget' },
  { to: '/calculator',icon: ArrowRightLeft,   label: 'Calculator' },
  { to: '/reports',   icon: FileText,         label: 'Reports' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost"
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 200, display: 'none' }}
        id="mobile-menu-btn"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99, display: 'none' }}
          id="sidebar-overlay"
        />
      )}

      <aside style={{
        width: 'var(--sidebar-w)', height: '100vh', position: 'fixed', top: 0, left: 0,
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
        transition: 'transform 0.2s ease'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex-center gap-8">
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>SplitMoney</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expense Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div className="flex-between" style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--bg-input)' }}>
            <div className="flex-center gap-8">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: 6 }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(${open ? '0' : '-100%'}); }
          #mobile-menu-btn { display: flex !important; }
          #sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  )
}
