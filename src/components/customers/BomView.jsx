import { useState, useEffect } from 'react'

const PALETTE = [
  '#6366f1', '#0cea6c', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7',
]

export default function BomView({ customer, part, bomData, loading, error }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [viewType, setViewType] = useState('visual') // 'visual' or 'table'
  const [shiftedParts, setShiftedParts] = useState({}) // item_id -> manufacturer_id
  const [searchComponent, setSearchComponent] = useState('')
  const [searchSupplier, setSearchSupplier] = useState('')

  useEffect(() => {
    if (bomData) {
      setActiveCategory(0)
    }
  }, [bomData])

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

      {/* Search & Filter Card */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input 
            type='text' placeholder='Search Component Name...' 
            value={searchComponent} onChange={e => setSearchComponent(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🏢</span>
          <input 
            type='text' placeholder='Search Supplier / Manufacturer...' 
            value={searchSupplier} onChange={e => setSearchSupplier(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-1)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--border-2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Category:</span>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(Number(e.target.value))}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 12px', fontSize: 11.5, fontWeight: 700,
              color: 'var(--text-1)', cursor: 'pointer', outline: 'none',
            }}
          >
            {categories.map((c, i) => (
              <option key={i} value={i}>{c.name} ({c.items.length})</option>
            ))}
          </select>
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
                  {currentCat.items.filter(item => {
                    const compMatch = !searchComponent || item.item_description.toLowerCase().includes(searchComponent.toLowerCase()) || item.sap_codes.some(c => c.toLowerCase().includes(searchComponent.toLowerCase()))
                    const suppMatch = !searchSupplier || (item.alternate_parts || []).some(m => m.manufacturer.toLowerCase().includes(searchSupplier.toLowerCase()) || m.mfr_part_no.toLowerCase().includes(searchSupplier.toLowerCase()))
                    return compMatch && suppMatch
                  }).map((item) => (
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
                display: 'flex', flexDirection: 'column',
                gap: '30px', padding: '12px 6px'
              }}>
                {[...currentCat.items].sort((a, b) => {
                  if (!searchComponent && !searchSupplier) return 0;
                  const aCompMatch = !searchComponent || a.item_description.toLowerCase().includes(searchComponent.toLowerCase()) || a.sap_codes.some(c => c.toLowerCase().includes(searchComponent.toLowerCase()));
                  const aSuppMatch = !searchSupplier || (a.alternate_parts || []).some(m => m.manufacturer.toLowerCase().includes(searchSupplier.toLowerCase()) || m.mfr_part_no.toLowerCase().includes(searchSupplier.toLowerCase()));
                  const aHigh = aCompMatch && aSuppMatch;
                  
                  const bCompMatch = !searchComponent || b.item_description.toLowerCase().includes(searchComponent.toLowerCase()) || b.sap_codes.some(c => c.toLowerCase().includes(searchComponent.toLowerCase()));
                  const bSuppMatch = !searchSupplier || (b.alternate_parts || []).some(m => m.manufacturer.toLowerCase().includes(searchSupplier.toLowerCase()) || m.mfr_part_no.toLowerCase().includes(searchSupplier.toLowerCase()));
                  const bHigh = bCompMatch && bSuppMatch;
                  
                  if (aHigh && !bHigh) return -1;
                  if (!aHigh && bHigh) return 1;
                  return 0;
                }).map((item) => (
                  <ComponentTreeFlow
                    key={item.id}
                    item={item}
                    color={PALETTE[activeCategory % PALETTE.length]}
                    selectedMfrId={shiftedParts[item.id]}
                    onShift={(mfrId) => setShiftedParts(prev => ({ ...prev, [item.id]: mfrId }))}
                    searchComponent={searchComponent}
                    searchSupplier={searchSupplier}
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

function ComponentTreeFlow({ item, color, onShift, selectedMfrId, searchComponent, searchSupplier }) {
  const mfrs = item.alternate_parts || []
  const activeMfrId = selectedMfrId || (mfrs.length > 0 ? mfrs[0].id : null)

  const compMatch = !searchComponent || item.item_description.toLowerCase().includes(searchComponent.toLowerCase()) || item.sap_codes.some(c => c.toLowerCase().includes(searchComponent.toLowerCase()))
  const suppMatch = !searchSupplier || mfrs.some(m => m.manufacturer.toLowerCase().includes(searchSupplier.toLowerCase()) || m.mfr_part_no.toLowerCase().includes(searchSupplier.toLowerCase()))
  
  const isHighlighted = compMatch && suppMatch
  const opacity = isHighlighted ? 1 : 0.15

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', opacity, transition: 'opacity 0.3s', width: '100%' }}>
      {/* Super Mini Component Node */}
      <div style={{
        width: 150, flexShrink: 0, background: 'var(--surface)',
        borderRadius: 8, border: `1.2px solid ${color}`,
        padding: '10px 12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', zIndex: 2,
        position: 'relative',
      }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-1)', marginBottom: 4, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.item_description}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>{item.sap_codes[0]}</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: color }}>{item.quantity_per_pcb}</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', marginLeft: 2 }}>{item.uom}</span>
          </div>
        </div>
      </div>

      {/* Connection Lines */}
      <div style={{ flex: 1, minWidth: 40, position: 'relative' }}>
        <svg width="100%" height={mfrs.length * 60} style={{ overflow: 'visible', display: 'block' }} preserveAspectRatio="none" viewBox={`0 0 100 ${mfrs.length * 60}`}>
          {mfrs.map((m, i) => {
            const yStart = (mfrs.length * 60) / 2
            const yEnd = (i * 60) + 30
            const isSelected = activeMfrId === m.id
            return (
              <path
                key={i}
                d={`M 0 ${yStart} C 50 ${yStart}, 50 ${yEnd}, 100 ${yEnd}`}
                fill="none"
                stroke={isSelected ? 'var(--indigo)' : 'var(--text-3)'}
                strokeWidth={isSelected ? 3 : 1}
                strokeDasharray={isSelected ? 'none' : '4 4'}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'all 0.3s ease', opacity: isSelected ? 1 : 0.4 }}
              />
            )
          })}
        </svg>
      </div>

      {/* Mini Manufacturer Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 350, flexShrink: 0 }}>
        {mfrs.map((mfr) => {
          const isSelected = activeMfrId === mfr.id
          const mfrMatch = !searchSupplier || mfr.manufacturer.toLowerCase().includes(searchSupplier.toLowerCase()) || mfr.mfr_part_no.toLowerCase().includes(searchSupplier.toLowerCase())
          const borderHighlight = searchSupplier && mfrMatch && isHighlighted ? `2px solid var(--indigo)` : `1px solid ${isSelected ? 'var(--indigo)' : 'var(--border)'}`

          return (
            <div
              key={mfr.id}
              style={{
                width: '100%', background: isSelected ? 'var(--indigo-bg)' : 'var(--surface)',
                borderRadius: 6, border: borderHighlight,
                padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: isSelected ? '0 3px 8px rgba(99,102,241,0.06)' : 'var(--shadow-sm)',
                transition: 'all 0.2s', position: 'relative',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: isSelected ? 'var(--indigo)' : 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mfr.manufacturer}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace', marginTop: 2 }}>PN: {mfr.mfr_part_no}</div>
              </div>
              <button
                onClick={() => onShift(mfr.id)}
                disabled={isSelected && selectedMfrId === mfr.id}
                style={{
                  padding: '4px 10px', borderRadius: 4,
                  background: isSelected ? 'var(--green-bg)' : 'var(--surface-2)',
                  color: isSelected ? 'var(--green)' : 'var(--text-2)',
                  fontSize: 10, fontWeight: 800, cursor: (isSelected && selectedMfrId === mfr.id) ? 'default' : 'pointer',
                  border: `1px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap', marginLeft: 8
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
