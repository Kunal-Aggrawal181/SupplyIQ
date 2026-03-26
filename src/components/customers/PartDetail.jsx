import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Scatter, Area, Cell, Legend,
} from 'recharts'
import { STATUS_COLOR, StatusPill, Btn } from '../shared/Toast'
import TakeActionDialog from '../shared/TakeActionDialog'
import { useApp } from '../../App'
import { fetchPartActions, putPartActions, fetchBom, fetchPartDetail } from '../../services/api'
import ComponentGrid from './ComponentGrid'
import { getPartBarGraphData, getForecast } from '../../data/mockData'
import { AlertTriangle } from 'lucide-react'

const CHART_TOOLTIP_STYLE = {
  fontSize: 12, borderRadius: 8, border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)', fontFamily: 'DM Sans, sans-serif',
}

// Simple module-level cache to prevent duplicate concurrent or redundant calls
const BOM_CACHE = {}
const ACTIONS_CACHE = {}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ ...CHART_TOOLTIP_STYLE, background: 'var(--surface)', padding: '10px 14px' }}>
        <div style={{ margin: '0 0 6px 0', fontWeight: 800, color: 'var(--text-1)' }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.name === 'Forecast' ? '#000000' : entry.color, fontSize: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: entry.color, borderRadius: 2 }}></span>
            <span style={{ fontWeight: 600 }}>{entry.name}:</span> {entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PartDetail({ part, status, customer, month, monthIdx = 5 }) {
  const { saveAction, showToast, suppliers, savedActions } = useApp()
  const [shiftedTo, setShiftedTo] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [savedSteps, setSavedSteps] = useState([])
  const [bomData, setBomData] = useState(null)
  const [bomLoading, setBomLoading] = useState(true)
  const [bomError, setBomError] = useState(null)

  const actionTaken = savedActions?.some(a => a.partCode === part.itemCode && a.type === 'ActionSteps')

  const loadSteps = useCallback(() => {
    const cacheKey = `${customer.name}-${part.itemCode}`

    const processActions = (actions) => {
      const allSteps = actions.flatMap(a => a.affectedParts || [])
      setSavedSteps(allSteps)
      return actions
    }

    if (ACTIONS_CACHE[cacheKey]) {
      ACTIONS_CACHE[cacheKey].then(processActions).catch(() => { })
      return
    }

    const p = fetchPartActions(customer.name, part.itemCode).then(processActions)
    ACTIONS_CACHE[cacheKey] = p

    p.catch(err => {
      console.error('Failed to load steps:', err)
      delete ACTIONS_CACHE[cacheKey]
    })
  }, [customer.name, part.itemCode])

  useEffect(() => {
    loadSteps()
    setShiftedTo(null)

    const cacheKey = `${customer.id}-${part.itemCode}`
    if (BOM_CACHE[cacheKey]) {
      setBomLoading(true)
      BOM_CACHE[cacheKey]
        .then(data => {
          setBomData(data)
          setBomLoading(false)
        })
        .catch(err => {
          setBomError(err.message)
          setBomLoading(false)
        })
      return
    }

    setBomLoading(true)
    setBomError(null)
    setBomData(null)

    const p = fetchBom(customer.id, part.itemCode)
    BOM_CACHE[cacheKey] = p

    p.then(data => setBomData(data))
      .catch(err => setBomError(err.message))
      .finally(() => setBomLoading(false))
  }, [customer.id, part.itemCode, loadSteps])

  const barData = getPartBarGraphData(part, monthIdx, customer?.name)
  const forecastData = getForecast(part, monthIdx)

  function handleShift(supplier) {
    setShiftedTo(supplier.id)
    saveAction({
      type: 'SupplierShift',
      label: `Shift ${part.itemCode} → ${supplier.name}`,
      partCode: part.itemCode,
      partDesc: part.desc,
      customer: customer.name,
    })
    showToast(`Strategic supplier shift to ${supplier.name} saved.`, 'success')
  }

  function handlePrebuy() {
    saveAction({
      type: 'PreBuy',
      label: `Pre-buy order for ${part.itemCode}`,
      partCode: part.itemCode,
      customer: customer.name,
      quantity: part.balance,
    })
    showToast('Pre-buy recommendation queued for approval.', 'info')
  }

  function handleRemoveStep(index) {
    const newSteps = savedSteps.filter((_, i) => i !== index)
    setSavedSteps(newSteps)
    const cacheKey = `${customer.name}-${part.itemCode}`
    delete ACTIONS_CACHE[cacheKey]
    putPartActions(customer.name, part.itemCode, newSteps).catch(loadSteps)
  }

  function handleEditStep(index, newValue) {
    const newSteps = savedSteps.map((s, i) => i === index ? newValue : s)
    setSavedSteps(newSteps)
    const cacheKey = `${customer.name}-${part.itemCode}`
    delete ACTIONS_CACHE[cacheKey]
    putPartActions(customer.name, part.itemCode, newSteps).catch(loadSteps)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-in">
      {selectedSupplier ? (
        <SupplierDetailsView supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      ) : (
        <>
          {/* ── Visual Summary Section ─────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* N-3 Bar Graph: Actual vs Client Forecast */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Demand Analysis — N-3 Context</div>
            <span style={{ fontSize: 9, background: 'var(--surface-2)', color: 'var(--text-3)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
              Forecast vs Actual Demand
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" xAxisId={0} tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <XAxis dataKey="month" xAxisId={1} hide />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              <Bar xAxisId={0} name="Forecast" dataKey="forecast" fill="#cbd5e1" barSize={40} radius={[2, 2, 0, 0]} />
              <Bar xAxisId={1} name="Demand" dataKey="actual" fill="#1e3a8a" barSize={20} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Trend / Forecast Card (Reverted) */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)' }}>AI Prediction Perspective</div>
            <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.10)', color: 'var(--indigo)', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>
              ML Forecast
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Scatter dataKey="actual" name="Actual Demand" fill="#000000" />
              <Line type="monotone" dataKey="forecast" name="AI Prediction" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

          {/* ── Component Dependency Grid ─────────── */}
          <ComponentGrid customerId={customer.id} partId={part.id} month={month} part={part} customer={customer} onSupplierSelect={setSelectedSupplier} />
        </>
      )}
    </div>
  )
}

function SupplierDetailsView({ supplier, onClose }) {
  const name = supplier.supplier_name || supplier.name || 'Unknown Supplier';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const n = Math.abs(hash) % 100;
  
  const overall = 82 + (n % 16);
  
  const trendData = [
    { month: 'Oct', delivered: 420 }, { month: 'Nov', delivered: 590 },
    { month: 'Dec', delivered: 480 }, { month: 'Jan', delivered: 630 },
    { month: 'Feb', delivered: Math.floor(650 + n*2) }, { month: 'Mar', delivered: Math.floor(700 + n*3) }
  ];
  const delivered = trendData.reduce((acc, curr) => acc + curr.delivered, 0).toLocaleString();

  const quality = (95 + (n % 40) / 10).toFixed(1);
  const ontime = (92 + (n % 60) / 10).toFixed(1);
  const risk = n > 75 ? 'High' : n > 35 ? 'Moderate' : 'Low';
  const capacity = 70 + (n % 25);
  const delay = n > 75 ? '+12 to +15' : n > 35 ? '+5 to +8' : '+2 to +4';
  
  const newsOptions = [
    `Geopolitical disruption signals detected on prime regional trading routes. AI predicts logistical bottlenecks extending expected lead time by approx. ${delay} days. Contingency planning advised.`,
    `Unexpected factory strikes in the supplier's primary region have severely impacted production lines. Operations expected to normalize slowly, adding ${delay} days to normal lead time.`,
    `Raw material scarcity is throttling this supplier's component manufacturing. Predictive models forecast an automatic extension of ${delay} days for all current operational orders.`,
    `Cyber-attack targeting the supplier's global logistics database has frozen outgoing shipments. While recovery operations are underway, expect transit delays of ${delay} days.`,
    `Severe weather events are currently blocking key transport highways from this supplier's main dock. AI satellite analysis suggests ${delay} days of unavoidable transit delay.`
  ];
  const aiNews = newsOptions[n % newsOptions.length];

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-1)' }}>{name}</h2>
          <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600, marginTop: 4 }}>Deep-Dive Supplier Analytics & AI Risk Forecast</div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
           <span style={{ fontSize: 18 }}>←</span> Back to Component
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Overall Score</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--indigo)' }}>{overall}/100</div>
         </div>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Delivered</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-1)' }}>{delivered}</div>
         </div>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Quality</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-1)' }}>{quality}%</div>
         </div>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>On-Time</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-1)' }}>{ontime}%</div>
         </div>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Risk Score</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: risk === 'High' ? 'var(--red)' : risk === 'Moderate' ? 'var(--yellow)' : 'var(--green)' }}>{risk}</div>
         </div>
         <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>Capacity</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-1)' }}>{capacity}%</div>
         </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
         <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16 }}>
           <h4 style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-1)' }}>6-Month Delivery Volume Trend</h4>
           <div style={{ height: 200 }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                 <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }} />
                 <Bar dataKey="delivered" name="Units Delivered" fill="var(--indigo)" radius={[4, 4, 0, 0]} barSize={30} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
         
         <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 12, padding: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
               <AlertTriangle color="var(--red)" size={20} />
               <h4 style={{ margin: 0, fontSize: 15, color: 'var(--red)', fontWeight: 900 }}>AI Simulated Intelligence</h4>
            </div>
            <p style={{ fontSize: 14, color: 'var(--red)', lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
               {aiNews}
            </p>
         </div>
      </div>
    </div>
  )
}
