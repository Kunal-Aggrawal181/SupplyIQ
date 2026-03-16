import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from '../shared/Toast'

export default function CustomerCircle({ customer, selected, onClick, isAggregate }) {
  const pieData = [
    { name: 'Green', value: customer.green, color: STATUS_COLOR.green },
    { name: 'Yellow', value: customer.yellow, color: STATUS_COLOR.yellow },
    { name: 'Red', value: customer.red, color: STATUS_COLOR.red },
  ].filter(d => d.value > 0)

  const borderColor = selected ? customer.color : 'var(--border)'

  return (
    <div
      onClick={() => onClick(customer)}
      style={{
        background: selected
          ? `linear-gradient(145deg, ${customer.color}10, var(--surface))`
          : 'var(--surface)',
        border: `2px solid ${borderColor}`,
        borderRadius: 20,
        padding: '18px 16px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: selected
          ? `0 8px 32px ${customer.color}25, var(--shadow-lg)`
          : 'var(--shadow)',
        transform: selected ? 'translateY(-3px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        minWidth: 210,
        maxWidth: 230,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: isAggregate
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : customer.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: -0.3,
        }}>
          {customer.code.slice(0, 3)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: 13.5, color: 'var(--text-1)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {customer.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {customer.totalParts} Parts · {customer.totalValue}
          </div>
        </div>
      </div>

      {/* Donut chart */}
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData} cx="50%" cy="50%"
              innerRadius={46} outerRadius={68}
              dataKey="value" startAngle={90} endAngle={-270}
              stroke="none" paddingAngle={pieData.length > 1 ? 2 : 0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, n) => [v + ' parts', n]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
              wrapperStyle={{ zIndex: 100 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>
            {customer.totalParts}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Parts
          </div>
        </div>
      </div>

      {/* Status pills row */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['green', 'yellow', 'red'].map(s => customer[s] > 0 && (
          <span key={s} style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
            color: STATUS_COLOR[s], fontWeight: 700,
            background: STATUS_BG[s], borderRadius: 20, padding: '2px 8px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[s] }} />
            {customer[s]}
          </span>
        ))}
      </div>

      {/* On-time delivery */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', width: '100%',
        borderTop: '1px solid var(--border-2)', paddingTop: 8, marginTop: 2,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>On-Time Delivery</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)' }}>{customer.onTime}</span>
      </div>

      {/* Click hint */}
      <div style={{
        fontSize: 10, color: selected ? customer.color : 'var(--text-3)',
        fontWeight: 600, letterSpacing: 0.3,
      }}>
        {'→ Click to open full details'}
      </div>
    </div>
  )
}
