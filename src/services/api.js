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

export const fetchKpis               = () => get('/api/kpis')
export const fetchCustomers          = () => get('/api/customers')
export const fetchSuppliers          = () => get('/api/suppliers')
export const fetchSupplierTrend      = () => get('/api/supplier-delivery-trend')
export const fetchAlerts             = () => get('/api/alerts')
export const postAction              = (action) => post('/api/actions', action)
