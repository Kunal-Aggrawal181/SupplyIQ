import { useState } from 'react'
import { STATUS_COLOR, STATUS_BG, STATUS_BORDER, STATUS_LABEL, StatusPill } from '../shared/Toast'
import PartsList from './PartsList'
import PartDetail from './PartDetail'

const TABS = ['green', 'yellow', 'red']

export default function CustomerDrilldown({ customer, month, monthIdx }) {
  const [activeTab, setActiveTab] = useState(() => {
    // default to first non-empty tab (prefer red)
    if (customer.red > 0) return 'red'
    if (customer.yellow > 0) return 'yellow'
    return 'green'
  })
  const [selectedPart, setSelectedPart] = useState(null)
  const [showBom, setShowBom] = useState(false)

  const filteredParts = customer.parts.filter(p => p.status === activeTab)

  function handleSelectPart(part) {
    setSelectedPart(prev => prev?.itemCode === part.itemCode ? null : part)
    setShowBom(false)  // reset BOM when switching part
  }

  const displayMonth = month || 'March 2026'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-in">

      {/* Customer header bar */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${customer.color}30`,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: customer.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 13,
            boxShadow: `0 4px 12px ${customer.color}40`,
          }}>
            {customer.code.slice(0, 3)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              Dispatch Plan · {displayMonth}
              {customer.contactPerson ? ` · Contact: ${customer.contactPerson}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Month badge */}
          <span style={{
            fontSize: 11, background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)',
            padding: '4px 12px', borderRadius: 20, fontWeight: 700, marginRight: 8,
          }}>
            📅 {displayMonth}
          </span>
          {TABS.map(t => customer[t] > 0 && (
            <StatusPill key={t} status={t} count={customer[t]} />
          ))}
        </div>
      </div>

      {/* Tab buttons + BOM toggle */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {TABS.map(t => {
          const count = customer[t]
          const active = activeTab === t
          return (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setSelectedPart(null); setShowBom(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 20px', borderRadius: 30,
                border: `2px solid ${active ? STATUS_COLOR[t] : 'var(--border)'}`,
                background: active ? STATUS_BG[t] : 'var(--surface)',
                color: active ? STATUS_COLOR[t] : 'var(--text-2)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[t], flexShrink: 0 }} />
              {STATUS_LABEL[t]}
              <span style={{
                background: STATUS_COLOR[t], color: '#fff',
                borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800,
              }}>{count}</span>
            </button>
          )
        })}

        {/* Segmented toggle — only when a part is selected */}
        {selectedPart && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 30,
            overflow: 'hidden',
            fontFamily: 'inherit',
          }}>
            <button
              onClick={() => setShowBom(false)}
              style={{
                padding: '7px 16px', fontSize: 12, fontWeight: 700,
                border: 'none', borderRadius: '28px 0 0 28px',
                background: !showBom ? 'var(--indigo)' : 'transparent',
                color: !showBom ? '#fff' : 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              📋 Part Summary
            </button>
            <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
            <button
              onClick={() => setShowBom(true)}
              style={{
                padding: '7px 16px', fontSize: 12, fontWeight: 700,
                border: 'none', borderRadius: '0 28px 28px 0',
                background: showBom ? 'var(--indigo)' : 'transparent',
                color: showBom ? '#fff' : 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              🔩 Component Breakdown
            </button>
          </div>
        )}
      </div>

      {/* Split: parts list + detail */}
      <div style={{ display: 'flex', gap: 14, minHeight: 0 }}>

        {/* Parts list */}
        <div style={{ width: 400, flexShrink: 0 }}>
          <PartsList
            parts={filteredParts}
            status={activeTab}
            selectedPart={selectedPart}
            onSelect={handleSelectPart}
          />
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
              showBom={showBom}
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
