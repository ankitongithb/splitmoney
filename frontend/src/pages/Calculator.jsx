import React, { useState, useEffect } from 'react'
import { getRates } from '../api/expenseApi'
import { ArrowRightLeft, DollarSign } from 'lucide-react'

export default function Calculator() {
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('100')
  const [fromCurr, setFromCurr] = useState('USD')
  const [toCurr, setToCurr] = useState('INR')

  useEffect(() => {
    getRates()
      .then(res => setRates(res.data.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const currencies = Object.keys(rates).sort()

  const calculate = () => {
    if (!amount || isNaN(amount) || !rates[fromCurr] || !rates[toCurr]) return '0.00'
    const inrVal = parseFloat(amount) * rates[fromCurr]
    const finalVal = inrVal / rates[toCurr]
    return finalVal.toFixed(2)
  }

  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg"/></div>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>Exchange Calculator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Real-time conversion using system rates</p>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center' }}>
          
          {/* From */}
          <div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}><DollarSign size={16}/></span>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: 36, fontSize: 18, fontWeight: 600 }}
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <select className="form-select" style={{ fontSize: 16 }} value={fromCurr} onChange={e => setFromCurr(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className="btn btn-ghost" 
              style={{ padding: 12, borderRadius: '50%', background: 'var(--bg-input)' }}
              onClick={handleSwap}
            >
              <ArrowRightLeft size={20} color="var(--accent)"/>
            </button>
          </div>

          {/* To */}
          <div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Converted Amount</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', background: 'var(--bg-app)', border: '1px solid transparent' }}
                value={calculate()} 
                readOnly 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <select className="form-select" style={{ fontSize: 16 }} value={toCurr} onChange={e => setToCurr(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

        </div>

        <div style={{ marginTop: 32, padding: 16, background: 'var(--accent-light)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Indicative Exchange Rate</div>
          <div style={{ fontSize: 16, color: 'var(--text)', fontWeight: 700, marginTop: 4 }}>
            1 {fromCurr} = {((1 * rates[fromCurr]) / rates[toCurr]).toFixed(4)} {toCurr}
          </div>
        </div>
      </div>
    </div>
  )
}
