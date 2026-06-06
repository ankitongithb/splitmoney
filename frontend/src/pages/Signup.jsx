import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/authApi'
import { TrendingUp, User, Mail, Lock, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Signup() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await register(form)
      const { token, ...user } = res.data.data
      authLogin(user, token)
      toast.success(`Welcome, ${user.name}! 🎉`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const field = (name, label, icon, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {React.createElement(icon, { size: 16, style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' } })}
        <input name={name} type={type} className="form-input" style={{ paddingLeft: 38 }}
          placeholder={placeholder} value={form[name]} onChange={handle} required={name !== 'phone'} />
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div style={{
        display: 'flex', width: '100%', maxWidth: 1000, background: 'var(--bg-card)', 
        borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Left Side - Illustration */}
        <div style={{ flex: 1, background: '#f5f9f6', display: 'flex', flexDirection: 'column', padding: 40, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>SplitMoney</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/piggybank-illustration.png" alt="Signup Illustration" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{ flex: 1, padding: '40px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 4 }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Join SplitMoney today</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 12, color: '#555' }}>Full name</label>
              <input name="name" type="text" className="form-input" style={{ padding: '10px 14px', background: '#f4f7f6', border: '1px solid transparent' }}
                placeholder="John Doe" value={form.name} onChange={handle} required />
            </div>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 12, color: '#555' }}>Email address</label>
              <input name="email" type="email" className="form-input" style={{ padding: '10px 14px', background: '#f4f7f6', border: '1px solid transparent' }}
                placeholder="john.doe@example.com" value={form.email} onChange={handle} required />
            </div>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 12, color: '#555' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type="password" className="form-input" style={{ padding: '10px 14px', background: '#f4f7f6', border: '1px solid transparent' }}
                  placeholder="••••••••••" value={form.password} onChange={handle} required />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="terms" required style={{ accentColor: 'var(--accent)' }}/>
              <label htmlFor="terms" style={{ fontSize: 12, color: '#666' }}>
                I agree to the <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms & Conditions</span> and <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: 12, borderRadius: 10, fontSize: 14 }}>
              {loading ? <div className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', padding: 8 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={16} alt="Google" style={{ marginRight: 8 }}/>
              Google
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, background: '#fff', color: '#000', padding: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: 8 }}><path d="M11.182.008C11.148-.03 9.923.02 8.537.54 7.198 1.04 6.136 1.83 6.136 2.85c0 .04.03.07.08.06 1.13-.19 2.27-.63 3.48-1.28 1.16-.63 2.12-1.39 2.12-2.31 0-.04-.03-.07-.08-.05zM8.28 2.8c-1.3.06-2.58.55-3.69 1.25C2.5 5.38 1.1 7.24 1.1 9.53c0 2.26.83 4.54 2.22 6.07 1.05 1.17 2.19 1.63 3.33 1.63.95 0 1.93-.34 2.89-.91.96-.58 2.01-.58 2.97 0 .96.58 1.95.91 2.89.91 1.14 0 2.28-.46 3.33-1.63.53-.59.98-1.26 1.35-1.99-.81-.4-1.68-1.04-2.28-1.85-.79-1.08-1.12-2.43-.88-3.76.15-.83.56-1.6 1.17-2.2.14-.14.15-.36.03-.51C16.96 4.3 15.65 3.5 14.28 3.5c-1.24 0-2.45.45-3.48 1.04-.84.48-1.68.48-2.52 0z" fill="#000" fillRule="nonzero" transform="scale(0.85) translate(0, -1)"/></svg>
              Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
