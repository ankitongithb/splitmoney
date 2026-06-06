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
      <div style={{
        display: 'flex', width: '100%', maxWidth: 1000, background: 'var(--bg-card)', 
        borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Left Side - Illustration */}
        <div className="auth-image-col" style={{ flex: 1, background: '#f5f9f6', display: 'flex', flexDirection: 'column', padding: 40, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>SplitMoney</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/wallet-illustration.png" alt="Wallet Illustration" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-col" style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>Login</h1>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 4 }}>Welcome back!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Login to continue splitting with your friends</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontSize: 12, color: '#555' }}>Email address</label>
              <input name="email" type="email" className="form-input" style={{ padding: '12px 16px', background: '#f4f7f6', border: 'none' }}
                placeholder="john.doe@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: 12, color: '#555' }}>Password</label>
              <input name="password" type="password" className="form-input" style={{ padding: '12px 16px', background: '#f4f7f6', border: 'none' }}
                placeholder="••••••••••" value={form.password} onChange={handle} required />
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <a href="#" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ padding: 14, borderRadius: 10, fontSize: 15 }}>
              {loading ? <div className="spinner" /> : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={16} alt="Google" style={{ marginRight: 8 }}/>
              Google
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', color: '#000' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: 8 }}><path d="M11.182.008C11.148-.03 9.923.02 8.537.54 7.198 1.04 6.136 1.83 6.136 2.85c0 .04.03.07.08.06 1.13-.19 2.27-.63 3.48-1.28 1.16-.63 2.12-1.39 2.12-2.31 0-.04-.03-.07-.08-.05zM8.28 2.8c-1.3.06-2.58.55-3.69 1.25C2.5 5.38 1.1 7.24 1.1 9.53c0 2.26.83 4.54 2.22 6.07 1.05 1.17 2.19 1.63 3.33 1.63.95 0 1.93-.34 2.89-.91.96-.58 2.01-.58 2.97 0 .96.58 1.95.91 2.89.91 1.14 0 2.28-.46 3.33-1.63.53-.59.98-1.26 1.35-1.99-.81-.4-1.68-1.04-2.28-1.85-.79-1.08-1.12-2.43-.88-3.76.15-.83.56-1.6 1.17-2.2.14-.14.15-.36.03-.51C16.96 4.3 15.65 3.5 14.28 3.5c-1.24 0-2.45.45-3.48 1.04-.84.48-1.68.48-2.52 0z" fill="#000" fillRule="nonzero" transform="scale(0.85) translate(0, -1)"/></svg>
              Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
