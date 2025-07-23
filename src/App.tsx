import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PurchaseOrderList } from './components/PurchaseOrderList';
import { PurchaseOrderForm } from './features/po/components/PurchaseOrderForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}> 
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