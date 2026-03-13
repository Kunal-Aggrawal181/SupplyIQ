import { useApp } from '../../App'

const PAGE_TITLES = {
  customers: 'Customer Overview',
  supplier: 'Supplier Hub',
  decisions: 'AI Decision Center',
}

export default function Topbar() {
  const { activePage, showToast, savedActions } = useApp()

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      zIndex: 40,
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -0.3 }}>
          {PAGE_TITLES[activePage]}
        </h1>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
          SupplyIQ / {PAGE_TITLES[activePage]}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Date badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: 'var(--text-2)',
          background: 'var(--surface-2)', padding: '5px 12px',
          borderRadius: 20, border: '1px solid var(--border)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          March 2026 · Dispatch Plan
        </div>



        {/* Refresh */}
        <IconBtn
          onClick={() => showToast('Data refreshed from SAP. Last sync: ' + new Date().toLocaleTimeString(), 'info')}
          title="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3" />
          </svg>
        </IconBtn>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <IconBtn
            onClick={() => showToast('3 active alerts: Semiconductor shortage, Port congestion, Q2 demand surge.', 'warning')}
            title="Notifications"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </IconBtn>
          <span style={{
            width: 7, height: 7, background: 'var(--red)', borderRadius: '50%',
            position: 'absolute', top: 4, right: 4, border: '1.5px solid var(--surface)',
          }} />
        </div>
      </div>
    </header>
  )
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-1)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
    >
      {children}
    </button>
  )
}
