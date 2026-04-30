import { Routes, Route } from 'react-router-dom';
import CustomerView from './pages/CustomerView.jsx';
import BarDisplay from './pages/BarDisplay.jsx';
import ManagerView from './pages/ManagerView.jsx';
import './events.css';

function NoEvent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 56 }}>🥂</div>
      <h1 style={{ color: '#d4a843', fontWeight: 900, fontSize: 28, textShadow: '0 0 30px rgba(212,168,67,0.4)' }}>Tap It Tap It Events</h1>
      <p style={{ color: '#64748b', fontSize: 16 }}>Please scan your table QR code to get started.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <div className="ev-bg-orbs">
        <div className="ev-orb ev-orb-1" />
        <div className="ev-orb ev-orb-2" />
        <div className="ev-orb ev-orb-3" />
      </div>
      <Routes>
        <Route path="/" element={<NoEvent />} />
        <Route path="/:eventId" element={<CustomerView />} />
        <Route path="/:eventId/bar" element={<BarDisplay />} />
        <Route path="/:eventId/manager" element={<ManagerView />} />
      </Routes>
    </>
  );
}
