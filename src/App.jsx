import { useState, useEffect, createContext, useContext } from 'react'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import CustomerOverviewPage from './components/customers/CustomerOverviewPage'
import SupplierHubPage from './components/supplier/SupplierHubPage'
import DecisionCenterPage from './components/decisions/DecisionCenterPage'
import Toast from './components/shared/Toast'
import { fetchSuppliers, postAction } from './services/api'

// ── App-level context ──────────────────────────────────
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const PAGES = {
  customers: { label: 'Customer Overview', icon: '👥' },
  supplier:  { label: 'Supplier Hub',      icon: '🏭' },
  decisions: { label: 'AI Decision Center', icon: '🤖' },
}

export default function App() {
  const [activePage, setActivePage] = useState('customers')
  const [savedActions, setSavedActions] = useState([])
  const [toast, setToast] = useState(null)
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    fetchSuppliers()
      .then(setSuppliers)
      .catch(err => console.error('Failed to load suppliers:', err))
  }, [])

  function showToast(msg, type = 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function saveAction(action) {
    const entry = { ...action, id: Date.now(), ts: new Date().toLocaleTimeString() }
    setSavedActions(prev => [entry, ...prev])
    showToast(`Action saved: ${action.label}`, 'success')
    postAction(action).catch(err => console.error('Failed to persist action:', err))
  }

  const ctx = { activePage, setActivePage, savedActions, saveAction, showToast, PAGES, suppliers }

  return (
    <AppContext.Provider value={ctx}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Topbar />

          <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
            {activePage === 'customers'  && <CustomerOverviewPage />}
            {activePage === 'supplier'   && <SupplierHubPage />}
            {activePage === 'decisions'  && <DecisionCenterPage />}
          </main>
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    </AppContext.Provider>
  )
}
