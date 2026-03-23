import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/authApi'
import { TrendingUp, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      const { token, ...user } = res.data.data
      authLogin(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#fff" />
            </div>
          </div>
          <h1 className="gradient-text">SplitMoney</h1>
          <p>Sign in to manage your expenses</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="email" type="email" className="form-input" style={{ paddingLeft: 38 }}
                placeholder="alice@test.com" value={form.email} onChange={handle} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="password" type="password" className="form-input" style={{ paddingLeft: 38 }}
                placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
          </div>

          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--accent-light)', borderRadius: 10, fontSize: 13, color: 'var(--accent)', marginBottom: 16 }}>
            <strong>Test:</strong> alice@test.com / Test@1234
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          No account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
