import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PurchaseOrderList } from './components/PurchaseOrderList';
import { PurchaseOrderForm } from './features/po/components/PurchaseOrderForm';
// Hapus import LoginPage, supabase, dan Session

function App() {
  // Hapus semua logic session dan useEffect

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout /* session prop dihapus jika tidak dipakai */ />}> 
            <Route index element={<Dashboard />} />
            <Route path="purchase-orders" element={<PurchaseOrderList />} />
            <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;