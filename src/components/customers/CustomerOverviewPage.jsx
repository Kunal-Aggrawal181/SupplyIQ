import { useState, useEffect } from 'react'
import { fetchKpis } from '../../services/api'
import { KpiCard, SectionTitle } from '../shared/Toast'
import CustomerCircle from './CustomerCircle'
import CustomerDrilldown from './CustomerDrilldown'
import { useApp } from '../../App'

const MONTHS = [
  { label: 'October 2025', short: 'Oct 2025' },
  { label: 'November 2025', short: 'Nov 2025' },
  { label: 'December 2025', short: 'Dec 2025' },
  { label: 'January 2026', short: 'Jan 2026' },
  { label: 'February 2026', short: 'Feb 2026' },
  { label: 'March 2026', short: 'Mar 2026' },
]

export default function CustomerOverviewPage() {
  const { customers, customersLoading } = useApp()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [initialStatus, setInitialStatus] = useState(null)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5)
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKpis()
      .then(k => setKpis(k))
      .catch(err => console.error('Failed to load KPIs:', err))
      .finally(() => setLoading(false))
  }, [])

  // Keep selectedCustomer in sync when customers refresh after a supplier shift
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find(c => c.id === selectedCustomer.id)
      if (updated) setSelectedCustomer(updated)
    }
  }, [customers])

  const currentMonth = MONTHS[selectedMonthIdx]

  /* ── DRILLDOWN VIEW ── */
  if (selectedCustomer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-in">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <button
            onClick={() => setSelectedCustomer(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 30,
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-2)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Customers
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSelectedMonthIdx(i => Math.max(0, i - 1))}
              disabled={selectedMonthIdx === 0}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)',
                background: 'var(--surface)', color: selectedMonthIdx === 0 ? 'var(--text-3)' : 'var(--text-1)',
                cursor: selectedMonthIdx === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div style={{
              padding: '7px 20px', borderRadius: 30, background: 'var(--surface)',
              border: '1.5px solid var(--border)', fontWeight: 700, fontSize: 13,
              color: 'var(--text-1)', minWidth: 140, textAlign: 'center',
            }}>
              📅 {currentMonth.label}
            </div>

            <button
              onClick={() => setSelectedMonthIdx(i => Math.min(MONTHS.length - 1, i + 1))}
              disabled={selectedMonthIdx === MONTHS.length - 1}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)',
                background: 'var(--surface)', color: selectedMonthIdx === MONTHS.length - 1 ? 'var(--text-3)' : 'var(--text-1)',
                cursor: selectedMonthIdx === MONTHS.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div style={{ display: 'flex', gap: 5, marginLeft: 8 }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m.short}
                  onClick={() => setSelectedMonthIdx(i)}
                  style={{
                    padding: '5px 11px', borderRadius: 20,
                    border: `1.5px solid ${i === selectedMonthIdx ? 'var(--indigo)' : 'var(--border)'}`,
                    background: i === selectedMonthIdx ? 'rgba(99,102,241,0.12)' : 'var(--surface)',
                    color: i === selectedMonthIdx ? 'var(--indigo)' : 'var(--text-3)',
                    fontWeight: i === selectedMonthIdx ? 800 : 600,
                    fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                  }}
                >
                  {m.short.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CustomerDrilldown
          customer={selectedCustomer}
          month={currentMonth.label}
          monthIdx={selectedMonthIdx}
          initialStatus={initialStatus}
        />
      </div>
    )
  }

  function handleSelectCustomer(customer, status) {
    setSelectedCustomer(customer);
    setInitialStatus(status);
  }

  const allCustomers = [...customers];
  if (!allCustomers.some(c => c.name.toLowerCase().includes('hyundai'))) {
    allCustomers.push({
      id: "CUST-HYU",
      name: "Hyundai Motors",
      shortName: "Hyundai",
      code: "HYU",
      color: "#ef4444",
      totalParts: 10,
      green: 6,
      yellow: 2,
      red: 2,
      totalValue: "₹55.0L",
      onTime: "88%",
      project: "SOP",
      contactPerson: "Mock Contact",
      parts: []
    });
  }

  const ORDER = ['maruti', 'kia', 'tata', 'honda', 'hyundai'];
  const sortedCustomers = allCustomers.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    let aIndex = ORDER.findIndex(k => aName.includes(k));
    let bIndex = ORDER.findIndex(k => bName.includes(k));
    if (aIndex === -1) aIndex = 999;
    if (bIndex === -1) bIndex = 999;
    return aIndex - bIndex;
  });

  const totalPartsSum = sortedCustomers.reduce((acc, c) => acc + (c.totalParts || 0), 0);

  /* ── OVERVIEW ── */
  if (loading || customersLoading) return <div style={{ color: 'var(--text-3)', padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">

      <div>
        <SectionTitle action={
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 8, border: '1px solid #2563eb',
            background: '#2563eb', color: '#fff', fontSize: 13,
            fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Data
          </button>
        }>Executive Summary — March 2026</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <KpiCard value={totalPartsSum} label="Total Parts" sub="Across all customers" color="var(--indigo)" />
          <KpiCard value={kpis?.greenParts} label="Green — On Track" sub="No action needed" color="var(--green)" />
          <KpiCard value={kpis?.yellowParts} label="Yellow — In Process" sub="Monitor closely" color="var(--yellow)" />
          <KpiCard value={kpis?.redParts} label="Red — Action Needed" sub="Immediate attention" color="var(--red)" />
          <KpiCard value={kpis?.totalDispatchValue} label="Dispatch Value MTD" sub={(kpis?.dispatchChange ?? '') + ' vs Feb'} color="var(--purple)" />
        </div>
      </div>

      <div>
        <SectionTitle>Customer Dispatch Status — Click to Drill Down</SectionTitle>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {sortedCustomers.map(c => (
            <CustomerCircle key={c.id} customer={c} selected={false} onClick={handleSelectCustomer} />
          ))}
        </div>
      </div>
    </div>
  )
}
