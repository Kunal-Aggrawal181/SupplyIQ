import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { fetchPartDetail, fetchPartComponents, shiftSupplier, reallocateComponent } from '../../services/api'
import { useApp } from '../../App'

function formatMonthForInventory(m) {
  if (!m) return null
  try {
    const parts = m.split(' ')
    if (parts.length < 2) return null
    const [mon, year] = parts
    const months = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' }
    const monKey = mon.slice(0, 3)
    return `${year}-${months[monKey] || '01'}`
  } catch (e) {
    return null
  }
}

function calculateComponentStatus(comp) {
  if (!comp || !comp.allocation) return 'green'; // Default
  const { allocation, primary_supplier, inventory } = comp;
  const shortage = allocation.shortage_qty || 0;
  
  if (shortage <= 0) return 'green';
  
  const globalInventory = (primary_supplier?.stock || 0) + (inventory?.reduce((s, i) => s + (i.stock || 0), 0) || 0);
  
  if (shortage <= globalInventory) return 'yellow';
  return 'red';
}

export default function ComponentGrid({ customerId, partId, month, part, customer }) {
  const { refreshCustomers, showToast } = useApp()
  const [shifting, setShifting] = useState(false)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showViz, setShowViz] = useState(false)

  const handleShiftSupplier = async (newSupplierId) => {
    if (!selectedComp) return
    setShifting(true)
    try {
      await shiftSupplier(customerId, partId, selectedComp.id, { new_supplier_id: newSupplierId })
      showToast('Supplier shifted successfully. Recalculating allocations...', 'success')
      setSelectedComp(null)
      refreshCustomers() // Trigger re-fetching all data so colors update
    } catch (err) {
      console.error('Failed to shift supplier:', err)
      showToast('Error shifting supplier', 'error')
    } finally {
      setShifting(false)
    }
  }

  const [reallocating, setReallocating] = useState(false)
  const [reallocateQty, setReallocateQty] = useState(0)

  const handleReallocate = async (sourcePartId, qty) => {
    if (!selectedComp || qty <= 0) return
    setReallocating(true)
    try {
      await reallocateComponent({
        source_part_id: sourcePartId,
        source_component_id: selectedComp.id,
        target_part_id: partId,
        target_component_id: selectedComp.id,
        shift_qty: qty
      })
      showToast(`Successfully reallocated ${qty} units. Colors updating...`, 'success')
      setSelectedComp(null)
      refreshCustomers() // Recalculate everything
    } catch (err) {
      console.error('Failed to reallocate:', err)
      showToast('Reallocation failed', 'error')
    } finally {
      setReallocating(false)
    }
  }

  // Find other parts of this customer that have this component and HAVE stock/allocated qty
  const otherPartsWithThisComp = (customer?.fetchedParts || [])
    .filter(p => p.id !== partId)
    .map(p => {
       const detail = (p.fetchedComponents || []).find(c => c.id === selectedComp?.id);
       if (!detail || !detail.allocation || detail.allocation.allocated_qty <= 0) return null;
       return { 
          partCode: p.itemCode,
          partId: p.id,
          partName: p.desc,
          allocated: detail.allocation.allocated_qty
       };
    })
    .filter(Boolean);

  // Use the pre-fetched components directly from the App load phase
  const components = part?.fetchedComponents || [];
  const scheduleQty = part?.scheduleN || 0;
  
  const componentDetailsMap = {};
  components.forEach(c => { componentDetailsMap[c.id] = c; });

  let compDetail = null;
  if (selectedComp) {
    compDetail = componentDetailsMap[selectedComp.id] || selectedComp;
  }

  if (!components || components.length === 0) {
    return (
      <div style={{ 
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', padding: '24px', textAlign: 'center',
        color: 'var(--text-3)', fontSize: 13
      }}>
        No component data available for this part.
      </div>
    )
  }

  if (selectedComp && compDetail) {
    const { allocation, primary_supplier, inventory } = compDetail
    const totalStock = (primary_supplier?.stock || 0) + (inventory?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0)
    const shortageColor = allocation?.status === 'Shortage' ? 'var(--red)' : 'var(--green)'

    const inventoryData = [
      { name: (primary_supplier?.name || 'Primary').slice(0, 12), stock: primary_supplier?.stock || 0, isPrimary: true },
      ...(inventory || []).map(inv => ({ name: (inv.supplier_name || 'Alt').slice(0, 12), stock: inv.stock || 0, isPrimary: false }))
    ]

    const allocationData = [
      { name: 'Allocated', value: allocation?.allocated_qty || 0, color: 'var(--green)' },
      { name: 'Shortage', value: allocation?.shortage_qty || 0, color: 'var(--red)' }
    ]

    return (
      <div style={{ 
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)', 
        border: '1.5px solid var(--indigo)', padding: '20px', boxShadow: 'var(--shadow-lg)',
        position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', gap: 16,
        animation: 'scaleIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--indigo)' }}>{compDetail.name}</div>
            {allocation?.status && (
              <span style={{ 
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                background: shortageColor + '15', color: shortageColor, border: `1px solid ${shortageColor}30`
              }}>
                {allocation.status.toUpperCase()}
              </span>
            )}
            <button 
              onClick={() => setShowViz(!showViz)}
              style={{ 
                background: 'var(--surface-2)', border: '1px solid var(--border)', 
                borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700, 
                cursor: 'pointer', color: 'var(--indigo)', marginLeft: 10,
                transition: 'all 0.2s'
              }}
            >
              {showViz ? '📋 Metrics' : '📊 Visualize'}
            </button>
          </div>
          <button 
             onClick={() => { setSelectedComp(null); setShowViz(false) }}
             style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
          >✕</button>
        </div>
        
        {showViz ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 14, height: 160 }}>
            {/* Stock per Supplier Chart */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 8, minWidth: 0 }}>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 8 }}>Supplier Inventory Map</div>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={inventoryData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: 10, borderRadius: 6, border: 'none', boxShadow: 'var(--shadow)' }} />
                  <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={12}>
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPrimary ? 'var(--indigo)' : '#6366f140'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Status Chart */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 8, minWidth: 0 }}>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 8 }}>Allocation State</div>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%" cy="40%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: 'none', boxShadow: 'var(--shadow)' }} />
                  <Legend verticalAlign="bottom" height={20} wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
           <div>
              <div style={labelStyle}>SAP Code</div>
              <div style={valStyle}>{compDetail.sap_code || 'N/A'}</div>
           </div>
           <div>
              <div style={labelStyle}>Primary Supplier</div>
              <div style={valStyle}>{primary_supplier?.name || 'N/A'}</div>
           </div>
           <div>
              <div style={labelStyle}>Requirement / Part</div>
              <div style={valStyle}>{compDetail.quantity_per_part} {compDetail.uom}</div>
           </div>
           
           {/* Allocation Metrics */}
           <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 12, display: 'flex', gap: 20, gridColumn: 'span 2' }}>
              <div>
                <div style={labelStyle}>Required Qty</div>
                <div style={valStyle}>{allocation?.required_qty?.toLocaleString()}</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
                <div style={labelStyle}>Allocated Qty</div>
                <div style={{ ...valStyle, color: 'var(--green)' }}>{allocation?.allocated_qty?.toLocaleString()}</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
                <div style={labelStyle}>Shortage</div>
                <div style={{ ...valStyle, color: 'var(--red)' }}>{allocation?.shortage_qty?.toLocaleString()}</div>
              </div>
           </div>

           {/* Inventory Breakdown */}
           <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 12, gridColumn: '1 / -1' }}>
              <div style={{ ...labelStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Supplier Inventory Breakdown</span>
                <span style={{ color: 'var(--indigo)', fontSize: 13, fontWeight: 800 }}>
                  Global Total: {totalStock.toLocaleString()} {compDetail.uom}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {/* Primary Supplier Stock */}
                {primary_supplier && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, var(--surface), var(--surface-2))', border: '1.5px solid var(--indigo)', 
                    padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2,
                    minWidth: 130, position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 8, background: 'var(--indigo)', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 900 }}>PRIMARY</span>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-1)' }}>{primary_supplier.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)' }}>{primary_supplier.stock?.toLocaleString()} <span style={{fontSize: 10, opacity: 0.7}}>{compDetail.uom}</span></div>
                  </div>
                )}

                {/* Other Suppliers */}
                {inventory?.map((inv, idx) => (
                  <div key={idx} style={{ 
                    background: 'var(--surface)', border: '1px solid var(--border)', 
                    padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2,
                    minWidth: 120, position: 'relative'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)' }}>{inv.supplier_name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{inv.stock?.toLocaleString()} <span style={{fontSize: 10, opacity: 0.7}}>{compDetail.uom}</span></div>
                    
                    {/* Manual Shift action if shortage exists - DISABLED FOR NOW
                    {(allocation?.shortage_qty > 0) && (
                      <button 
                        onClick={() => handleShiftSupplier(inv.supplier_id)}
                        disabled={shifting}
                        style={{
                          marginTop: 6, padding: '4px 8px', fontSize: 9, fontWeight: 800,
                          background: shifting ? 'var(--border)' : 'var(--indigo)', color: '#fff',
                          border: 'none', borderRadius: 6, cursor: shifting ? 'default' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {shifting ? 'SHIFTING...' : 'SHIFT TO THIS'}
                      </button>
                    )}
                    */}
                  </div>
                ))}

                 {(!primary_supplier && (!inventory || inventory.length === 0)) && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>No inventory records found.</div>
                 )}
               </div>
            </div>

            {/* Reallocate Section */}
            {allocation?.shortage_qty > 0 && otherPartsWithThisComp.length > 0 && (
              <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 12, gridColumn: '1 / -1', border: '1px solid var(--yellow)30', marginTop: 10 }}>
                <div style={{ ...labelStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--yellow)' }}>Reallocate From Healthier Parts</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                   {otherPartsWithThisComp.map(op => (
                     <div key={op.partId} style={{ background: 'var(--surface)', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 10 }}>
                           <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.partName}</div>
                           <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{op.allocated.toLocaleString()} units available</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                           <input 
                              type="number" 
                              defaultValue={Math.min(op.allocated, allocation.shortage_qty)}
                              onChange={(e) => setReallocateQty(Number(e.target.value))}
                              style={{ width: 60, fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', background: 'var(--surface)' }}
                           />
                           <button 
                              onClick={() => handleReallocate(op.partId, reallocateQty || Math.min(op.allocated, allocation.shortage_qty))}
                              disabled={reallocating}
                              style={{ padding: '6px 10px', background: reallocating ? 'var(--border)' : 'var(--yellow)', color: '#000', border: 'none', borderRadius: 6, fontSize: 9, fontWeight: 900, cursor: reallocating ? 'default' : 'pointer' }}
                           >
                              {reallocating ? '...' : 'REALLOCATE'}
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-1)' }}>
          Component Dependency Map
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>
          {components.length} COMPONENTS
        </div>
      </div>
      <div style={{ 
        maxHeight: '320px', overflowY: 'auto', paddingRight: '4px',
        scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent'
      }} className="custom-scrollbar">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', 
          gap: 6,
        }}>
          {components.map(comp => {
            const detailedComp = componentDetailsMap[comp.id] || comp;
            const status = calculateComponentStatus(detailedComp);
            const statusColor = status === 'red' ? 'var(--red)' : status === 'yellow' ? 'var(--yellow)' : 'var(--green)';
            const statusBg = status === 'red' ? 'rgba(239,68,68,0.12)' : status === 'yellow' ? 'rgba(234,179,8,0.12)' : 'rgba(34,197,94,0.12)';

            return (
              <div 
                key={comp.id}
                onClick={() => setSelectedComp(comp)}
                title={`${comp.name} - Status: ${status.toUpperCase()}`}
                style={{ 
                  background: statusBg, border: `1px solid ${statusColor}45`, 
                  borderRadius: 5, padding: '4px 6px', textAlign: 'center', 
                  fontSize: 8.5, fontWeight: 700, color: statusColor,
                  cursor: 'pointer', transition: 'all 0.1s ease',
                  height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { 
                    e.currentTarget.style.borderColor = statusColor; 
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => { 
                    e.currentTarget.style.borderColor = statusColor + '45'; 
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ 
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden', lineHeight: 1.1, wordBreak: 'break-word' 
                }}>
                  {comp.name}
                </div>
              </div>
            );
          })}
        </div>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-3); }
        `}</style>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }
const valStyle = { fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }
