import React, { useState, useEffect } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api/expenseApi'
import { Plus, Pencil, Trash2, Receipt, Utensils, Car, ShoppingBag, LayoutGrid, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { name: 'Food', icon: Utensils },
  { name: 'Transport', icon: Car },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Bills', icon: Receipt },
  { name: 'Others', icon: LayoutGrid }
]
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED']
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const CHIP_MAP = { Food:'chip-food', Transport:'chip-travel', Bills:'chip-bills', Shopping:'chip-shopping', Entertainment:'chip-entertainment', Others:'chip-others' }

const empty = { title:'', amount:'', currency:'INR', category:'Food', description:'', expenseDate: new Date().toISOString().slice(0,10) }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  
  // For the inline Add Expense form
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [savingInline, setSavingInline] = useState(false)

  // For full modal form (editing or advanced add)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  
  const [filter, setFilter] = useState('All')

  useEffect(() => { load() }, [])
const navigate = useNavigate()
  const load = () => {
    setLoading(true)
    getExpenses().then(r => setExpenses(r.data.data || [])).catch(console.error).finally(() => setLoading(false))
  }

    const goReport = (e) => {
    e?.preventDefault()
    navigate('/reports')
  }

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = e => { setEditing(e.id); setForm({ ...e, expenseDate: e.expenseDate }); setShowModal(true) }

  const saveInline = async () => {
    if (!title || !amount) {
      toast.error('Please enter name and amount')
      return
    }
    setSavingInline(true)
    try {
      const payload = { title, amount: parseFloat(amount), category, currency: 'INR', expenseDate: new Date().toISOString().slice(0,10) }
      await addExpense(payload)
      toast.success('Expense added')
      setTitle('')
      setAmount('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSavingInline(false) }
  }

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
      {/* Top Banner */}
      <div className="expense-top-card">
        <div className="expense-top-content">
          <div className="expense-title">Total Expenses</div>
          <div className="expense-amount-row">
            <div className="expense-amount">{fmt(total)}</div>
            <div className="expense-badge">
              <ArrowDownRight size={14} /> 
            </div>
          </div>
          
          <button onClick={goReport()} className="btn-white">View Report</button>
        </div>
        <img src="/wallet.png" alt="Wallet" className="expense-wallet-img" />
      </div>

      {/* Inline Add Expense Form */}
      <div className="add-expense-card">
        <div className="add-expense-title">Add New Expense</div>
        <div className="expense-input-row">
          <input 
            type="text" 
            placeholder="Enter expense name" 
            className="expense-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="₹ 0.00" 
            className="expense-input expense-input-amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        
        <div className="category-row">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = category === cat.name
            return (
              <div 
                key={cat.name} 
                className={`category-item ${isActive ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <div className={`category-icon cat-${cat.name}`}>
                  <Icon size={24} />
                </div>
                <div className="category-name">{cat.name}</div>
              </div>
            )
          })}
        </div>

        <button className="btn-add-expense" onClick={saveInline} disabled={savingInline}>
          {savingInline ? <div className="spinner" style={{borderColor: 'white', borderTopColor: 'transparent'}} /> : <><Plus size={20} /> Add Expense</>}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="flex-center gap-8" style={{ flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES.map(c => c.name), 'Entertainment'].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-ghost'}`}>{c}</button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={openAdd}><Plus size={16} />Advanced Add</button>
      </div>

      {/* Table */}
      {loading ? <div className="loading-page" style={{minHeight: 200}}><div className="spinner" /></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {filtered.length === 0 ? (
              <div className="empty-state"><Receipt size={48} /><p>No expenses found.</p></div>
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
            <h2 className="modal-title">{editing ? 'Edit Expense' : 'Add Expense (Advanced)'}</h2>
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
                    {[...CATEGORIES.map(c => c.name), 'Entertainment'].map(c => <option key={c}>{c}</option>)}
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
