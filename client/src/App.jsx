import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerOrder from './pages/CustomerOrder';
import KitchenDisplay from './pages/KitchenDisplay';
import BarDisplay from './pages/BarDisplay';
import ManagerDashboard from './pages/ManagerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerOrder />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />
        <Route path="/bar" element={<BarDisplay />} />
        <Route path="/dashboard" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
