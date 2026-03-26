import { useState, useEffect } from 'react'
import { fetchCustomerParts, fetchCommonality } from '../../services/api'
import { STATUS_COLOR, STATUS_BG, STATUS_BORDER, STATUS_LABEL, StatusPill } from '../shared/Toast'
import PartsList from './PartsList'
import PartDetail from './PartDetail'

const TABS = ['all', 'red', 'yellow', 'green']

export default function CustomerDrilldown({ customer, month, monthIdx, initialStatus }) {
  const color = '#000000' // Black as requested
  const [parts, setParts] = useState([])
  const [commonality, setCommonality] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommonality(customer.id)
      .then(data => {
        const dict = {}
        data.forEach(item => { dict[item.part_id] = item })
        setCommonality(dict)
      })
      .catch(err => console.error('Failed to load commonality:', err))
  }, [customer.id])

  useEffect(() => {
    setLoading(true)
    
    // Read the pre-fetched data structured during App initialization
    const data = customer.fetchedParts || []
    
    const mapped = data.map(p => {
      const gap = p.dispatched_qty - p.till_date_plan
      const balance = p.schedule_qty - p.dispatched_qty
      const pct = p.schedule_qty > 0 ? (p.dispatched_qty / p.schedule_qty) * 100 : 0
      
      const status = p.calculatedStatus || 'green';

      return {
        ...p,
        itemCode: p.part_code,
        desc: p.name,
        unitCost: p.unit_cost,
        opening: p.opening_stock,
        scheduleN: p.schedule_qty,
        dispatched: p.dispatched_qty,
        perDayPlan: p.per_day_plan,
        tillDatePlan: p.till_date_plan,
        gap,
        balance,
        pct,
        status,
        supplier: 'LIL', // Default for now
        leadTime: 14,
        moq: 500,
        common: commonality[p.id] || null
      }
    })
    setParts(mapped)
    
    if (!initialStatus) {
      if (mapped.some(p => p.status === 'red')) setActiveTab('red')
      else if (mapped.some(p => p.status === 'yellow')) setActiveTab('yellow')
      else setActiveTab('all')
    } else {
      setActiveTab(initialStatus)
    }
    
    setLoading(false)
  }, [customer.fetchedParts, initialStatus, commonality])

  const [activeTab, setActiveTab] = useState('all')
  const [selectedPart, setSelectedPart] = useState(null)

  const filteredParts = activeTab === 'all' ? parts : parts.filter(p => p.status === activeTab)
  const counts = {
    all: parts.length,
    red: parts.filter(p => p.status === 'red').length,
    yellow: parts.filter(p => p.status === 'yellow').length,
    green: parts.filter(p => p.status === 'green').length,
  }

  // Auto-select first part when opening customer drilldown or changing filters
  useEffect(() => {
    const currentFiltered = activeTab === 'all' ? parts : parts.filter(p => p.status === activeTab)
    if (currentFiltered.length > 0) {
      setSelectedPart(prev => {
        if (!prev || !currentFiltered.some(p => p.itemCode === prev.itemCode)) {
          return currentFiltered[0]
        }
        return prev
      })
    } else {
      setSelectedPart(null)
    }
  }, [activeTab, parts])

  function handleSelectPart(part) {
    setSelectedPart(part)
  }

  const displayMonth = month || 'March 2026'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">

      {/* Customer header bar */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${color}30`,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 13,
            boxShadow: `0 4px 12px ${color}40`,
          }}>
            {(customer.code || '').slice(0, 3)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>{customer.name}</div>

              {/* Integrated Status Filter beside the Name */}
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                style={{
                  background: 'var(--surface-2)', color: 'var(--text-1)',
                  border: `1.5px solid var(--border)`,
                  borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {TABS.map(t => {
                  const label = t === 'all' ? 'All Parts' : t.charAt(0).toUpperCase() + t.slice(1);
                  return (
                    <option key={t} value={t}>{label} ({counts[t]})</option>
                  );
                })}
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Dispatch Plan · {displayMonth}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Header Toggle for Part/BOM */}

          <span style={{
            fontSize: 11, background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)',
            padding: '4px 12px', borderRadius: 20, fontWeight: 700,
          }}>
            📅 {displayMonth}
          </span>
        </div>
      </div>


      {/* Split: parts list + detail */}
      <div style={{ display: 'flex', gap: 14, minHeight: 0 }}>

        {/* Parts list */}
        <div style={{ width: 400, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {loading ? (
              <div style={{ color: 'var(--text-3)', padding: 20 }}>Loading parts...</div>
            ) : (
              <PartsList
                parts={filteredParts}
                status={activeTab}
                selectedPart={selectedPart}
                onSelect={handleSelectPart}
              />
            )}
          </div>
        </div>

        {/* Part detail panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedPart ? (
            <PartDetail
              part={selectedPart}
              status={activeTab}
              customer={customer}
              month={displayMonth}
              monthIdx={monthIdx}
            />
          ) : (
            <EmptyDetail status={activeTab} />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyDetail({ status }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', height: 420,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      color: 'var(--text-3)',
    }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-2)' }}>Select a part to view details</div>
      <div style={{ fontSize: 12 }}>
        Click any <span style={{ color: STATUS_COLOR[status], fontWeight: 600 }}>{STATUS_LABEL[status]}</span> part from the list
      </div>
    </div>
  )
}
