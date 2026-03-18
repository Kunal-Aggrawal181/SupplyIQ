import { useState, useEffect } from 'react'
import { fetchBom } from '../../services/api'

const PALETTE = [
  '#6366f1', '#0cea6c', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7',
]

export default function BomView({ customer, part }) {
  const [bomData, setBomData]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeCategory, setActiveCategory] = useState(0)
  const [viewType, setViewType] = useState('visual') // 'visual' or 'table'
  const [shiftedParts, setShiftedParts] = useState({}) // item_id -> manufacturer_id

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchBom(customer.id, part.itemCode)
      .then(data => {
        setBomData(data)
        setActiveCategory(0)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [customer.id, part.itemCode])

  if (loading) {
    return (
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontSize: 13, gap: 10, minHeight: 400,
      }}>
        <span style={{ fontSize: 20 }}>⏳</span> Loading component breakdown…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: 40,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', color: 'var(--red)', fontSize: 13, gap: 8, minHeight: 400,
      }}>
        <span style={{ fontSize: 24 }}>⚠</span>
        <strong>Failed to load BOM data</strong>
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{error}</span>
      </div>
    )
  }

  const categories = bomData?.bom_categories ?? []
  const currentCat = categories[activeCategory]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header banner with Category Filter */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔩</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-1)' }}>
              Component Breakdown — {part.itemCode}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>
              {categories.reduce((s, c) => s + c.items.length, 0)} total components · {part.desc}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Category:</span>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(Number(e.target.value))}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '5px 12px', fontSize: 11.5, fontWeight: 700,
                color: 'var(--text-1)', cursor: 'pointer', outline: 'none',
              }}
            >
              {categories.map((c, i) => (
                <option key={i} value={i}>{c.name} ({c.items.length})</option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* View Toggle */}
          <div style={{
            display: 'flex', background: 'var(--surface-2)', padding: 2,
            borderRadius: 8, border: '1px solid var(--border)',
          }}>
            {['visual', 'table'].map(type => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                style={{
                  padding: '3px 10px', border: 'none', borderRadius: 6,
                  fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                  background: viewType === type ? 'var(--surface)' : 'transparent',
                  color: viewType === type ? 'var(--indigo)' : 'var(--text-3)',
                  boxShadow: viewType === type ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s', textTransform: 'capitalize',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {currentCat && (
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '12px',
          boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column',
          minHeight: 0, overflow: 'hidden',
        }}>
          <div style={{ overflowY: 'auto', maxHeight: 600, paddingRight: 4 }}>
            {viewType === 'table' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                    {['#', 'Description', 'Ref. Designators', 'SAP Code', 'Qty/PCB', 'UOM', 'Manufacturers'].map(h => (
                      <th key={h} style={{
                        padding: '8px 10px', textAlign: 'left', fontSize: 10.5,
                        fontWeight: 700, color: 'var(--text-3)',
                        textTransform: 'uppercase', letterSpacing: 0.4,
                        borderBottom: '2px solid var(--border)',
                        background: 'var(--surface)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentCat.items.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-2)' }}
                    >
                      <td style={{ padding: '10px 10px', color: 'var(--text-3)', fontWeight: 600, width: 32 }}>
                        {item.sr_no}
                      </td>
                      <td style={{ padding: '10px 10px', fontWeight: 600, color: 'var(--text-1)', maxWidth: 160 }}>
                        {item.item_description}
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {item.reference_designators.map(ref => (
                            <span key={ref} style={{
                              fontSize: 10, padding: '1px 6px', borderRadius: 4,
                              background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)',
                              fontWeight: 700, fontFamily: 'monospace',
                            }}>{ref}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {item.sap_codes.map(code => (
                            <span key={code} style={{
                              fontSize: 11, fontWeight: 700, color: 'var(--text-1)',
                              fontFamily: 'monospace', letterSpacing: 0.3,
                            }}>{code}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 13, fontWeight: 900, color: PALETTE[activeCategory % PALETTE.length],
                        }}>{item.quantity_per_pcb}</span>
                      </td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-3)', fontSize: 11 }}>
                        {item.uom}
                      </td>
                      <td style={{ padding: '10px 10px', maxWidth: 200 }}>
                        {item.alternate_parts.map(ap => (
                          <div key={ap.id} style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-1)' }}>
                              {ap.manufacturer}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '30px 20px', padding: '12px 6px'
              }}>
                {currentCat.items.map((item) => (
                  <ComponentTreeFlow
                    key={item.id}
                    item={item}
                    color={PALETTE[activeCategory % PALETTE.length]}
                    selectedMfrId={shiftedParts[item.id]}
                    onShift={(mfrId) => setShiftedParts(prev => ({ ...prev, [item.id]: mfrId }))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ComponentTreeFlow({ item, color, onShift, selectedMfrId }) {
  const mfrs = item.alternate_parts || []
  const activeMfrId = selectedMfrId || (mfrs.length > 0 ? mfrs[0].id : null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      {/* Super Mini Component Node */}
      <div style={{
        width: 100, flexShrink: 0, background: 'var(--surface)',
        borderRadius: 8, border: `1.2px solid ${color}`,
        padding: '5px 8px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', zIndex: 2,
        position: 'relative',
      }}>
        <div style={{ fontWeight: 800, fontSize: 9, color: 'var(--text-1)', marginBottom: 2, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.item_description}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 6.5, color: 'var(--text-3)', fontFamily: 'monospace' }}>{item.sap_codes[0]}</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10.5, fontWeight: 900, color: color }}>{item.quantity_per_pcb}</span>
            <span style={{ fontSize: 6, fontWeight: 800, color: 'var(--text-3)', marginLeft: 1 }}>{item.uom}</span>
          </div>
        </div>
      </div>

      {/* Connection Lines */}
      <div style={{ width: 35, flexShrink: 0, position: 'relative' }}>
        <svg width="35" height={mfrs.length * 50} style={{ overflow: 'visible' }}>
          {mfrs.map((m, i) => {
            const yStart = (mfrs.length * 50) / 2
            const yEnd = (i * 50) + 25
            const isSelected = activeMfrId === m.id
            return (
              <path
                key={i}
                d={`M 0 ${yStart} C 18 ${yStart}, 18 ${yEnd}, 35 ${yEnd}`}
                fill="none"
                stroke={isSelected ? 'var(--indigo)' : 'var(--text-3)'}
                strokeWidth={isSelected ? 3 : 1}
                strokeDasharray={isSelected ? 'none' : '2 2'}
                style={{ transition: 'all 0.3s ease', opacity: isSelected ? 1 : 0.4 }}
              />
            )
          })}
        </svg>
      </div>

      {/* Mini Manufacturer Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {mfrs.map((mfr) => {
          const isSelected = activeMfrId === mfr.id
          return (
            <div
              key={mfr.id}
              style={{
                width: 240, background: isSelected ? 'var(--indigo-bg)' : 'var(--surface)',
                borderRadius: 6, border: `1px solid ${isSelected ? 'var(--indigo)' : 'var(--border)'}`,
                padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: isSelected ? '0 3px 8px rgba(99,102,241,0.06)' : 'var(--shadow-sm)',
                transition: 'all 0.2s', position: 'relative',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 9, color: isSelected ? 'var(--indigo)' : 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mfr.manufacturer}
                </div>
                <div style={{ fontSize: 7.5, color: 'var(--text-3)', fontFamily: 'monospace' }}>PN: {mfr.mfr_part_no}</div>
              </div>
              <button
                onClick={() => onShift(mfr.id)}
                disabled={isSelected && selectedMfrId === mfr.id}
                style={{
                  padding: '2px 6px', borderRadius: 4,
                  background: isSelected ? 'var(--green-bg)' : 'var(--surface-2)',
                  color: isSelected ? 'var(--green)' : 'var(--text-2)',
                  fontSize: 7.5, fontWeight: 800, cursor: (isSelected && selectedMfrId === mfr.id) ? 'default' : 'pointer',
                  border: `1px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap', marginLeft: 6
                }}
              >
                {isSelected ? 'Pipeline' : 'Shift'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
