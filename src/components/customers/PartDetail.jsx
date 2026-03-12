import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Cell, Legend,
} from 'recharts'
import { getMonthlyTrend, getForecast, YELLOW_STEPS } from '../../utils/partUtils'
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL, StatusPill, Btn } from '../shared/Toast'
import { useApp } from '../../App'

const CHART_TOOLTIP_STYLE = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)', fontFamily: 'DM Sans, sans-serif',
}

export default function PartDetail({ part, status, customer, monthIdx = 5 }) {
  const { saveAction, showToast, suppliers } = useApp()
  const [shiftedTo, setShiftedTo] = useState(null)

  const monthlyTrend = getMonthlyTrend(part, monthIdx)
  const forecast = getForecast(part, monthIdx)

  function handleShift(supplier) {
    setShiftedTo(supplier.id)
    saveAction({
      type: 'SupplierShift',
      label: `Shift ${part.itemCode} → ${supplier.name}`,
      partCode: part.itemCode,
      partDesc: part.desc,
      customer: customer.name,
      fromSupplier: part.supplier,
      toSupplier: supplier.name,
      supplierId: supplier.id,
    })
  }

  function handlePrebuy() {
    saveAction({
      type: 'PreBuy',
      label: `Pre-buy order for ${part.itemCode}`,
      partCode: part.itemCode,
      customer: customer.name,
      quantity: part.balance,
    })
    showToast('Pre-buy recommendation queued for approval.', 'info')
  }

  const altSuppliers = suppliers.filter(s => s.id !== part.supplier)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">

      {/* ── Part header ──────────────────────── */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${STATUS_COLOR[status]}35`,
        borderLeft: `4px solid ${STATUS_COLOR[status]}`,
        padding: '14px 18px', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-1)', letterSpacing: -0.4 }}>{part.itemCode}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.4 }}>{part.desc}</div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* KPI chips */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Supplier', val: part.supplier, color: 'var(--indigo)' },
            { label: 'Schedule N', val: part.scheduleN, color: 'var(--text-1)' },
            { label: 'Dispatched', val: part.dispatched, color: STATUS_COLOR[status] },
            { label: 'Balance', val: part.balance, color: part.balance > 0 ? 'var(--yellow)' : 'var(--green)' },
            { label: 'Gap', val: part.gap, color: part.gap >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: '% Complete', val: `${part.pct.toFixed(1)}%`, color: 'var(--purple)' },
            { label: 'Lead Time', val: `${part.leadTime}d`, color: 'var(--text-2)' },
            { label: 'Unit Cost', val: `₹${part.unitCost}`, color: 'var(--text-2)' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: m.color, letterSpacing: -0.5 }}>{m.val}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts row ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Actual vs Plan - Monthly */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)', marginBottom: 14 }}>
            Actual vs Plan — Monthly Trend
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="plan" name="Plan" fill="rgba(99,102,241,0.20)" stroke="#6366f1" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={STATUS_COLOR[status]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Forecast */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)' }}>6-Month Forecast</div>
            <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>
              ML Model
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={forecast} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`fgrad-${part.itemCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={`agrad-${part.itemCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STATUS_COLOR[status]} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={STATUS_COLOR[status]} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="plan" name="Plan" stroke="#cbd5e1" fill="none" strokeDasharray="5 3" strokeWidth={1.5} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke={STATUS_COLOR[status]} fill={`url(#agrad-${part.itemCode})`} strokeWidth={2.5} dot={{ r: 4, fill: STATUS_COLOR[status] }} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#6366f1" fill={`url(#fgrad-${part.itemCode})`} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Supplier options (yellow + red) ──── */}
      {(status === 'yellow' || status === 'red') && (
        <SupplierOptions
          part={part}
          status={status}
          altSuppliers={altSuppliers}
          shiftedTo={shiftedTo}
          onShift={handleShift}
          onPrebuy={handlePrebuy}
        />
      )}

      {/* ── Green: confirmation & next forecast ─ */}
      {status === 'green' && (
        <GreenConfirmation part={part} />
      )}
    </div>
  )
}

// ── Supplier Options Panel ────────────────────────────────
function SupplierOptions({ part, status, altSuppliers, shiftedTo, onShift, onPrebuy }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: `1px solid ${STATUS_COLOR[status]}25`,
      padding: '16px 18px', boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 14 }}>
        {status === 'red' ? '🔴 Supplier Options — Action Required' : '🟡 In-Process: Supplier Status & Actions'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {/* Current supplier card */}
        <SupplierCard supplier={suppliers.find(s => s.id === part.supplier) || { id: part.supplier, name: part.supplier, score: 7, leadTime: '14d', unitCost: `₹${part.unitCost}/u`, quality: 75, delivery: 75, risk: 'Med', color: '#6366f1' }} isCurrent shiftedTo={shiftedTo} />

        {/* Alternate suppliers */}
        {altSuppliers.slice(0, 2).map(sup => (
          <SupplierCard key={sup.id} supplier={sup} isCurrent={false} shiftedTo={shiftedTo} onShift={onShift} status={status} />
        ))}
      </div>

      {/* Action steps */}
      {status === 'yellow' && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)', marginBottom: 10 }}>
            Next Steps to Convert → 🟢 Green
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {YELLOW_STEPS.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 9, padding: '8px 12px', fontSize: 12, color: 'var(--text-2)',
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--indigo)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'red' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Btn variant="danger" onClick={onPrebuy}>
            ⚡ Raise Pre-Buy Order
          </Btn>
          <Btn variant="ghost" onClick={() => { }}>
            📋 Escalate to Manager
          </Btn>
        </div>
      )}
    </div>
  )
}

