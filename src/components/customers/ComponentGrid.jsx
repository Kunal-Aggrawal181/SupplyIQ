import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RT, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Users, AlertTriangle, Layers, Info, CheckCircle2, AlertCircle, Filter, GitMerge, Package, RefreshCw, Search } from 'lucide-react'
import { fetchPartDetail, fetchPartComponents, fetchComponentCommonality, shiftSupplier } from '../../services/api'
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

export default function ComponentGrid({ customerId, partId, month, part, customer, onSupplierSelect }) {
  const { refreshCustomers, showToast } = useApp()
  const [shifting, setShifting] = useState(false)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showViz, setShowViz] = useState(false)
  const [showCommonalityShift, setShowCommonalityShift] = useState(false)
  const [commonality, setCommonality] = useState([])
  const [hoveredCompId, setHoveredCompId] = useState(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [filterMode, setFilterMode] = useState('all') // all, common, exclusive
  const [searchTerm, setSearchTerm] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState(null)

  const handleAISuggestSupplier = (mpn) => {
    setAiSuggestions({
      mpn,
      suppliers: [
        { name: 'Digi-Key Electronics', leadTime: '2 Days', price: '$0.0042', stock: 150000 },
        { name: 'Mouser Electronics', leadTime: '3 Days', price: '$0.0045', stock: 85000 },
        { name: 'Arrow Electronics', leadTime: '1 Week', price: '$0.0040', stock: 300000 }
      ]
    })
  }

  useEffect(() => {
    if (customerId && partId) {
      fetchComponentCommonality(customerId, partId)
        .then(setCommonality)
        .catch(err => console.error('Failed to fetch commonality:', err))
    }
  }, [customerId, partId])

  const commonalityMap = {}
  commonality.forEach(c => { commonalityMap[String(c.component_id)] = c })

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


  // Use the pre-fetched components directly from the App load phase
  const components = part?.fetchedComponents || [];
  const scheduleQty = part?.scheduleN || 0;

  const componentDetailsMap = {};
  components.forEach(c => { componentDetailsMap[c.id] = c; });

  let compDetail = null;
  if (selectedComp) {
    compDetail = componentDetailsMap[selectedComp.id] || selectedComp;
  }

  const filteredComponents = components.filter(c => {
    // Search filter
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // Type filter
    const isCommon = commonalityMap[String(c.id)]?.is_common;
    if (filterMode === 'common') return isCommon;
    if (filterMode === 'exclusive') return !isCommon;
    return true;
  });

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

  const activeCommonality = hoveredCompId ? commonalityMap[String(hoveredCompId)] : null;
  const selectedCommonality = selectedComp ? commonalityMap[String(selectedComp.id)] : null;



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
            {selectedCommonality?.is_common && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'var(--indigo-bg)', color: 'var(--indigo)' }}>
                COMMON
              </span>
            )}
            {allocation?.status && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                background: shortageColor + '15', color: shortageColor, border: `1px solid ${shortageColor}30`
              }}>
                {allocation.status.toUpperCase()}
              </span>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { setShowViz(!showViz); setShowCommonalityShift(false); }}
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', color: 'var(--indigo)', transition: 'all 0.2s'
                }}
              >
                {showViz ? '📋 Metrics' : '📊 Visualize'}
              </button>
              {selectedCommonality?.is_common && (
                <button
                  onClick={() => { setShowCommonalityShift(!showCommonalityShift); setShowViz(false); }}
                  style={{
                    background: showCommonalityShift ? 'var(--indigo)' : 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', color: showCommonalityShift ? '#fff' : 'var(--indigo)', transition: 'all 0.2s'
                  }}
                >
                  <RefreshCw size={10} style={{ marginRight: 4 }} />
                  Systemic Shift
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => { setSelectedComp(null); setShowViz(false); setShowCommonalityShift(false); setAiSuggestions(null); }}
            style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
          >✕</button>
        </div>

        {showCommonalityShift ? (
          <div style={{ animation: 'fadeIn 0.2s' }}>
            <div style={{ ...labelStyle, color: 'var(--indigo)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} /> Global Supply Redistribution Map — Commonality Intelligence
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {(selectedCommonality?.common_in || []).map((entry, idx) => (
                <div key={idx} style={{
                  background: 'var(--surface-2)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ padding: '4px 8px', borderRadius: 6, background: '#fff', fontSize: 11, fontWeight: 800, border: '1px solid var(--border)' }}>
                      {entry.customer_name}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-1)' }}>{entry.part_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{entry.part_code || 'P-9922'} • Allocated: {entry.allocation?.allocated_qty?.toLocaleString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Simulated: Requesting shift of 500 units from ${entry.customer_name} to this project.`, 'info')}
                    style={{
                      padding: '6px 14px', borderRadius: 8, background: 'var(--indigo)', color: '#fff',
                      fontSize: 10, fontWeight: 900, border: 'none', cursor: 'pointer',
                      boxShadow: '0 2px 4px var(--indigo)30'
                    }}
                  >
                    SHIFT ALLOCATION
                  </button>
                </div>
              ))}
              {(!selectedCommonality?.common_in || selectedCommonality.common_in.length === 0) && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)', fontSize: 12 }}>No other active parts found for this common component.</div>
              )}
            </div>
          </div>
        ) : showViz ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 14, height: 160 }}>
            {/* Stock per Supplier Chart */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 8, minWidth: 0 }}>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 8 }}>Supplier Inventory Map</div>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={inventoryData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={60} />
                  <RT cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: 10, borderRadius: 6, border: 'none', boxShadow: 'var(--shadow)' }} />
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
                  <RT contentStyle={{ fontSize: 10, borderRadius: 6, border: 'none', boxShadow: 'var(--shadow)' }} />
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ color: 'var(--indigo)', fontSize: 13, fontWeight: 800 }}>
                    Total Available: {totalStock.toLocaleString()} {compDetail.uom}
                  </span>
                  <button
                    onClick={() => handleAISuggestSupplier('C1206C104K4RACAUTO')}
                    style={{ background: 'var(--indigo)', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 10, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                  >✨ AI Suggest Supplier</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {/* Primary Supplier Stock */}
                {primary_supplier && (
                  <div style={{
                    background: 'linear-gradient(135deg, var(--surface), var(--surface-2))', border: '1.5px solid var(--indigo)',
                    padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2,
                    minWidth: 130, position: 'relative', cursor: 'pointer'
                  }} onClick={() => onSupplierSelect && onSupplierSelect(primary_supplier)}>
                    <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 8, background: 'var(--indigo)', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 900 }}>PRIMARY</span>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-1)' }}>{primary_supplier.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)' }}>{primary_supplier.stock?.toLocaleString()} <span style={{ fontSize: 10, opacity: 0.7 }}>{compDetail.uom}</span></div>
                  </div>
                )}

                {/* Other Suppliers */}
                {inventory?.map((inv, idx) => (
                  <div key={idx} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '8px 12px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2,
                    minWidth: 120, position: 'relative', cursor: 'pointer'
                  }} onClick={() => onSupplierSelect && onSupplierSelect(inv)}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)' }}>{inv.supplier_name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{inv.stock?.toLocaleString()} <span style={{ fontSize: 10, opacity: 0.7 }}>{compDetail.uom}</span></div>

                    <button
                      onClick={(e) => { e.stopPropagation(); showToast(`Simulated shifting to ${inv.supplier_name}`, 'info'); }}
                      style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', background: 'var(--indigo)', color: 'white', border: '2px solid var(--surface)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: 12, fontWeight: 'bold' }}
                      title="Shift to this alternate supplier (Simulation)"
                    >⇄</button>

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

              {aiSuggestions && (
                <div style={{ marginTop: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid var(--indigo)40', borderRadius: 8, padding: 12, animation: 'fadeIn 0.2s' }}>
                  <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--indigo)', marginBottom: 8 }}>
                    ✨ AI Sourcing Suggestions for MPN: {aiSuggestions.mpn}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {aiSuggestions.suppliers.map((s, idx) => (
                      <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 10, flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-1)' }}>{s.name}</div>
                        <div style={{ color: 'var(--text-3)', marginTop: 4 }}>Price: <span style={{ color: 'var(--text-1)' }}>{s.price}</span></div>
                        <div style={{ color: 'var(--text-3)' }}>Stock: <span style={{ color: 'var(--green)' }}>{s.stock.toLocaleString()}</span></div>
                        <div style={{ color: 'var(--text-3)' }}>Lead Time: {s.leadTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', padding: '16px', boxShadow: 'var(--shadow)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-1)', whiteSpace: 'nowrap', letterSpacing: -0.2 }}>
              Dependency Map
            </div>

            {/* Type Filters */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 3, borderRadius: 10, gap: 2, border: '1px solid var(--border-2)' }}>
              {[
                { id: 'all', label: 'All', count: components.length, icon: Package },
                { id: 'common', label: 'Common', count: components.filter(c => commonalityMap[String(c.id)]?.is_common).length, icon: GitMerge },
                { id: 'exclusive', label: 'Exclusive', count: components.filter(c => !commonalityMap[String(c.id)]?.is_common).length, icon: Layers }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10,
                    fontWeight: filterMode === f.id ? 900 : 700,
                    background: filterMode === f.id ? 'var(--indigo)' : 'transparent',
                    color: filterMode === f.id ? '#fff' : 'var(--text-3)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <f.icon size={11} color={filterMode === f.id ? '#fff' : 'currentColor'} />
                  {f.label.toUpperCase()}
                  <span style={{ opacity: filterMode === f.id ? 1 : 0.5 }}>{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar - Nested below title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              position: 'relative', flex: 1, maxWidth: 320,
              display: 'flex', alignItems: 'center'
            }}>
              <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-3)', opacity: 0.7 }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search components by name or ID..."
                style={{
                  width: '100%', padding: '8px 12px 8px 36px',
                  borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  fontSize: 12, color: 'var(--text-1)',
                  fontWeight: 600, transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--indigo)'
                  e.target.style.background = '#fff'
                  e.target.style.boxShadow = '0 0 0 3px var(--indigo-bg)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.background = 'var(--surface-2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 10, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', display: 'flex' }}
                >✕</button>
              )}
            </div>

            {/* Component Intelligence HUD (Reduced when searching/filtering if needed, but stays for now) */}
            {activeCommonality && (
              <div style={{
                padding: '4px 14px',
                border: '1px solid var(--indigo-bg)',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
                display: 'flex',
                alignItems: 'center', gap: 10, minWidth: 260, height: 34,
                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)',
                animation: 'fadeIn 0.2s'
              }}>
                <Info size={14} color="var(--indigo)" className="pulse-icon" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--indigo)', textTransform: 'uppercase' }}>
                    {activeCommonality.is_common ? 'Global Insight' : 'Internal Target'}
                  </span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-2)' }}>
                    {activeCommonality.is_common ? `${activeCommonality.common_count} Distributed Instances` : 'Component Exclusive to Reference'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Package size={12} /> {filteredComponents.length} SHOWN
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
          {filteredComponents.map((comp, idx) => {
            const detailedComp = componentDetailsMap[comp.id] || comp;
            const status = calculateComponentStatus(detailedComp);

            let statusColor = 'var(--green)';
            let statusBg = 'rgba(34,197,94,0.12)';

            if (status === 'red' || status === 'yellow') {
              const shortage = detailedComp.allocation?.shortage_qty || 0;
              let shadeIdx = 0; // light
              if (shortage >= 2000) {
                shadeIdx = 2; // dark
              } else if (shortage >= 500) {
                shadeIdx = 1; // medium
              }

              if (status === 'red') {
                const shades = ['rgba(239,68,68,0.12)', 'rgba(239,68,68,0.35)', 'rgba(239,68,68,0.6)'];
                statusBg = shades[shadeIdx];
                statusColor = 'var(--red)';
              } else {
                const shades = ['rgba(234,179,8,0.12)', 'rgba(234,179,8,0.3)', 'rgba(234,179,8,0.5)'];
                statusBg = shades[shadeIdx];
                statusColor = 'var(--yellow)';
              }
            }

            const commonInfo = commonalityMap[String(comp.id)];

            return (
              <div
                key={comp.id}
                onClick={() => { setSelectedComp(comp); setShowCommonalityShift(false); setAiSuggestions(null); }}
                onMouseEnter={() => setHoveredCompId(comp.id)}
                onMouseLeave={() => setHoveredCompId(null)}
                className="grid-cell"
                style={{
                  background: statusBg, border: `1px solid ${statusColor}45`,
                  borderRadius: 5, padding: '4px 6px', textAlign: 'center',
                  fontSize: 8.5, fontWeight: 700, color: '#000',
                  cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  position: 'relative'
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
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .pulse-icon { animation: pulse 1.5s infinite ease-in-out; }
        .grid-cell:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); filter: brightness(1.05); }
        .filter-btn:hover { background: var(--surface) !important; color: var(--indigo) !important; transform: scale(1.02); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-3); }
      `}</style>

    </div>
  )
}

const labelStyle = { fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }
const valStyle = { fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }
