import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, Cell,
} from 'recharts'
import { SUPPLIERS, SUPPLIER_DELIVERY_TREND } from '../../data/mockData'
import { SectionTitle, ChartCard } from '../shared/Toast'

const CHART_TOOLTIP = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
}

const RADAR_DATA = SUPPLIERS.map(s => ({
  supplier: s.id,
  Quality:  s.quality,
  Delivery: s.delivery,
  Cost:     s.cost,
  Risk:     s.riskScore,
}))

// For the multi-radar we need a different shape
const RADAR_AXES = [
  { month: 'Quality'  },
  { month: 'Delivery' },
  { month: 'Cost'     },
  { month: 'Risk'     },
]

export default function SupplierHubPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">

      <SectionTitle>Supplier Hub — Performance Intelligence</SectionTitle>

      {/* ── Supplier Score Cards ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {SUPPLIERS.map(s => <SupplierCard key={s.id} supplier={s} />)}
      </div>

      {/* ── Charts ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>

        {/* Delivery trend line */}
        <ChartCard title="On-Time Delivery Trend — 6 Months" subtitle="All Suppliers" height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SUPPLIER_DELIVERY_TREND} margin={{ top: 5, right: 20, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {SUPPLIERS.map(s => (
                <Line key={s.id} type="monotone" dataKey={s.id === 'SUP-C' ? 'Sup-C' : s.id === 'SUP-X' ? 'Sup-X' : s.id}
                  stroke={s.color} strokeWidth={2.5} dot={{ r: 4, fill: s.color }}
                  strokeDasharray={s.score < 6.5 ? '5 3' : undefined}
                  name={s.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Score bar chart */}
        <ChartCard title="Supplier Overall Score" subtitle="4 Suppliers" height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SUPPLIERS.map(s => ({ name: s.id, score: s.score, color: s.color }))}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 50, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-1)', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} formatter={(v) => [v + ' / 10', 'Score']} />
              <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                {SUPPLIERS.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Radar + Quote Table ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>

        {/* Radar */}
        <ChartCard title="Multi-Dimension Performance Radar" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={[
                { axis: 'Quality',  LIL: 82,  Osram: 95, C: 72, X: 48  },
                { axis: 'Delivery', LIL: 80,  Osram: 91, C: 74, X: 62  },
                { axis: 'Cost',     LIL: 85,  Osram: 80, C: 88, X: 90  },
                { axis: 'Risk',     LIL: 80,  Osram: 92, C: 65, X: 38  },
                { axis: 'Response', LIL: 75,  Osram: 88, C: 70, X: 55  },
              ]}
            >
              <PolarGrid stroke="var(--border-2)" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'var(--text-2)' }} />
              <Radar name="LIL"   dataKey="LIL"   stroke="#6366f1" fill="#6366f1" fillOpacity={0.10} strokeWidth={2} />
              <Radar name="Osram" dataKey="Osram" stroke="#10b981" fill="#10b981" fillOpacity={0.10} strokeWidth={2} />
              <Radar name="Sup-C" dataKey="C"     stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="Sup-X" dataKey="X"     stroke="#ef4444" fill="#ef4444" fillOpacity={0.06} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quote comparison table */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)', marginBottom: 14 }}>Quote Comparison Table</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Supplier', 'Unit Price', 'Lead Time', 'MOQ', 'Quality', 'Score', 'Recommendation'].map(h => (
                  <th key={h} style={{
                    fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: 0.4,
                    padding: '8px 10px', textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 10px', fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.name}
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 13, color: 'var(--text-2)' }}>{s.unitCost}</td>
                  <td style={{ padding: '10px 10px', fontSize: 13, color: 'var(--text-2)' }}>{s.leadTime}</td>
                  <td style={{ padding: '10px 10px', fontSize: 13, color: 'var(--text-2)' }}>500</td>
                  <td style={{ padding: '10px 10px', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', maxWidth: 60 }}>
                        <div style={{ height: '100%', width: s.quality + '%', background: s.quality >= 85 ? 'var(--green)' : s.quality >= 65 ? 'var(--yellow)' : 'var(--red)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{s.quality}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: s.score >= 8 ? 'var(--green)' : s.score >= 6.5 ? 'var(--yellow)' : 'var(--red)' }}>
                      {s.score}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/10</span>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      background: s.score >= 8.5 ? 'var(--green-bg)' : s.score >= 7 ? 'var(--yellow-bg)' : 'var(--red-bg)',
                      color: s.score >= 8.5 ? 'var(--green)' : s.score >= 7 ? 'var(--yellow)' : 'var(--red)',
                    }}>
                      {s.score >= 8.5 ? 'Primary' : s.score >= 7 ? 'Alternate' : 'Avoid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SupplierCard({ supplier: s }) {
  const scoreColor = s.score >= 8 ? 'var(--green)' : s.score >= 6.5 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: `1.5px solid ${s.color}25`, padding: '16px',
      boxShadow: 'var(--shadow)', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-1)' }}>{s.name}</div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: s.status === 'watch' ? 'var(--red-bg)' : 'var(--green-bg)',
            color: s.status === 'watch' ? 'var(--red)' : 'var(--green)',
            display: 'inline-block', marginTop: 4,
          }}>
            {s.status === 'watch' ? '⚠ Watch' : '✓ Active'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, letterSpacing: -1 }}>{s.score}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>/ 10</div>
        </div>
      </div>

      {[
        { label: 'Active Orders',   val: s.activeOrders },
        { label: 'Parts Supplied',  val: s.partsSupplied },
        { label: 'On-Time %',       val: s.onTimePct + '%' },
        { label: 'Lead Time',       val: s.leadTime },
      ].map(m => (
        <div key={m.label} style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, paddingBottom: 6, borderBottom: '1px solid var(--border-2)',
        }}>
          <span style={{ color: 'var(--text-3)' }}>{m.label}</span>
          <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{m.val}</span>
        </div>
      ))}

      {/* Quality bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
          <span style={{ color: 'var(--text-3)' }}>Quality</span>
          <span style={{ fontWeight: 700, color: 'var(--text-2)' }}>{s.quality}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: s.quality + '%',
            background: s.quality >= 85 ? 'var(--green)' : s.quality >= 65 ? 'var(--yellow)' : 'var(--red)',
            borderRadius: 3, transition: 'width 1s ease',
          }} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
          <span style={{ color: 'var(--text-3)' }}>Delivery</span>
          <span style={{ fontWeight: 700, color: 'var(--text-2)' }}>{s.delivery}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: s.delivery + '%',
            background: s.color, borderRadius: 3, transition: 'width 1s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
