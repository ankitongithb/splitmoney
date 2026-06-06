import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Friends from './pages/Friends'
import Trips from './pages/Trips'
import Wallet from './pages/Wallet'
import Payments from './pages/Payments'
import Budget from './pages/Budget'
import Reports from './pages/Reports'
import Calculator from './pages/Calculator'
import Landing from './pages/Landing'

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  )
}

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>
  return isAuthenticated ? <AppLayout><Dashboard /></AppLayout> : <Landing />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><AppLayout><Trips /></AppLayout></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><AppLayout><Wallet /></AppLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><AppLayout><Payments /></AppLayout></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><AppLayout><Budget /></AppLayout></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><AppLayout><Calculator /></AppLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