function SupplierCard({ supplier, isCurrent, shiftedTo, onShift, status }) {
  const isShifted = shiftedTo === supplier.id
  const scoreColor = supplier.score >= 8 ? 'var(--green)' : supplier.score >= 6.5 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div style={{
      border: `1.5px solid ${isCurrent ? '#6366f140' : isShifted ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '14px', background: isCurrent ? 'rgba(99,102,241,0.04)' : isShifted ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-1)' }}>{supplier.name}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: scoreColor }}>{supplier.score}</div>
      </div>

      {isCurrent && (
        <span style={{ fontSize: 9.5, background: '#6366f1', color: '#fff', borderRadius: 20, padding: '2px 7px', fontWeight: 800, display: 'inline-block', marginBottom: 8 }}>
          CURRENT
        </span>
      )}
      {isShifted && (
        <span style={{ fontSize: 9.5, background: 'var(--green)', color: '#fff', borderRadius: 20, padding: '2px 7px', fontWeight: 800, display: 'inline-block', marginBottom: 8 }}>
          ✓ SHIFT SAVED
        </span>
      )}

      {[
        { label: 'Lead Time', val: supplier.leadTime },
        { label: 'Cost', val: supplier.unitCost },
        { label: 'Quality', val: supplier.quality + '%' },
        { label: 'Delivery', val: supplier.delivery + '%' },
        { label: 'Risk', val: supplier.risk },
      ].map(m => (
        <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingBottom: 5, borderBottom: '1px solid var(--border-2)' }}>
          <span style={{ color: 'var(--text-3)' }}>{m.label}</span>
          <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{m.val}</span>
        </div>
      ))}

      {/* Quality bar */}
      <div style={{ marginTop: 10 }}>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: supplier.quality + '%',
            background: supplier.quality >= 85 ? 'var(--green)' : supplier.quality >= 65 ? 'var(--yellow)' : 'var(--red)',
            borderRadius: 3,
          }} />
        </div>
      </div>

      {!isCurrent && !isShifted && onShift && (
        <Btn
          variant={status === 'red' ? 'danger' : 'warning'}
          onClick={() => onShift(supplier)}
          style={{ width: '100%', marginTop: 12, fontSize: 12 }}
        >
          Shift to {supplier.name}
        </Btn>
      )}
    </div>
  )
}

// ── Green: all-good confirmation panel ───────────────────
function GreenConfirmation({ part }) {
  return (
    <div style={{
      background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(16,185,129,0.20)',
      padding: '16px 20px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)', marginBottom: 12 }}>
        ✓ This part is on track — No action needed
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'Dispatch % vs Schedule', val: `${part.pct.toFixed(1)}%` },
          { label: 'Supplier', val: part.supplier },
          { label: 'Lead Time', val: `${part.leadTime} days` },
          { label: 'MOQ', val: part.moq },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--green)' }}>{m.val}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
