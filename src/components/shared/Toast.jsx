// ═══════════════════════════════════════════
// Shared / reusable UI primitives
// ═══════════════════════════════════════════

export const STATUS_COLOR  = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' }
export const STATUS_BG     = { green: 'rgba(16,185,129,0.10)', yellow: 'rgba(245,158,11,0.10)', red: 'rgba(239,68,68,0.10)' }
export const STATUS_BORDER = { green: 'rgba(16,185,129,0.25)', yellow: 'rgba(245,158,11,0.25)', red: 'rgba(239,68,68,0.25)' }
export const STATUS_LABEL  = { green: 'No Action Needed', yellow: 'In Process', red: 'Action Required' }

// ── Status Pill ───────────────────────────
export function StatusPill({ status, count, size = 'md' }) {
  const sm = size === 'sm'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: STATUS_BG[status], color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_BORDER[status]}`,
      borderRadius: 20,
      padding: sm ? '2px 8px' : '3px 11px',
      fontSize: sm ? 10 : 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: sm ? 5 : 7, height: sm ? 5 : 7, borderRadius: '50%', background: STATUS_COLOR[status], flexShrink: 0 }} />
      {count !== undefined && <span>{count}</span>}
      {STATUS_LABEL[status]}
    </span>
  )
}

// ── KPI Card ──────────────────────────────
export function KpiCard({ value, label, sub, color = 'var(--indigo)', topBorder = true }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      borderTop: topBorder ? `3px solid ${color}` : '1px solid var(--border)',
      padding: '14px 16px', boxShadow: 'var(--shadow)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    >
      <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Section Title ────────────────────────
export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{children}</h2>
      {action}
    </div>
  )
}

// ── Card Shell ────────────────────────────
export function Card({ children, style = {}, padding = '16px', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding,
        boxShadow: 'var(--shadow)', ...style,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'none' }}}
    >
      {children}
    </div>
  )
}

// ── Chart Card ───────────────────────────
export function ChartCard({ title, subtitle, children, height = 200, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', padding: '16px',
      boxShadow: 'var(--shadow)', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)' }}>{title}</div>
        {subtitle && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  )
}

// ── Metric Tile ───────────────────────────
export function MetricTile({ value, label, delta, deltaDir }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', padding: '13px 15px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
      {delta && (
        <div style={{
          fontSize: 11, fontWeight: 700, marginTop: 4,
          color: deltaDir === 'up' ? 'var(--green)' : deltaDir === 'down' ? 'var(--red)' : 'var(--text-3)',
        }}>
          {deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '–'} {delta}
        </div>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────
export function Badge({ children, type = 'default' }) {
  const styles = {
    default: { bg: 'var(--surface-2)', color: 'var(--text-2)', border: 'var(--border)' },
    success: { bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(16,185,129,0.25)' },
    warning: { bg: 'var(--yellow-bg)', color: 'var(--yellow)', border: 'rgba(245,158,11,0.25)' },
    danger:  { bg: 'var(--red-bg)', color: 'var(--red)', border: 'rgba(239,68,68,0.25)' },
    indigo:  { bg: 'rgba(99,102,241,0.10)', color: 'var(--indigo)', border: 'rgba(99,102,241,0.25)' },
  }
  const s = styles[type] || styles.default
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ── Btn ───────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const base = {
    padding: '8px 18px', borderRadius: 10, border: 'none',
    fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer',
    transition: 'all 0.18s', fontFamily: 'inherit', opacity: disabled ? 0.55 : 1,
    ...style,
  }
  if (variant === 'primary')  return <button disabled={disabled} onClick={onClick} style={{ ...base, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>{children}</button>
  if (variant === 'success')  return <button disabled={disabled} onClick={onClick} style={{ ...base, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>{children}</button>
  if (variant === 'danger')   return <button disabled={disabled} onClick={onClick} style={{ ...base, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}>{children}</button>
  if (variant === 'warning')  return <button disabled={disabled} onClick={onClick} style={{ ...base, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff' }}>{children}</button>
  if (variant === 'ghost')    return <button disabled={disabled} onClick={onClick} style={{ ...base, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{children}</button>
  return <button disabled={disabled} onClick={onClick} style={base}>{children}</button>
}

// ── Toast (exported as default component too) ──
export default function Toast({ msg, type = 'info' }) {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#065f46' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#92400e' },
    info:    { bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.25)', color: '#3730a3' },
    error:   { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', color: '#991b1b' },
  }
  const c = colors[type] || colors.info
  return (
    <div className="toast" style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
    }}>
      {msg}
    </div>
  )
}
