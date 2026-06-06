import React, { useState, useEffect } from 'react'
import { getDashboard } from '../api/dashboardApi'
import { useAuth } from '../context/AuthContext'
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const CATEGORY_COLORS = {
  Food: '#f59e0b', Travel: '#3b82f6', Bills: '#8b5cf6',
  Shopping: '#ec4899', Entertainment: '#22c55e', Others: '#64748b'
}

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  const stats = [
    { label: 'Total Expenses', value: fmt(data?.totalExpensesThisMonth), icon: TrendingUp, color: '#1a6b3c', bg: '#dcfce7', change: data?.totalExpensesLastMonth > 0 ? `vs ${fmt(data?.totalExpensesLastMonth)} last month` : null },
    { label: 'Wallet Balance', value: fmt(data?.walletBalance), icon: Wallet, color: '#16a34a', bg: '#d1fae5' },
    { label: 'You are Owed', value: fmt(data?.totalOwed), icon: ArrowUpRight, color: '#0d9488', bg: '#ccfbf1' },
    { label: 'You Owe', value: fmt(data?.totalOwe), icon: ArrowDownRight, color: '#dc2626', bg: '#fee2e2' },
  ]

  const pieData = Object.entries(data?.categoryBreakdown || {}).map(([name, value]) => ({ name, value: Number(value) }))
  const monthlyData = (data?.monthlyData || []).map(m => ({ month: m.month, amount: Number(m.amount) }))

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Hey, {user?.name?.split(' ')[0]} 👋</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Here's your financial overview</div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="card stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              {s.change && <div className="stat-change" style={{ color: 'var(--text-muted)' }}>{s.change}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Spending</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a6b3c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a6b3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={v => [fmt(v), 'Spent']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="amount" stroke="#1a6b3c" strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No expense data yet</p></div>}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Category Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false} fontSize={11}>
                  {pieData.map(e => (
                    <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || '#1a6b3c'} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [fmt(v), '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No categories yet</p></div>}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid-2">
        {/* Recent Expenses */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Expenses</h3>
          {data?.recentExpenses?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentExpenses.map(e => (
                <div key={e.id} className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 10 }}>
                  <div className="flex-center gap-12">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[e.category] || '#6366f1' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.category} · {e.expenseDate}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(e.amountInr)}</div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No expenses yet</p></div>}
        </div>

        {/* Friend Balances */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Friend Balances</h3>
          {data?.friendBalances?.filter(b => b.balance !== 0)?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.friendBalances.filter(b => Number(b.balance) !== 0).map(b => (
                <div key={b.friendId} className="flex-between" style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 10 }}>
                  <div className="flex-center gap-12">
                    <div className="avatar">{b.friendName?.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{b.friendName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(b.balance) > 0 ? 'owes you' : 'you owe'}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: Number(b.balance) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {Number(b.balance) > 0 ? '+' : ''}{fmt(Math.abs(b.balance))}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>All settled up! ✅</p></div>}
        </div>
      </div>
    </div>
  )
}
