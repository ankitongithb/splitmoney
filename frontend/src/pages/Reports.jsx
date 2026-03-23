import React, { useState } from 'react'
import { downloadExcel, downloadPdf } from '../api/reportApi'
import { FileText, FileDown, Table, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Reports() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const download = async (type) => {
    const setLoading = type === 'excel' ? setLoadingExcel : setLoadingPdf
    setLoading(true)
    try {
      const res = type === 'excel' ? await downloadExcel(month, year) : await downloadPdf(month, year)
      const ext = type === 'excel' ? 'xlsx' : 'pdf'
      const mime = type === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf'
      const blob = new Blob([res.data], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `expenses_${month}_${year}.${ext}`; a.click()
      URL.revokeObjectURL(url)
      toast.success(`${type.toUpperCase()} downloaded!`)
    } catch (err) { toast.error('Download failed') }
    finally { setLoading(false) }
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div>
      {/* Period selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Select Report Period</h3>
        <div className="flex-center gap-12">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Month</label>
            <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Year</label>
            <select className="form-select" value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Excel card */}
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Table size={32} color="#22c55e" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Excel Report</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Download all expenses for {monthNames[month-1]} {year} as a formatted Excel spreadsheet (.xlsx)
          </p>
          <button className="btn btn-success btn-lg" onClick={() => download('excel')} disabled={loadingExcel}>
            {loadingExcel ? <><div className="spinner" />Generating…</> : <><FileDown size={18} />Download Excel</>}
          </button>
        </div>

        {/* PDF card */}
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={32} color="#ef4444" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>PDF Report</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Download a clean, printable PDF report of all expenses for {monthNames[month-1]} {year}
          </p>
          <button className="btn btn-danger btn-lg" onClick={() => download('pdf')} disabled={loadingPdf}>
            {loadingPdf ? <><div className="spinner" />Generating…</> : <><FileDown size={18} />Download PDF</>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card" style={{ marginTop: 24, background: 'var(--accent-light)' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>📊 What's included in the report?</h4>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8 }}>
          ✅ All expenses for the selected month and year<br />
          ✅ Date, title, category, amount in original currency<br />
          ✅ INR equivalent amount<br />
          ✅ Expense description and notes<br />
          ✅ Formatted for easy printing or sharing
        </div>
      </div>
    </div>
  )
}
