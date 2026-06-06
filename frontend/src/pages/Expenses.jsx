import React, { useState, useEffect } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api/expenseApi'
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Others']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED']
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const CHIP_MAP = { Food:'chip-food', Travel:'chip-travel', Bills:'chip-bills', Shopping:'chip-shopping', Entertainment:'chip-entertainment', Others:'chip-others' }

const empty = { title:'', amount:'', currency:'INR', category:'Food', description:'', expenseDate: new Date().toISOString().slice(0,10) }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('All')

  useEffect(() => { load() }, [])

  const load = () => {
    setLoading(true)
    getExpenses().then(r => setExpenses(r.data.data || [])).catch(console.error).finally(() => setLoading(false))
  }

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = e => { setEditing(e.id); setForm({ ...e, expenseDate: e.expenseDate }); setShowModal(true) }

  const save = async ev => {
    ev.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editing) await updateExpense(editing, payload)
      else await addExpense(payload)
      toast.success(editing ? 'Expense updated' : 'Expense added')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this expense?')) return
    try { await deleteExpense(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.category === filter)

  const total = filtered.reduce((a, e) => a + Number(e.amountInr), 0)

  return (
    <div>
      {/* Toolbar */}
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="flex-center gap-8" style={{ flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-ghost'}`}>{c}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add Expense</button>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--accent)' }}>
        <div style={{ color: '#ffffffaa', fontSize: 13 }}>Total {filter === 'All' ? '' : filter} Expenses</div>
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginTop: 4 }}>{fmt(total)}</div>
        <div style={{ color: '#ffffffaa', fontSize: 12, marginTop: 2 }}>{filtered.length} transactions</div>
      </div>

      {/* Table */}
      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {filtered.length === 0 ? (
              <div className="empty-state"><Receipt size={48} /><p>No expenses found. Add one!</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th>INR</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td><div style={{ fontWeight: 500 }}>{e.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.description}</div></td>
                      <td><span className={`chip ${CHIP_MAP[e.category] || 'chip-others'}`}>{e.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{e.expenseDate}</td>
                      <td style={{ fontWeight: 600 }}>{e.amount} {e.currency}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(e.amountInr)}</td>
                      <td>
                        <div className="flex-center gap-8">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}><Pencil size={14} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(e.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required />
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" step="0.01" className="form-input" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency} onChange={e => setForm(f=>({...f,currency:e.target.value}))}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.expenseDate} onChange={e => setForm(f=>({...f,expenseDate:e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-textarea" value={form.description || ''} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : (editing ? 'Update' : 'Add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
