import React, { useState, useEffect } from 'react'
import { getFriends, addFriend, getBalances, settleUp, recordTx } from '../api/friendApi'
import { Plus, UserPlus, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = n => `₹${Math.abs(Number(n || 0)).toLocaleString('en-IN')}`

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Others']

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [txForm, setTxForm] = useState({ friendId:'', amount:'', description:'', category:'Food', transactionDate: new Date().toISOString().slice(0,10), iOweFriend: false })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [fr, bl] = await Promise.all([getFriends(), getBalances()])
      setFriends(fr.data.data || [])
      setBalances(bl.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAddFriend = async e => {
    e.preventDefault(); setSaving(true)
    try { await addFriend({ name: friendName, email: friendEmail }); toast.success('Friend added!'); setFriendName(''); setFriendEmail(''); setShowAddFriend(false); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleSettle = async (friendId, friendName) => {
    if (!confirm(`Settle all debts with ${friendName}?`)) return
    try { await settleUp(friendId); toast.success(`Settled up with ${friendName}!`); load() }
    catch { toast.error('Failed') }
  }

  const handleAddTx = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await recordTx({ ...txForm, amount: parseFloat(txForm.amount), friendId: Number(txForm.friendId) })
      toast.success('Transaction recorded'); setShowAddTx(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const totalOwed = balances.filter(b => Number(b.balance) > 0).reduce((s, b) => s + Number(b.balance), 0)
  const totalOwe  = balances.filter(b => Number(b.balance) < 0).reduce((s, b) => s + Math.abs(Number(b.balance)), 0)

  return (
    <div>
      {/* Summary cards */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card stat-card" style={{ background: 'var(--accent-light)' }}>
          <div className="stat-icon" style={{ background: '#ffffff', color: 'var(--accent)' }}><ArrowUpRight size={22} /></div>
          <div>
            <div className="stat-label" style={{ color: 'var(--accent-dark)' }}>You are Owed</div>
            <div className="stat-value" style={{ color: 'var(--accent-dark)' }}>{fmt(totalOwed)}</div>
          </div>
        </div>
        <div className="card stat-card" style={{ background: 'var(--danger-bg)' }}>
          <div className="stat-icon" style={{ background: '#ffffff', color: 'var(--danger)' }}><ArrowDownRight size={22} /></div>
          <div>
            <div className="stat-label" style={{ color: 'var(--danger)' }}>You Owe</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{fmt(totalOwe)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-center gap-8" style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowAddFriend(true)}><UserPlus size={16} />Add Friend</button>
        <button className="btn btn-secondary" onClick={() => setShowAddTx(true)}><Plus size={16} />Record Transaction</button>
      </div>

      <div className="grid-2">
        {/* Friends List */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>My Friends ({friends.length})</h3>
          {loading ? <div className="spinner" /> : friends.length === 0 ? (
            <div className="empty-state"><p>No friends added yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friends.map(f => {
                const bal = balances.find(b => b.friendId === f.id)
                const amount = bal ? Number(bal.balance) : 0
                return (
                  <div key={f.id} className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 10 }}>
                    <div className="flex-center gap-12">
                      <div className="avatar">{f.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {amount !== 0 && (
                        <div style={{ fontWeight: 700, color: amount > 0 ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>
                          {amount > 0 ? '+' : '-'}{fmt(amount)}
                        </div>
                      )}
                      {amount !== 0 && (
                        <button className="btn btn-success btn-sm" style={{ marginTop: 4 }} onClick={() => handleSettle(f.id, f.name)}>
                          <CheckCircle size={12} />Settle
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Balances */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Balance Summary</h3>
          {balances.filter(b => Number(b.balance) !== 0).length === 0 ? (
            <div className="empty-state"><p>All settled up ✅</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {balances.filter(b => Number(b.balance) !== 0).map(b => (
                <div key={b.friendId} className="flex-between" style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.friendName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(b.balance) > 0 ? 'owes you' : 'you owe them'}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: Number(b.balance) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {Number(b.balance) > 0 ? '+' : '-'}{fmt(b.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddFriend(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Friend</h2>
            <form onSubmit={handleAddFriend}>
              <div className="form-group">
                <label className="form-label">Friend's Name</label>
                <input type="text" className="form-input" placeholder="John Doe"
                  value={friendName} onChange={e => setFriendName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Friend's Email (Optional)</label>
                <input type="email" className="form-input" placeholder="friend@example.com"
                  value={friendEmail} onChange={e => setFriendEmail(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddFriend(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTx && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddTx(false)}>
          <div className="modal">
            <h2 className="modal-title">Record Transaction</h2>
            <form onSubmit={handleAddTx}>
              <div className="form-group">
                <label className="form-label">Friend</label>
                <select className="form-select" value={txForm.friendId} onChange={e => setTxForm(f=>({...f,friendId:e.target.value}))} required>
                  <option value="">Select friend…</option>
                  {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={txForm.amount} onChange={e => setTxForm(f=>({...f,amount:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={txForm.transactionDate} onChange={e => setTxForm(f=>({...f,transactionDate:e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Direction</label>
                <select className="form-select" value={txForm.iOweFriend} onChange={e => setTxForm(f=>({...f,iOweFriend:e.target.value === 'true'}))}>
                  <option value="false">Friend owes me</option>
                  <option value="true">I owe friend</option>
                </select>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={txForm.category} onChange={e => setTxForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={txForm.description} onChange={e => setTxForm(f=>({...f,description:e.target.value}))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddTx(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
