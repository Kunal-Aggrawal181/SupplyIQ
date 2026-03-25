// Base URL: empty string in dev (Vite proxy handles /api/*),
// or set VITE_API_URL in production .env
const BASE = import.meta.env.VITE_API_URL ?? ''

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
  return res.json()
}

export const fetchKpis               = () => get('/api/kpis')
export const fetchCustomers          = () => get('/api/customers')
export const fetchSupplierOverview   = () => get('/api/suppliers/overview')
export const fetchSupplierPerformance = (month, ids) => {
  const q = new URLSearchParams()
  if (month) q.append('month', month)
  if (ids) q.append('supplier_ids', ids)
  return get(`/api/suppliers/performance-trends?${q.toString()}`)
}
export const fetchSupplierAllocation  = (month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/suppliers/allocation-summary${q}`)
}
export const fetchSupplierLeaderboard = (month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/suppliers/leaderboard${q}`)
}

export const fetchAlerts             = () => get('/api/alerts')
export const postAction              = (action) => post('/api/actions', action)
export const fetchPartActions        = (customer, partCode) =>
  get(`/api/part-actions?customer=${encodeURIComponent(customer)}&partCode=${encodeURIComponent(partCode)}`)
export const putPartActions          = (customer, partCode, steps) =>
  put('/api/part-actions', { customer, partCode, steps })
export const fetchBom                = (customerId, itemCode) =>
  get(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(itemCode)}/bom`)
export const fetchCustomerParts      = (customerId, month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/customers/${encodeURIComponent(customerId)}/parts${q}`)
}
export const fetchPartDetail         = (customerId, partId, month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(partId)}${q}`)
}
export const fetchInventory          = (params) => {
  const q = new URLSearchParams(params).toString()
  return get(`/api/inventory?${q}`)
}
export const fetchComponentDetail    = (customerId, partId, componentId, month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(partId)}/components/${encodeURIComponent(componentId)}${q}`)
}
export const fetchPartComponents     = (customerId, partId, month) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : ''
  return get(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(partId)}/components${q}`)
}

export const shiftSupplier          = (customerId, partId, componentId, body) =>
  post(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(partId)}/components/${encodeURIComponent(componentId)}/shift-supplier`, body)

export const reallocateComponent     = (body) => 
  post('/api/reallocate/component', body)

export const fetchCommonality        = (customerId) =>
  get(`/api/customers/${encodeURIComponent(customerId)}/parts-commonality`)

export const fetchComponentCommonality = (customerId, partId) =>
  get(`/api/customers/${encodeURIComponent(customerId)}/parts/${encodeURIComponent(partId)}/components-commonality`)
