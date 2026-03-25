import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, 
  Cell, PieChart, Pie
} from 'recharts'
import { 
  fetchSupplierOverview, 
  fetchSupplierPerformance, 
  fetchSupplierAllocation, 
  fetchSupplierLeaderboard 
} from '../../services/api'
import { 
  Zap, AlertCircle, Package, Truck,
  Activity, Star, Globe, BarChart2
} from 'lucide-react'
import { useApp } from '../../App'

const COLORS = {
  quality: '#6366f1',
  delivery: '#10b981',
  risk: '#f59e0b',
  ontime: '#ef4444',
  composite: '#8b5cf6',
  background: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
}

const TOOLTIP_STYLE = { 
  background: 'rgba(255, 255, 255, 0.96)', 
  borderRadius: '12px', 
  border: '1px solid var(--border)', 
  padding: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
}

export default function SupplierHubPage() {
  const { supplierHubData } = useApp()
  const selectedMonth = '2026-03'

  if (!supplierHubData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-3)' }}>
      <div style={{ textAlign: 'center' }}>
        <Activity className="animate-pulse" size={32} style={{ color: 'var(--indigo)', marginBottom: 12 }} />
        <div style={{ fontWeight: 700, fontSize: 16 }}>Aggregating Global Supplier Intel...</div>
      </div>
    </div>
  )

  const { overview, performance, allocation, leaderboard } = supplierHubData

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20 }} className="animate-in">
      
      {/* Header */}
      <div style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-1)', marginBottom: 2, letterSpacing: '-0.3px' }}>
          Supplier Strategy Hub
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 11.5, fontWeight: 600 }}>
          Performance matrix and shortage distribution for <span style={{ color: 'var(--indigo)' }}>{selectedMonth}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard title="Total Partners" value={overview.total_suppliers} icon={Globe} color="#6366f1" />
        <StatCard title="Avg Quality" value={overview.avg_quality_score + '%'} icon={Zap} color="#10b981" />
        <StatCard title="At-Risk Units" value={overview.at_risk_count} icon={AlertCircle} color="#ef4444" />
        <StatCard title="Perfect Delivery" value={overview.avg_ontime_pct + '%'} icon={Truck} color="#f59e0b" />
      </div>

      {/* Row 1: Shortage Distribution & Fulfillment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <HubSection title="Shortage Concentration" subtitle="Distribution among supply base" icon={AlertCircle}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%" cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="total_shortage"
                  nameKey="supplier_name"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.background[index % COLORS.background.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </HubSection>

        <HubSection title="Fulfillment Performance" subtitle="Required vs Allocated qty" icon={Package}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocation} margin={{ top: 5, right: 0, left: -25, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-2)" />
                <XAxis dataKey="supplier_name" tick={{ fontSize: 8, fill: 'var(--text-3)' }} interval={0} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="total_required" name="Req" fill="var(--border)" radius={[2, 2, 0, 0]} barSize={12} />
                <Bar dataKey="total_allocated" name="Alloc" fill={COLORS.delivery} radius={[2, 2, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </HubSection>
      </div>

      {/* Row 2: Performance Leaderboard */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star color="#f59e0b" fill="#f59e0b" size={16} /> Performance Leaderboard
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', padding: '2px 8px', borderRadius: 4, background: 'var(--green-bg)' }}>TOP PERFORMERS</div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Pos', 'Supplier Name', 'Quality', 'Delivery', 'Risk', 'Fulfillment', 'Composite Score'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 9, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboard.leaderboard.map((row, idx) => {
              const hm = leaderboard.heatmap.find(h => h.supplier_id === row.supplier_id)
              return (
                <tr key={row.supplier_id} style={{ borderBottom: '1px solid var(--border-2)' }}>
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: idx === 0 ? '#fef3c7' : '#f1f5f9', color: idx === 0 ? '#92400e' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>{row.rank}</div>
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)' }}>{row.supplier_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{row.components_count} Active Units</div>
                  </td>
                  <HeatmapCell data={hm?.quality} />
                  <HeatmapCell data={hm?.delivery} />
                  <HeatmapCell data={hm?.risk} />
                  <HeatmapCell data={hm?.ontime} />
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--indigo)' }}>{row.composite_score}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
         <HubSection title="Global Component Coverage" subtitle="Count distribution across suppliers" icon={BarChart2}>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboard.coverage} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-2)" />
                <XAxis dataKey="supplier_name" tick={{ fontSize: 8, fill: 'var(--text-3)' }} interval={0} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="components_count" name="Count" fill="var(--indigo)" radius={[2, 2, 0, 0]} barSize={24}>
                  {leaderboard.coverage.map((entry, index) => <Cell key={index} fill={COLORS.background[index % COLORS.background.length]} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </HubSection>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div style={{ background: 'var(--surface)', padding: '12px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ padding: 6, background: color + '15', borderRadius: 8, display: 'flex' }}>
          <Icon size={16} color={color} strokeWidth={2.5} />
        </div>
        {subtitle && <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--text-3)' }}>{subtitle}</div>}
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-1)' }}>{value}</div>
      </div>
    </div>
  )
}

function HubSection({ title, subtitle, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: 6, background: 'var(--surface-2)', borderRadius: 6, display: 'flex', color: 'var(--indigo)' }}>
          <Icon size={14} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-1)' }}>{title}</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)' }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function HeatmapCell({ data }) {
  if (!data) return <td style={{ padding: '8px 16px' }}>-</td>
  const color = data.band === 'green' ? 'var(--green)' : data.band === 'yellow' ? 'var(--yellow)' : 'var(--red)'
  const bg = data.band === 'green' ? 'var(--green-bg)' : data.band === 'yellow' ? 'var(--yellow-bg)' : 'var(--red-bg)'
  
  return (
    <td style={{ padding: '8px 16px' }}>
      <div style={{ padding: '3px 8px', borderRadius: 5, background: bg, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: color }}>{data.value}</span>
      </div>
    </td>
  )
}
