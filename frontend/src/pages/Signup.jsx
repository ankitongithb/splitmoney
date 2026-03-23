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
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#fff" />
            </div>
          </div>
          <h1 className="gradient-text">SplitMoney</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={submit}>
          {field('name',     'Full Name', User,  'text',     'Alice Johnson')}
          {field('email',    'Email',     Mail,  'email',    'alice@example.com')}
          {field('password', 'Password',  Lock,  'password', '••••••••')}
          {field('phone',    'Phone (optional)', Phone, 'tel', '+91-9876543210')}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
