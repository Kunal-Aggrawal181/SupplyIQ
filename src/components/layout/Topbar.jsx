import { useApp, MONTHS } from '../../App'

const PAGE_TITLES = {
  customers: 'Customer Overview',
  supplier: 'Supplier Hub',
  decisions: 'AI Decision Center',
}

export default function Topbar() {
  const { 
    activePage, showToast, 
    selectedCustomer, setSelectedCustomer,
    selectedMonthIdx, setSelectedMonthIdx
  } = useApp()

  const currentMonth = MONTHS[selectedMonthIdx]

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
      {/* Left section: Title + Back Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activePage === 'customers' && selectedCustomer && (
          <button
            onClick={() => setSelectedCustomer(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text-1)', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              marginRight: 6
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-1)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Customers
          </button>
        )}
        <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -0.3 }}>
          {PAGE_TITLES[activePage]}
          {activePage === 'customers' && selectedCustomer && (
            <span style={{ color: 'var(--text-3)', fontWeight: 500, fontSize: 15, margin: '0 8px' }}>/</span>
          )}
          {activePage === 'customers' && selectedCustomer && (
            <span style={{ color: 'var(--indigo)', fontWeight: 800 }}>{selectedCustomer.name}</span>
          )}
        </h1>
      </div>

      {/* Center/Right section: Month Controls + Global Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 3, marginRight: 8 }}>
            {MONTHS.map((m, i) => (
              <button
                key={m.short}
                onClick={() => setSelectedMonthIdx(i)}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  border: `1.5px solid ${i === selectedMonthIdx ? 'var(--indigo)40' : 'transparent'}`,
                  background: i === selectedMonthIdx ? 'rgba(99,102,241,0.08)' : 'transparent',
                  color: i === selectedMonthIdx ? 'var(--indigo)' : 'var(--text-3)',
                  fontWeight: i === selectedMonthIdx ? 800 : 700,
                  fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {m.short.split(' ')[0]}
              </button>
            ))}
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 4, 
            background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 20,
            border: '1px solid var(--border)'
          }}>
             <button
                onClick={() => setSelectedMonthIdx(i => Math.max(0, i - 1))}
                disabled={selectedMonthIdx === 0}
                style={{
                  width: 20, height: 20, borderRadius: '50%', border: 'none',
                  background: 'transparent', color: selectedMonthIdx === 0 ? 'var(--text-3)50' : 'var(--text-1)',
                  cursor: selectedMonthIdx === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-1)', minWidth: 80, textAlign: 'center' }}>
                {currentMonth.label}
              </span>

              <button
                onClick={() => setSelectedMonthIdx(i => Math.min(MONTHS.length - 1, i + 1))}
                disabled={selectedMonthIdx === MONTHS.length - 1}
                style={{
                  width: 20, height: 20, borderRadius: '50%', border: 'none',
                  background: 'transparent', color: selectedMonthIdx === MONTHS.length - 1 ? 'var(--text-3)50' : 'var(--text-1)',
                  cursor: selectedMonthIdx === MONTHS.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
          </div>
        </div>

        <div style={{ height: 24, width: 1, background: 'var(--border)', margin: '0 4px' }} />



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
