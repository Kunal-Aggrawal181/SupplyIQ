import { useState, useEffect } from 'react'
import { MONTHS, useApp } from '../../App'
import { fetchKpis } from '../../services/api'
import { KpiCard, SectionTitle } from '../shared/Toast'
import CustomerCircle from './CustomerCircle'
import CustomerDrilldown from './CustomerDrilldown'

export default function CustomerOverviewPage() {
  const { 
    customers, customersLoading, 
    selectedCustomer, setSelectedCustomer,
    selectedMonthIdx, setSelectedMonthIdx
  } = useApp()
  
  const [initialStatus, setInitialStatus] = useState(null)
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
      <CustomerDrilldown
        customer={selectedCustomer}
        month={currentMonth.label}
        monthIdx={selectedMonthIdx}
        initialStatus={initialStatus}
      />
    )
  }

  function handleSelectCustomer(customer, status) {
    setSelectedCustomer(customer);
    setInitialStatus(status);
  }

  const allCustomers = [...customers];
  const greenParts = allCustomers.reduce((acc, c) => acc + (c.green || 0), 0);
  const yellowParts = allCustomers.reduce((acc, c) => acc + (c.yellow || 0), 0);
  const redParts = allCustomers.reduce((acc, c) => acc + (c.red || 0), 0);

  const ORDER = ['maruti', 'kia', 'tata', 'honda', 'hyundai'];
  const sortedCustomers = allCustomers.sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    let aIndex = ORDER.findIndex(k => aName.includes(k));
    let bIndex = ORDER.findIndex(k => bName.includes(k));
    if (aIndex === -1) aIndex = 999;
    if (bIndex === -1) bIndex = 999;
    return aIndex - bIndex;
  });

  const totalPartsSum = sortedCustomers.reduce((acc, c) => acc + (c.totalParts || c.parts_count || 0), 0);

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
          <KpiCard value={greenParts} label="Green — On Track" sub="No action needed" color="var(--green)" />
          <KpiCard value={yellowParts} label="Yellow — In Process" sub="Monitor closely" color="var(--yellow)" />
          <KpiCard value={redParts} label="Red — Action Needed" sub="Immediate attention" color="var(--red)" />
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
