import { useState } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { STATUS_COLOR, STATUS_BG } from '../shared/Toast'

export default function PartsList({ parts, status, selectedPart, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredParts = parts.filter(part => {
    const term = searchQuery.toLowerCase()
    return (
      part.itemCode.toLowerCase().includes(term) ||
      part.desc.toLowerCase().includes(term) ||
      (part.supplier && part.supplier.toLowerCase().includes(term))
    )
  })

  if (parts.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: 40,
        textAlign: 'center', color: 'var(--text-3)',
      }}>
        No parts in this category
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-2)',
        fontWeight: 800, fontSize: 13, color: 'var(--text-1)',
        position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[status] }} />
          {filteredParts.length} Parts
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginLeft: 2 }}>
            — click to expand details
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search part or supplier..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 30px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text-1)',
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ overflow: 'auto', maxHeight: 520 }}>
        {filteredParts.map((part, i) => {
          const isSelected = selectedPart?.itemCode === part.itemCode
          return (
            <PartRow
              key={part.itemCode + i}
              part={part}
              status={status}
              selected={isSelected}
              onClick={() => onSelect(part)}
            />
          )
        })}
      </div>
    </div>
  )
}

function PartRow({ part, status, selected, onClick }) {
  const miniData = [
    { name: 'Plan', v: part.tillDatePlan, fill: '#6366f1' },
    { name: 'Dispatched', v: part.dispatched, fill: STATUS_COLOR[status] },
  ]

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-2)',
        borderLeft: `3px solid ${selected ? STATUS_COLOR[status] : 'transparent'}`,
        background: selected ? STATUS_BG[status] : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Row top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)' }}>{part.itemCode}</div>
          <div style={{
            fontSize: 11, color: 'var(--text-3)', marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {part.desc}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>
            Supplier: <strong style={{ color: 'var(--text-2)' }}>{part.supplier}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: STATUS_COLOR[status] }}>
            {part.pct.toFixed(0)}%
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>Schedule</div>
        </div>
      </div>

      {/* Mini bar chart */}
      <div style={{ height: 44, marginTop: 6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={miniData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, Math.max(part.tillDatePlan, part.dispatched, 1) * 1.2]} />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="v" radius={[0, 4, 4, 0]}>
              {miniData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginTop: 2 }}>
        {[
          { label: 'Plan', val: part.tillDatePlan, color: '#6366f1' },
          { label: 'Actual', val: part.dispatched, color: STATUS_COLOR[status] },
          { label: 'Gap', val: part.gap, color: part.gap >= 0 ? 'var(--green)' : 'var(--red)' },
          { label: 'Balance', val: part.balance, color: part.balance > 0 ? 'var(--yellow)' : 'var(--green)' },
        ].map(m => (
          <span key={m.label} style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {m.label}: <strong style={{ color: m.color }}>{m.val}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
