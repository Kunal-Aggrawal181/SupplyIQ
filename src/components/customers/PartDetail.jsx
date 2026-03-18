import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Cell, Legend,
} from 'recharts'
import { getMonthlyTrend, getForecast } from '../../utils/partUtils'
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL, StatusPill, Btn } from '../shared/Toast'
import TakeActionDialog from '../shared/TakeActionDialog'
import BomView from './BomView'
import { useApp } from '../../App'
import { fetchPartActions, putPartActions, fetchBom } from '../../services/api'

const CHART_TOOLTIP_STYLE = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)', fontFamily: 'DM Sans, sans-serif',
}

// Simple module-level cache to prevent duplicate concurrent or redundant calls
const BOM_CACHE = {}
const ACTIONS_CACHE = {}

export default function PartDetail({ part, status, customer, monthIdx = 5, showBom = false }) {
  const { saveAction, showToast, suppliers, savedActions } = useApp()
  const [shiftedTo, setShiftedTo] = useState(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [savedSteps, setSavedSteps] = useState([])
  const [bomData, setBomData] = useState(null)
  const [bomLoading, setBomLoading] = useState(true)
  const [bomError, setBomError] = useState(null)

  const actionTaken = savedActions?.some(a => a.partCode === part.itemCode && a.type === 'ActionSteps')

  const loadSteps = useCallback(() => {
    const cacheKey = `${customer.name}-${part.itemCode}`
    
    const processActions = (actions) => {
      const allSteps = actions.flatMap(a => a.affectedParts || [])
      setSavedSteps(allSteps)
      return actions
    }

    if (ACTIONS_CACHE[cacheKey]) {
      ACTIONS_CACHE[cacheKey].then(processActions).catch(() => {})
      return
    }

    const p = fetchPartActions(customer.name, part.itemCode).then(processActions)
    ACTIONS_CACHE[cacheKey] = p
    
    p.catch(() => { })
      .finally(() => {
        setTimeout(() => { delete ACTIONS_CACHE[cacheKey] }, 10000)
      })
  }, [customer.name, part.itemCode])

  useEffect(() => {
    loadSteps()
  }, [loadSteps])

  useEffect(() => {
    const cacheKey = `${customer.id}-${part.itemCode}`
    
    if (BOM_CACHE[cacheKey]) {
      setBomLoading(true)
      BOM_CACHE[cacheKey]
        .then(data => {
          setBomData(data)
          setBomLoading(false)
        })
        .catch(err => {
          setBomError(err.message)
          setBomLoading(false)
        })
      return
    }

    setBomLoading(true)
    setBomError(null)
    setBomData(null)
    
    const p = fetchBom(customer.id, part.itemCode)
    BOM_CACHE[cacheKey] = p
    
    p.then(data => setBomData(data))
     .catch(err => setBomError(err.message))
     .finally(() => setBomLoading(false))
  }, [customer.id, part.itemCode])

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

  function handleRemoveStep(index) {
    const newSteps = savedSteps.filter((_, i) => i !== index)
    setSavedSteps(newSteps)
    const cacheKey = `${customer.name}-${part.itemCode}`
    delete ACTIONS_CACHE[cacheKey]
    putPartActions(customer.name, part.itemCode, newSteps).catch(loadSteps)
  }

  function handleEditStep(index, newValue) {
    const newSteps = savedSteps.map((s, i) => i === index ? newValue : s)
    setSavedSteps(newSteps)
    const cacheKey = `${customer.name}-${part.itemCode}`
    delete ACTIONS_CACHE[cacheKey]
    putPartActions(customer.name, part.itemCode, newSteps).catch(loadSteps)
  }

  const altSuppliers = suppliers.filter(s => s.id !== part.supplier)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">

      {!showBom && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              {(status === 'yellow' || (status === 'red' && !actionTaken)) && (
                <Btn
                  variant={status === 'red' ? 'danger' : 'warning'}
                  onClick={() => setShowActionDialog(!showActionDialog)}
                  style={{ padding: '6px 14px', fontSize: 11, borderRadius: 20 }}
                >
                  {showActionDialog ? 'Close Action' : '⚡ Take Action'}
                </Btn>
              )}
              {actionTaken && (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>✓</span> Action Taken
                </span>
              )}
              <StatusPill status={status} />

              {showActionDialog && (
                <TakeActionDialog
                  part={part}
                  customer={customer}
                  onClose={() => setShowActionDialog(false)}
                  onSaved={() => {
                    const cacheKey = `${customer.name}-${part.itemCode}`
                    delete ACTIONS_CACHE[cacheKey]
                    loadSteps()
                  }}
                />
              )}
            </div>
          </div>

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
      )}

      {/* ── Component Breakdown (BOM) ─────────── */}
      {showBom && (
        <BomView 
          customer={customer} 
          part={part} 
          bomData={bomData}
          loading={bomLoading}
          error={bomError}
        />
      )}

      {/* ── Charts row + supplier panel (hidden when BOM open) ── */}
      {!showBom && (
        <>
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
                  <Bar dataKey="plan" name="Plan" fill="rgba(99,102,241,0.60)" stroke="#6366f1" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
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
                  <Area type="monotone" dataKey="plan" name="Plan" stroke="#000000" fill="none" strokeDasharray="5 3" strokeWidth={2.5} />
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
              suppliers={suppliers}
              altSuppliers={altSuppliers}
              shiftedTo={shiftedTo}
              onShift={handleShift}
              onPrebuy={handlePrebuy}
              savedSteps={savedSteps}
              onRemoveStep={handleRemoveStep}
              onEditStep={handleEditStep}
            />
          )}

          {/* ── Green: confirmation & next forecast ─ */}
          {status === 'green' && (
            <GreenConfirmation part={part} />
          )}
        </>
      )}
    </div>
  )
}

