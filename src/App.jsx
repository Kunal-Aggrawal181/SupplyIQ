import { useState, useEffect, createContext, useContext } from 'react'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import CustomerOverviewPage from './components/customers/CustomerOverviewPage'
import SupplierHubPage from './components/supplier/SupplierHubPage'
import DecisionCenterPage from './components/decisions/DecisionCenterPage'
import Toast from './components/shared/Toast'
import { fetchSuppliers, fetchCustomers, postAction, fetchCustomerParts, fetchPartComponents } from './services/api'

// ── App-level context ──────────────────────────────────
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export const MONTHS = [
  { label: 'October 2025', short: 'Oct 2025' },
  { label: 'November 2025', short: 'Nov 2025' },
  { label: 'December 2025', short: 'Dec 2025' },
  { label: 'January 2026', short: 'Jan 2026' },
  { label: 'February 2026', short: 'Feb 2026' },
  { label: 'March 2026', short: 'Mar 2026' },
]

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
  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState('Initializing...')
  
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5)

  useEffect(() => {
    fetchSuppliers()
      .then(setSuppliers)
      .catch(err => console.error('Failed to load suppliers:', err))
    refreshCustomers()
  }, [])

  async function refreshCustomers() {
    setCustomersLoading(true)
    try {
      const dbCustomers = await fetchCustomers();
      const defaultMonth = '2026-03';
      
      const priorityOrder = ['maruti', 'kia', 'tata'];
      const initialCustomers = dbCustomers.map(c => ({
         ...c,
         isLoading: true,
         loadStatus: 'Extracting data...'
      })).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aIdx = priorityOrder.findIndex(p => aName.includes(p));
        const bIdx = priorityOrder.findIndex(p => bName.includes(p));
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });

      setCustomers(initialCustomers);
      setCustomersLoading(false); // Drop the global overlay once we have the raw customer list

      // Process each customer asynchronously and independently
      for (const c of initialCustomers) {
        try {
          const parts = await fetchCustomerParts(c.id, defaultMonth).catch(() => []);
          
          setCustomers(prev => prev.map(p => p.id === c.id ? { ...p, loadStatus: 'Resolving components...' } : p));
          
          const partsWithDetails = await Promise.all(parts.map(async p => {
             const components = await fetchPartComponents(c.id, p.id, defaultMonth).catch(() => []);
             let hasYellow = false;
             let hasRed = false;
             
             for (const comp of components) {
                 let status = 'green';
                 if (comp && comp.allocation) {
                     const shortage = comp.allocation.shortage_qty || 0;
                     if (shortage > 0) {
                         const globalInv = (comp.primary_supplier?.stock || 0) + (comp.inventory?.reduce((s, i) => s + (i.stock || 0), 0) || 0);
                         if (shortage <= globalInv) status = 'yellow';
                         else status = 'red';
                     }
                 }
                 if (status === 'red') hasRed = true;
                 if (status === 'yellow') hasYellow = true;
             }

             let partStatus = 'green';
             if (hasRed) partStatus = 'red';
             else if (hasYellow) partStatus = 'yellow';
             
             return { ...p, calculatedStatus: partStatus, fetchedComponents: components };
          }));

          const redParts = partsWithDetails.filter(p => p.calculatedStatus === 'red').length;
          const yellowParts = partsWithDetails.filter(p => p.calculatedStatus === 'yellow').length;
          const greenParts = partsWithDetails.filter(p => p.calculatedStatus === 'green').length;

          setCustomers(prev => prev.map(p => p.id === c.id ? {
             ...p,
             isLoading: false,
             fetchedParts: partsWithDetails,
             red: redParts,
             yellow: yellowParts,
             green: greenParts,
             totalParts: partsWithDetails.length
          } : p));

        } catch (e) {
          console.error(`Failed to load extended data for customer ${c.id}`);
          setCustomers(prev => prev.map(p => p.id === c.id ? { ...p, isLoading: false } : p));
        }
      }

    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomersLoading(false);
    }
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function saveAction(action) {
    const entry = { ...action, id: Date.now(), ts: new Date().toLocaleTimeString() }
    setSavedActions(prev => [entry, ...prev])
    showToast(`Action saved: ${action.label}`, 'success')
    postAction(action)
      .then(() => refreshCustomers())
      .catch(err => console.error('Failed to persist action:', err))
  }

  const ctx = { 
    activePage, setActivePage, 
    savedActions, saveAction, 
    showToast, PAGES, 
    suppliers, customers, customersLoading, refreshCustomers,
    selectedCustomer, setSelectedCustomer,
    selectedMonthIdx, setSelectedMonthIdx
  }

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
