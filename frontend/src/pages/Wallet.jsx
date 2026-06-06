import React, { useState, useEffect } from 'react'
import { getWallet, addMoney, sendMoney } from '../api/walletApi'
import { getFriends } from '../api/friendApi'
import { getPayments } from '../api/paymentApi'
import { Wallet as WalletIcon, Plus, Send, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Wallet() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [friends, setFriends] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addForm, setAddForm] = useState({ amount: '' })
  const [sendForm, setSendForm] = useState({ amount: '', receiverId: '', description: '' })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [w, f, p] = await Promise.all([getWallet(), getFriends(), getPayments()])
      setWallet(w.data.data)
      setFriends(f.data.data || [])
      setPayments(p.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAdd = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await addMoney({ amount: parseFloat(addForm.amount) })
      setWallet(res.data.data)
      toast.success(`₹${addForm.amount} added to wallet!`)
      setShowAdd(false); setAddForm({ amount: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleSend = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await sendMoney({ amount: parseFloat(sendForm.amount), receiverId: Number(sendForm.receiverId), description: sendForm.description })
      toast.success('Money sent!')
      setShowSend(false); setSendForm({ amount: '', receiverId: '', description: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  return (
    <div>
      {/* Wallet Card */}
      <div style={{
        background: 'var(--accent)',
        borderRadius: 20, padding: 32, marginBottom: 24, color: '#fff',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <WalletIcon size={28} />
          <span style={{ fontSize: 18, fontWeight: 600, opacity: .8 }}>SplitMoney Wallet</span>
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
          {fmt(wallet?.balance)}
        </div>
        <div style={{ opacity: .7, fontSize: 14, marginTop: 4 }}>Available Balance</div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(true)}>
            <Plus size={16} />Add Money
          </button>
          <button className="btn" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', backdropFilter: 'blur(8px)' }} onClick={() => setShowSend(true)}>
            <Send size={16} />Send Money
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Payment History</h3>
        {payments.length === 0 ? (
          <div className="empty-state"><WalletIcon size={40} /><p>No payment history yet</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {payments.slice(0, 20).map(p => {
              const isSender = p.sender?.id === user?.userId
              return (
                <div key={p.id} className="flex-between" style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 10 }}>
                  <div className="flex-center gap-12">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: isSender ? '#fee2e2' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSender ? <ArrowUpRight size={18} color="#ef4444" /> : <ArrowDownLeft size={18} color="#22c55e" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{isSender ? `Sent to ${p.receiver?.name}` : `Received from ${p.sender?.name}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description || 'Payment'} · {p.status}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: isSender ? 'var(--danger)' : 'var(--success)', textAlign: 'right' }}>
                      {isSender ? '-' : '+'}{fmt(p.amount)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                      <span className={`badge ${p.status === 'COMPLETED' ? 'badge-success' : p.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 10 }}>{p.status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Money to Wallet</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" min="1" className="form-input" placeholder="1000"
                  value={addForm.amount} onChange={e => setAddForm({ amount: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} type="button" className="btn btn-secondary btn-sm" onClick={() => setAddForm({ amount: String(v) })}>₹{v}</button>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Add Money'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Money Modal */}
      {showSend && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSend(false)}>
          <div className="modal">
            <h2 className="modal-title">Send Money</h2>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">Send To</label>
                <select className="form-select" value={sendForm.receiverId} onChange={e => setSendForm(f=>({...f,receiverId:e.target.value}))} required>
                  <option value="">Select friend…</option>
                  {friends.map(f => <option key={f.id} value={f.id}>{f.name} ({f.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" min="1" className="form-input" placeholder="500"
                  value={sendForm.amount} onChange={e => setSendForm(f=>({...f,amount:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="For dinner, bills…"
                  value={sendForm.description} onChange={e => setSendForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowSend(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
