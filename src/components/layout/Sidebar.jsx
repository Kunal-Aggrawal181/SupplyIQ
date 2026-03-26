import { useApp } from '../../App'
import logo from '../../Images/amlgolabslogowhite.png'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const NAV = [
  {
    id: 'customers',
    label: 'Customer Overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'supplier',
    label: 'Supplier Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'parts',
    label: 'Parts Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'AI Insights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, setSidebarCollapsed } = useApp()

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
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '20px 0' : '20px 14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transition: 'padding 0.3s ease'
      }}>
        <div style={{
          width: sidebarCollapsed ? 44 : '80%',
          height: 44,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          transition: 'width 0.3s ease'
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: sidebarCollapsed ? '100%' : '70%',
              height: '100%',
              objectFit: 'cover',
              transform: sidebarCollapsed ? 'scale(1.5)' : 'scale(1.4)'
            }}
          />
        </div>
        {!sidebarCollapsed && (
          <div style={{ textAlign: 'center' }} className="animate-in">
            <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-1)', letterSpacing: -0.6 }}>SupplyIQ</div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Intelligence Base</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
          padding: '4px 12px 8px', marginBottom: 4
        }}>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: 24, height: 24,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--indigo)'
              e.currentTarget.style.borderColor = 'var(--indigo)'
              e.currentTarget.style.background = 'var(--surface-2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
          </button>
        </div>

        {NAV.map(item => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={sidebarCollapsed ? item.label : ''}
              style={{
                display: 'flex', alignItems: 'center', 
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: sidebarCollapsed ? 0 : 12,
                padding: sidebarCollapsed ? '10px' : '10px 12px', 
                borderRadius: 12,
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                background: active ? 'var(--bg)' : 'transparent',
                color: active ? 'var(--indigo)' : 'var(--text-2)',
                fontWeight: active ? 800 : 600,
                fontSize: 13.5,
                transition: 'all 0.2s ease',
                width: '100%',
                position: 'relative'
              }}
            >
              <span style={{ 
                opacity: active ? 1 : 0.75, 
                display: 'flex', 
                transition: 'transform 0.2s ease',
                transform: active ? 'scale(1.05)' : 'scale(1)'
              }}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', textAlign: 'left' }}>{item.label}</span>}
              {active && !sidebarCollapsed && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--indigo)' }} />}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 10, padding: '8px', borderRadius: 12,
          background: !sidebarCollapsed ? 'var(--surface-2)' : 'transparent',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--indigo-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
          }}>SR</div>
          {!sidebarCollapsed && (
            <div className="animate-in" style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>Supply Team</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', fontWeight: 600 }}>Lead Architect</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

