import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Legend,
} from 'recharts'
import { STATUS_COLOR, StatusPill, Btn } from '../shared/Toast'
import TakeActionDialog from '../shared/TakeActionDialog'
import { useApp } from '../../App'
import { fetchPartActions, putPartActions, fetchBom, fetchPartDetail } from '../../services/api'
import ComponentGrid from './ComponentGrid'
import { getPartBarGraphData, getForecast } from '../../data/mockData'

const CHART_TOOLTIP_STYLE = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)', fontFamily: 'DM Sans, sans-serif',
}

// Simple module-level cache to prevent duplicate concurrent or redundant calls
const BOM_CACHE = {}
const ACTIONS_CACHE = {}

export default function PartDetail({ part, status, customer, month, monthIdx = 5 }) {
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
      ACTIONS_CACHE[cacheKey].then(processActions).catch(() => { })
      return
    }

    const p = fetchPartActions(customer.name, part.itemCode).then(processActions)
    ACTIONS_CACHE[cacheKey] = p

    p.catch(err => {
      console.error('Failed to load steps:', err)
      delete ACTIONS_CACHE[cacheKey]
    })
  }, [customer.name, part.itemCode])

  useEffect(() => {
    loadSteps()
    setShiftedTo(null)

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
  }, [customer.id, part.itemCode, loadSteps])

  const barData = getPartBarGraphData(part, monthIdx)
  const forecastData = getForecast(part, monthIdx)

  function handleShift(supplier) {
    setShiftedTo(supplier.id)
    saveAction({
      type: 'SupplierShift',
      label: `Shift ${part.itemCode} → ${supplier.name}`,
      partCode: part.itemCode,
      partDesc: part.desc,
      customer: customer.name,
    })
    showToast(`Strategic supplier shift to ${supplier.name} saved.`, 'success')
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
      {/* ── Visual Summary Section ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* N-3 Bar Graph: Actual vs Client Forecast */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Demand Analysis — N-3 Context</div>
            <span style={{ fontSize: 9, background: 'var(--surface-2)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
              Forecast vs Actual
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Bar name="Forecast" dataKey="forecast" fill="var(--indigo)30" radius={[2, 2, 0, 0]} />
              <Bar name="Actual" dataKey="actual" fill="var(--indigo)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Trend / Forecast Card (Reverted) */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)' }}>6-Month Forecast Perspective</div>
            <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>
              ML Forecast
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`fgrad-${part.itemCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={`agrad-${part.itemCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--indigo)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--indigo)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="plan" name="Plan" stroke="#000000" fill="none" strokeDasharray="5 3" strokeWidth={2.5} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--indigo)" fill={`url(#agrad-${part.itemCode})`} strokeWidth={2.5} dot={{ r: 4, fill: 'var(--indigo)' }} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#6366f1" fill={`url(#fgrad-${part.itemCode})`} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Component Dependency Grid ─────────── */}
      <ComponentGrid customerId={customer.id} partId={part.id} month={month} part={part} customer={customer} />
    </div>
  )
}
