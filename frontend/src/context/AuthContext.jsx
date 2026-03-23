import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('sm_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sm_user')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch (e) { logout() }
    }
    setLoading(false)
  }, [])

  const login = (userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('sm_token', jwt)
    localStorage.setItem('sm_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
