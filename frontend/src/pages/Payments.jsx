import React, { useState, useEffect } from 'react'
import { getPayments, createOrder, verifyPayment } from '../api/paymentApi'
import { getFriends } from '../api/friendApi'
import { CreditCard, Send, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ receiverId: '', amount: '', description: '' })
  const [pendingOrder, setPendingOrder] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [p, f] = await Promise.all([getPayments(), getFriends()])
      setPayments(p.data.data || [])
      setFriends(f.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await createOrder({ receiverId: Number(form.receiverId), amount: parseFloat(form.amount), description: form.description })
      const order = res.data.data
      setPendingOrder(order)
      toast.success(`Order created: ${order.orderId}`)

      // In production: open Razorpay widget here
      // For test mode: auto-complete
      const fakePaymentId = 'pay_test_' + Date.now()
      await verifyPayment(order.paymentId, fakePaymentId)
      toast.success('Payment completed! ✅')
      setPendingOrder(null); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const statusIcon = s => s === 'COMPLETED' ? <CheckCircle size={14} color="var(--success)" />
    : s === 'PENDING' ? <Clock size={14} color="var(--warning)" />
    : <XCircle size={14} color="var(--danger)" />

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{payments.length} total payments</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Send size={16} />Send Payment</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {payments.length === 0 ? (
          <div className="empty-state"><CreditCard size={48} /><p>No payments yet</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>From / To</th><th>Amount</th><th>Status</th><th>Method</th><th>Date</th></tr></thead>
              <tbody>
                {payments.map(p => {
                  const isSender = p.sender?.id === user?.userId
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex-center gap-8">
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                            {(isSender ? p.receiver?.name : p.sender?.name)?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{isSender ? `→ ${p.receiver?.name}` : `← ${p.sender?.name}`}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: isSender ? 'var(--danger)' : 'var(--success)' }}>
                        {isSender ? '-' : '+'}{fmt(p.amount)}
                      </td>
                      <td>
                        <div className="flex-center gap-4">
                          {statusIcon(p.status)}
                          <span className={`badge ${p.status === 'COMPLETED' ? 'badge-success' : p.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.paymentMethod || 'Razorpay'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">Send Payment</h2>
            <div style={{ background: 'var(--accent-light)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--accent)' }}>
              💡 <strong>Test mode:</strong> Payment will be auto-verified. In production, Razorpay checkout opens.
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Pay To</label>
                <select className="form-select" value={form.receiverId} onChange={e => setForm(f=>({...f,receiverId:e.target.value}))} required>
                  <option value="">Select friend…</option>
                  {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" min="1" className="form-input" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Pay Now'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
