import React, { useState, useEffect } from 'react'
import { getTrips, createTrip, getTripExpenses, addTripExpense, getTripMembers, getTripBalances, deleteTrip, addTripMember } from '../api/tripApi'
import { getFriends } from '../api/friendApi'
import { Plus, Map, Users, Trash2, UserPlus, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [showCreateTrip, setShowCreateTrip] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tripForm, setTripForm] = useState({ name:'', description:'', destination:'', startDate:'', endDate:'', memberIds:[] })
  const [expForm, setExpForm] = useState({ title:'', amount:'', currency:'INR', splitType:'EQUAL', description:'', expenseDate: new Date().toISOString().slice(0,10), paidById: '' })
  const [newMemberId, setNewMemberId] = useState('')

  useEffect(() => {
    Promise.all([getTrips(), getFriends()])
      .then(([t, f]) => { setTrips(t.data.data || []); setFriends(f.data.data || []) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const selectTrip = async trip => {
    setSelected(trip)
    const [m, e, b] = await Promise.all([getTripMembers(trip.id), getTripExpenses(trip.id), getTripBalances(trip.id)])
    setMembers(m.data.data || [])
    setExpenses(e.data.data || [])
    setBalances(b.data.data || [])
  }

  const handleCreate = async ev => {
    ev.preventDefault(); setSaving(true)
    try {
      await createTrip(tripForm)
      toast.success('Trip created!'); setShowCreateTrip(false)
      const t = await getTrips(); setTrips(t.data.data || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const exportPDF = () => {
    if (!selected || expenses.length === 0) {
      toast.error("No expenses to export")
      return
    }
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`Trip Expenses: ${selected.name}`, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Destination: ${selected.destination || 'N/A'}`, 14, 30)

    const tableData = expenses.map(e => [
      e.expenseDate,
      e.title,
      e.paidBy?.name || 'Unknown',
      e.splitType,
      parseFloat(e.amount).toFixed(2)
    ])

    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Title', 'Paid By', 'Split Type', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    })
    
    doc.setFontSize(12)
    doc.setTextColor(0)
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50
    doc.text(`Total Expense: ${parseFloat(selected.totalAmount).toFixed(2)}`, 14, finalY + 15)
    
    doc.save(`${selected.name.replace(/\s+/g, '_')}_expenses.pdf`)
  }

  const handleAddExp = async ev => {
    ev.preventDefault(); setSaving(true)
    try {
      await addTripExpense(selected.id, { ...expForm, amount: parseFloat(expForm.amount) })
      toast.success('Expense added')
      setShowAddExpense(false)
      const e = await getTripExpenses(selected.id); setExpenses(e.data.data || [])
      const b = await getTripBalances(selected.id); setBalances(b.data.data || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDeleteTrip = async () => {
    if (!confirm('Are you sure you want to delete this trip? All expenses will be deleted.')) return
    try {
      await deleteTrip(selected.id)
      toast.success('Trip deleted')
      setSelected(null)
      const t = await getTrips(); setTrips(t.data.data || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Error deleting trip') }
  }

  const handleAddMemberSubmit = async ev => {
    ev.preventDefault(); setSaving(true)
    try {
      await addTripMember(selected.id, newMemberId)
      toast.success('Member added to trip')
      setShowAddMember(false)
      const m = await getTripMembers(selected.id); setMembers(m.data.data || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Error adding member') }
    finally { setSaving(false) }
  }

  const toggleMember = id => {
    setTripForm(f => ({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter(x => x !== id) : [...f.memberIds, id] }))
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div />
        <button className="btn btn-primary" onClick={() => setShowCreateTrip(true)}><Plus size={16} />New Trip</button>
      </div>

      <div className="grid-2">
        {/* Trips list */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>My Trips</h3>
          {trips.length === 0 ? (
            <div className="card empty-state"><Map size={40} /><p>No trips yet</p></div>
          ) : trips.map(t => (
            <div key={t.id} className="card" style={{ marginBottom: 12, cursor: 'pointer', border: selected?.id === t.id ? '2px solid var(--accent)' : '1px solid var(--border)' }} onClick={() => selectTrip(t)}>
              <div className="flex-between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.destination}</div>
                  {t.startDate && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.startDate} → {t.endDate}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 18 }}>{fmt(t.totalAmount)}</div>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trip Detail */}
        <div>
          {selected ? (
            <>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700 }}>{selected.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={exportPDF}><FileDown size={14} />Export PDF</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddExpense(true)}><Plus size={14} />Add Expense</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '6px 10px' }} onClick={handleDeleteTrip}><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Members */}
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}><Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Members ({members.length})</div>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', height: 'auto', fontSize: 12 }} onClick={() => setShowAddMember(true)}><UserPlus size={14} style={{ marginRight: 4 }} />Add</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {members.map(m => (
                    <div key={m.id} className="flex-center gap-8" style={{ padding: '6px 12px', background: 'var(--bg-input)', borderRadius: 99 }}>
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 11 }}>{m.user?.name?.charAt(0)}</div>
                      <span style={{ fontSize: 13 }}>{m.user?.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balances */}
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Net Balances</div>
                {balances.length === 0 ? <div style={{ color:'var(--text-muted)', fontSize: 13 }}>No balances yet</div> :
                  balances.map(b => (
                    <div key={b.userId} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 14 }}>{b.userName}</span>
                      <span style={{ fontWeight: 700, color: Number(b.netAmount) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {Number(b.netAmount) >= 0 ? '+' : ''}{fmt(b.netAmount)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Expenses */}
              <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Expenses</div>
                {expenses.length === 0 ? <div style={{ color:'var(--text-muted)',fontSize:13 }}>No expenses yet</div> :
                  expenses.map(e => (
                    <div key={e.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Paid by {e.paidBy?.name} · {e.splitType}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(e.amount)}</div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="card empty-state"><Map size={40} /><p>Select a trip to view details</p></div>
          )}
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateTrip && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateTrip(false)}>
          <div className="modal">
            <h2 className="modal-title">Create Trip</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Trip Name</label><input className="form-input" value={tripForm.name} onChange={e => setTripForm(f=>({...f,name:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Destination</label><input className="form-input" value={tripForm.destination} onChange={e => setTripForm(f=>({...f,destination:e.target.value}))} /></div>
              <div className="form-row form-row-2">
                <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={tripForm.startDate} onChange={e => setTripForm(f=>({...f,startDate:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={tripForm.endDate} onChange={e => setTripForm(f=>({...f,endDate:e.target.value}))} /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Add Friends</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {friends.map(f => (
                    <button key={f.id} type="button"
                      className={`btn btn-sm ${tripForm.memberIds.includes(f.id) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => toggleMember(f.id)}>{f.name}</button>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateTrip(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddExpense(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Trip Expense</h2>
            <form onSubmit={handleAddExp}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={expForm.title} onChange={e => setExpForm(f=>({...f,title:e.target.value}))} required /></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={expForm.currency} onChange={e => setExpForm(f=>({...f,currency:e.target.value}))}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Amount</label><input type="number" step="0.01" className="form-input" value={expForm.amount} onChange={e => setExpForm(f=>({...f,amount:e.target.value}))} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Split Type</label>
                  <select className="form-select" value={expForm.splitType} onChange={e => setExpForm(f=>({...f,splitType:e.target.value}))}>
                    <option value="EQUAL">Equal Split</option>
                    <option value="CUSTOM">Custom Split</option>
                  </select>
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={expForm.expenseDate} onChange={e => setExpForm(f=>({...f,expenseDate:e.target.value}))} required /></div>
                <div className="form-group"><label className="form-label">Paid By</label>
                  <select className="form-select" value={expForm.paidById} onChange={e => setExpForm(f=>({...f,paidById:e.target.value}))}>
                    <option value="">Me (Current User)</option>
                    {members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddMember(false)}>
          <div className="modal">
            <h2 className="modal-title">Add Member to Trip</h2>
            <form onSubmit={handleAddMemberSubmit}>
              <div className="form-group">
                <label className="form-label">Select Friend</label>
                <select className="form-select" value={newMemberId} onChange={e => setNewMemberId(e.target.value)} required>
                  <option value="">Choose a friend...</option>
                  {friends.map(f => (
                    <option key={f.id} value={f.id} disabled={members.some(m => m.user?.id === f.id)}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
