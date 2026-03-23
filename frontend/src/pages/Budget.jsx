import React, { useState, useEffect } from 'react'
import { getBudgets, setBudget, getBudgetStatus } from '../api/budgetApi'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Others']
const COLORS = { Food:'#f59e0b', Travel:'#3b82f6', Bills:'#8b5cf6', Shopping:'#ec4899', Entertainment:'#22c55e', Others:'#64748b' }
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Budget() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [status, setStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category: 'Food', amount: '', month: now.getMonth() + 1, year: now.getFullYear() })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [month, year])

  const load = () => {
    setLoading(true)
    getBudgetStatus(month, year).then(r => setStatus(r.data.data || [])).catch(console.error).finally(() => setLoading(false))
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await setBudget({ ...form, amount: parseFloat(form.amount), month: Number(form.month), year: Number(form.year) })
      toast.success('Budget saved!'); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const pieData = status.map(s => ({ name: s.category, value: Number(s.spentAmount) }))
  const totalBudget = status.reduce((a, s) => a + Number(s.budgetAmount), 0)
  const totalSpent = status.reduce((a, s) => a + Number(s.spentAmount), 0)

  return (
    <div>
      {/* Header controls */}
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="flex-center gap-8">
          <select className="form-select" style={{ width: 'auto' }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
              <option key={m} value={i+1}>{m}</option>
            ))}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Set Budget</button>
      </div>

      {/* Summary cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', color: '#fff' }}>
          <div style={{ opacity: .8, fontSize: 13 }}>Total Budget</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{fmt(totalBudget)}</div>
        </div>
        <div className="card" style={{ background: totalSpent > totalBudget ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}>
          <div style={{ opacity: .8, fontSize: 13 }}>Total Spent</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{fmt(totalSpent)}</div>
          {totalSpent > totalBudget && <div style={{ opacity: .8, fontSize: 12, marginTop: 4 }}>⚠ Over budget by {fmt(totalSpent - totalBudget)}</div>}
        </div>
      </div>

      <div className="grid-2">
        {/* Budget bars */}
        <div>
          {loading ? <div className="loading-page"><div className="spinner" /></div> : status.length === 0 ? (
            <div className="card empty-state"><p>No budgets set for this period</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {status.map(s => (
                <div key={s.budgetId} className="card">
                  <div className="flex-between" style={{ marginBottom: 8 }}>
                    <div className="flex-center gap-8">
                      {s.isOverspent
                        ? <AlertTriangle size={16} color="var(--danger)" />
                        : <CheckCircle size={16} color="var(--success)" />}
                      <span style={{ fontWeight: 600 }}>{s.category}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: s.isOverspent ? 'var(--danger)' : 'var(--text)' }}>
                        {fmt(s.spentAmount)} / {fmt(s.budgetAmount)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {s.isOverspent ? `Over by ${fmt(-s.remaining)}` : `${fmt(s.remaining)} left`}
                      </div>
                    </div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{
                      width: `${Math.min(s.percentage, 100)}%`,
                      background: s.isOverspent ? 'var(--danger)' : s.percentage > 80 ? 'var(--warning)' : COLORS[s.category] || 'var(--accent)'
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                    {Number(s.percentage).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Spending Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map(e => <Cell key={e.name} fill={COLORS[e.name] || '#6366f1'} />)}
                </Pie>
                <Tooltip formatter={v => [fmt(v), 'Spent']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No spending data</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">Set Budget</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Budget Amount (₹)</label>
                <input type="number" step="0.01" className="form-input" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} required />
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select className="form-select" value={form.month} onChange={e => setForm(f=>({...f,month:Number(e.target.value)}))}>
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
                      <option key={m} value={i+1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm(f=>({...f,year:Number(e.target.value)}))}>
                    {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
