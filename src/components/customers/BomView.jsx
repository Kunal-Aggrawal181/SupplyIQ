import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchBom } from '../../services/api'

const PALETTE = [
  '#6366f1', '#0cea6c', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7',
]

const CHART_TOOLTIP = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)', fontFamily: 'DM Sans, sans-serif',
}

export default function BomView({ customer, part }) {
  const [bomData, setBomData]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeCategory, setActiveCategory] = useState(0)

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
        color: 'var(--text-3)', fontSize: 13, gap: 10, minHeight: 300,
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
        justifyContent: 'center', color: 'var(--red)', fontSize: 13, gap: 8, minHeight: 300,
      }}>
        <span style={{ fontSize: 24 }}>⚠</span>
        <strong>Failed to load BOM data</strong>
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{error}</span>
      </div>
    )
  }

  const categories = bomData?.bom_categories ?? []

  // Pie chart data — number of items per category
  const pieData = categories.map((cat, i) => ({
    name: cat.name,
    value: cat.items.reduce((sum, item) => sum + item.quantity_per_pcb, 0),
    itemCount: cat.items.length,
    color: PALETTE[i % PALETTE.length],
  }))

  const currentCat = categories[activeCategory]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header banner */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: 'var(--shadow)',
      }}>
        <span style={{ fontSize: 18 }}>🔩</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-1)' }}>
            Component Breakdown — {part.itemCode}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {part.desc} · {categories.length} categories · {categories.reduce((s, c) => s + c.items.length, 0)} total components
          </div>
        </div>
      </div>

      {/* Pie chart + category selector row */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>

        {/* Pie chart */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '16px',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', marginBottom: 10 }}>
            Category Breakdown
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                onClick={(_, i) => setActiveCategory(i)}
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    opacity={activeCategory === i ? 1 : 0.45}
                    stroke={activeCategory === i ? entry.color : 'none'}
                    strokeWidth={activeCategory === i ? 2 : 0}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                formatter={(val, name, props) => [`${val} qty (${props.payload.itemCount} items)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* legend chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {pieData.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: activeCategory === i ? `${d.color}15` : 'transparent',
                  border: `1px solid ${activeCategory === i ? d.color : 'var(--border)'}`,
                  borderRadius: 8, padding: '5px 9px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: activeCategory === i ? 700 : 500, color: 'var(--text-1)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>
                  {d.itemCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Component table for selected category */}
        {currentCat && (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)', padding: '16px',
            boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>
                  {currentCat.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  {currentCat.items.length} components
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowY: 'auto', maxHeight: 420 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
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
                  {currentCat.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Sr No */}
                      <td style={{ padding: '10px 10px', color: 'var(--text-3)', fontWeight: 600, width: 32 }}>
                        {item.sr_no}
                      </td>

                      {/* Description */}
                      <td style={{ padding: '10px 10px', fontWeight: 600, color: 'var(--text-1)', maxWidth: 160 }}>
                        {item.item_description}
                      </td>

                      {/* Ref designators */}
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

                      {/* SAP Codes */}
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

                      {/* Qty/PCB */}
                      <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 13, fontWeight: 900, color: PALETTE[activeCategory % PALETTE.length],
                        }}>{item.quantity_per_pcb}</span>
                      </td>

                      {/* UOM */}
                      <td style={{ padding: '10px 10px', color: 'var(--text-3)', fontSize: 11 }}>
                        {item.uom}
                      </td>

                      {/* Manufacturers */}
                      <td style={{ padding: '10px 10px', maxWidth: 200 }}>
                        {item.alternate_parts.map(ap => (
                          <div key={ap.id} style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-1)' }}>
                              {ap.manufacturer}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 5, fontFamily: 'monospace' }}>
                              {ap.mfr_part_no}
                            </span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