// ── Supplier Options Panel ────────────────────────────────
function SupplierOptions({ part, status, suppliers, altSuppliers, shiftedTo, onShift, onPrebuy, savedSteps, onRemoveStep, onEditStep }) {
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

      {/* Next Steps panel — yellow shows saved steps or empty state */}
      {status === 'yellow' && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)', marginBottom: 10 }}>
            Next Steps to Convert → 🟢 Green
            {savedSteps.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 20 }}>
                {savedSteps.length} saved
              </span>
            )}
          </div>
          {savedSteps.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {savedSteps.map((step, i) => (
                <StepChip key={i} index={i} step={step} accentColor="var(--indigo)" onRemove={() => onRemoveStep(i)} onEdit={v => onEditStep(i, v)} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
              No action steps saved yet — click ⚡ Take Action above to add steps.
            </div>
          )}
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

      {/* Saved steps for red parts too */}
      {status === 'red' && savedSteps.length > 0 && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px', marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)', marginBottom: 10 }}>
            Actions Taken
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: 20 }}>
              {savedSteps.length} steps
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {savedSteps.map((step, i) => (
              <StepChip key={i} index={i} step={step} accentColor="var(--red)" onRemove={() => onRemoveStep(i)} onEdit={v => onEditStep(i, v)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step Chip ─────────────────────────────────────────────
function StepChip({ index, step, accentColor, onRemove, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(step)

  function handleSave() {
    const trimmed = val.trim()
    if (trimmed && trimmed !== step) onEdit(trimmed)
    else setVal(step)
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setVal(step); setEditing(false) }
  }

  const badgeStyle = {
    width: 20, height: 20, borderRadius: '50%', background: accentColor,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 800, flexShrink: 0,
  }

  if (editing) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', border: `1.5px solid var(--indigo)`,
        borderRadius: 9, padding: '6px 10px',
      }}>
        <span style={badgeStyle}>{index + 1}</span>
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 12, color: 'var(--text-1)', minWidth: 120,
            fontFamily: 'inherit',
          }}
        />
        <button
          onMouseDown={e => { e.preventDefault(); handleSave() }}
          title="Save"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 13, padding: '0 2px', lineHeight: 1 }}
        >✓</button>
        <button
          onMouseDown={e => { e.preventDefault(); setVal(step); setEditing(false) }}
          title="Cancel"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 11, padding: '0 2px', lineHeight: 1 }}
        >✕</button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 9, padding: '8px 46px 8px 12px',
      fontSize: 12, color: 'var(--text-1)',
    }}>
      <span style={badgeStyle}>{index + 1}</span>
      <span>{step}</span>
      <button
        onClick={() => setEditing(true)}
        title="Edit step"
        style={{
          position: 'absolute', top: 4, right: 22,
          width: 16, height: 16, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: 'var(--surface-2)', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, lineHeight: 1, padding: 0,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--indigo)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
      >✎</button>
      <button
        onClick={onRemove}
        title="Remove step"
        style={{
          position: 'absolute', top: 4, right: 4,
          width: 16, height: 16, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: 'var(--surface-2)', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 900, lineHeight: 1, padding: 0,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
      >✕</button>
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
      padding: '14px', background: isCurrent ? 'rgba(99,102,241,0.04)' : isShifted ? 'rgba(12,234,108,0.05)' : 'var(--surface-2)',
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
      background: 'rgba(12,234,108,0.06)', borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(12,234,108,0.20)',
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
