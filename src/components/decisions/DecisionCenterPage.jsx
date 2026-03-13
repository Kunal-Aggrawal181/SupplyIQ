import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchAlerts } from '../../services/api'
import { SectionTitle, Btn, Badge } from '../shared/Toast'
import { useApp } from '../../App'

const SEV_COLOR = { critical: '#ef4444', warning: '#f59e0b', info: '#6366f1' }
const SEV_BG = { critical: 'rgba(239,68,68,0.08)', warning: 'rgba(245,158,11,0.08)', info: 'rgba(99,102,241,0.08)' }
const SEV_LABEL = { critical: 'Critical', warning: 'Warning', info: 'Info' }

export default function DecisionCenterPage() {
  const { saveAction, savedActions, suppliers } = useApp()
  const [alerts, setAlerts] = useState([])
  const [acted, setActed] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(err => console.error('Failed to load alerts:', err))
      .finally(() => setLoading(false))
  }, [])

  function handleApprove(alert) {
    setActed(prev => ({ ...prev, [alert.id]: 'approved' }))
    saveAction({
      type: 'AIRecommendation',
      label: `Approved: ${alert.title}`,
      alertId: alert.id,
      alertTitle: alert.title,
      action: 'APPROVE',
      fromSupplier: alert.currentSupplier,
      toSupplier: alert.altSupplier,
      supplierId: alert.altSupplierId,
      affectedParts: alert.affectedParts,
      customer: alert.affectedCustomer,
    })
  }

  function handleDismiss(alert) {
    setActed(prev => ({ ...prev, [alert.id]: 'dismissed' }))
    saveAction({
      type: 'AIRecommendation',
      label: `Dismissed: ${alert.title}`,
      alertId: alert.id,
      action: 'DISMISS',
    })
  }

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 40, textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-1)', letterSpacing: -0.5 }}>
            🤖 AI Decision Center
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
            Real-time AI recommendations based on global news, supply risk signals, and ML demand forecasts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge type="success">AI Engine: Active</Badge>
          <Badge type="indigo">{alerts.length} Active Signals</Badge>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 14 }}>Supplier Readiness — Decision Context</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={suppliers.map(s => ({ name: s.id, score: s.score, quality: s.quality, delivery: s.delivery }))} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              <Bar dataKey="quality" name="Quality %" radius={[4, 4, 0, 0]}>
                {suppliers.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
              <Bar dataKey="delivery" name="Delivery %" radius={[4, 4, 0, 0]} fill="rgba(99,102,241,0.35)" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignContent: 'start' }}>
            {suppliers.map(s => (
              <div key={s.id} style={{ background: 'var(--surface-2)', borderRadius: 10, border: `1.5px solid ${s.color}30`, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-1)' }}>{s.id}</span>
                  <span style={{ fontWeight: 900, fontSize: 16, color: s.score >= 8 ? 'var(--green)' : s.score >= 6.5 ? 'var(--yellow)' : 'var(--red)' }}>{s.score}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                  Lead: <b>{s.leadTime}</b> · Risk: <b style={{ color: s.risk === 'Low' ? 'var(--green)' : s.risk === 'Medium' ? 'var(--yellow)' : 'var(--red)' }}>{s.risk}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Live AI Recommendations — {alerts.length} Active</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            suppliers={suppliers}
            status={acted[alert.id]}
            onApprove={() => handleApprove(alert)}
            onDismiss={() => handleDismiss(alert)}
          />
        ))}
      </div>

      {savedActions.length > 0 && <ActionLog actions={savedActions} />}
    </div>
  )
}

function AlertCard({ alert, suppliers, status, onApprove, onDismiss }) {
  const [expanded, setExpanded] = useState(true)
  const color = SEV_COLOR[alert.severity]
  const altSupplierData = suppliers.find(s => s.id === alert.altSupplierId) || { name: alert.altSupplier, score: 8.2, leadTime: '14d', quality: 85, delivery: 82 }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${color}30`, borderLeft: `4px solid ${color}`, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }} onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, background: SEV_BG[alert.severity], color, padding: '2px 9px', borderRadius: 20, border: `1px solid ${color}30` }}>{SEV_LABEL[alert.severity]}</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20 }}>{alert.category}</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{alert.ts}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-1)', letterSpacing: -0.3 }}>{alert.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.55 }}>{alert.desc}</div>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 10, flexShrink: 0 }}>
          {status === 'approved' && <span style={{ fontSize: 11, background: 'var(--green-bg)', color: 'var(--green)', padding: '5px 12px', borderRadius: 20, fontWeight: 700 }}>✓ Approved & Saved</span>}
          {status === 'dismissed' && <span style={{ fontSize: 11, background: 'var(--surface-2)', color: 'var(--text-3)', padding: '5px 12px', borderRadius: 20, fontWeight: 700 }}>Dismissed</span>}
          <span style={{ color: 'var(--text-3)', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-2)' }}>
          <div style={{ paddingTop: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Parts Affected', val: alert.affectedParts.length, color: 'var(--text-1)' },
              { label: 'Alt Supplier', val: alert.altSupplier, color: 'var(--indigo)' },
              { label: 'Cost Impact', val: alert.costImpact, color: alert.costImpact.startsWith('+') ? 'var(--red)' : 'var(--green)' },
              { label: 'AI Confidence', val: alert.confidence + '%', color: alert.confidence >= 85 ? 'var(--green)' : 'var(--yellow)' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Affected Part Codes</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {alert.affectedParts.map(p => (
                <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '3px 11px', borderRadius: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{p}</span>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>AI Recommendation: Supplier Shift</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center', background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-1)' }}>{alert.currentSupplier}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', marginTop: 3 }}>AT RISK</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <path d="M5 10 L48 10 M40 4 L55 10 L40 16" stroke="var(--text-3)" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 9.5, color: 'var(--text-3)', fontWeight: 600 }}>SHIFT TO</span>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--green)' }}>{alert.altSupplier}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', marginTop: 3 }}>{alert.altMatch}% Match</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                {[{ label: 'Cost Impact', val: alert.costImpact }, { label: 'Lead Time', val: alert.leadTimeImpact }, { label: 'Source', val: alert.source }].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)', maxWidth: 120, lineHeight: 1.3 }}>{m.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!status && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="success" onClick={onApprove}>✓ Approve & Save Action</Btn>
              <Btn variant="ghost" onClick={onDismiss}>Dismiss</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionLog({ actions }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        📋 Saved Actions Log
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {actions.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', borderRadius: 9, padding: '10px 14px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>{a.ts}</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, flexShrink: 0, background: a.action === 'DISMISS' ? 'var(--surface-2)' : a.type === 'SupplierShift' ? 'var(--red-bg)' : 'var(--green-bg)', color: a.action === 'DISMISS' ? 'var(--text-3)' : a.type === 'SupplierShift' ? 'var(--red)' : 'var(--green)' }}>
              {a.type}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 600 }}>{a.label}</span>
            {a.customer && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {a.customer}</span>}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>
              ✓ saved
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
