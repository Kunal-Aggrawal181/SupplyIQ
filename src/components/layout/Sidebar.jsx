import { useApp } from '../../App'

const NAV = [
  {
    id: 'customers',
    label: 'Customer Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    badge: null,
  },
  {
    id: 'supplier',
    label: 'Supplier Hub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    badge: null,
  },
  {
    id: 'decisions',
    label: 'AI Decision Center',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    badge: 'AI',
    badgeType: 'indigo',
  },
]

export default function Sidebar() {
  const { activePage, setActivePage, savedActions } = useApp()

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 'var(--topbar-h)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-1)', letterSpacing: -0.4 }}>SupplyIQ</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6 }}>Intelligence Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 8px 6px' }}>
          Main
        </div>

        {NAV.map(item => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 10px', borderRadius: 9,
                border: active ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
                background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.06))' : 'transparent',
                color: active ? 'var(--indigo)' : 'var(--text-2)',
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.3 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 20,
                  background: item.badgeType === 'indigo' ? 'var(--indigo)' : 'var(--green)',
                  color: '#fff',
                }}>{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Action log count */}
      {savedActions.length > 0 && (
        <div style={{
          margin: '0 8px 8px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--yellow)', marginBottom: 2 }}>PENDING API SYNC</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)' }}>{savedActions.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>saved actions</div>
        </div>
      )}

      {/* User */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--indigo), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>SR</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Supply Team</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Manager · Q1 2026</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
