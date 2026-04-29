import { useState } from 'react';
import '../operations.css';
import SalesStats from '../components/dashboard/SalesStats';
import ServerTable from '../components/dashboard/ServerTable';
import VenueStats from '../components/dashboard/VenueStats';
import ActiveTables from '../components/dashboard/ActiveTables';
import Reports from '../components/dashboard/Reports';

const MANAGERS = [
  { name: 'Michael', pin: '1234', role: 'Owner' },
  { name: 'Jessica', pin: '5678', role: 'Manager' },
  { name: 'Marcus', pin: '9012', role: 'Manager' },
  { name: 'Sara', pin: '3456', role: 'Manager' },
  { name: 'Tyler', pin: '7890', role: 'Manager' },
];

const INITIAL_SERVERS = [
  { id: 1, name: 'Jessica Martinez', sales: 4200, tips: 850, orders: 127 },
  { id: 2, name: 'Marcus Johnson', sales: 3800, tips: 720, orders: 114 },
  { id: 3, name: 'Sara Kim', sales: 5100, tips: 920, orders: 156 },
  { id: 4, name: 'Tyler Brown', sales: 2600, tips: 480, orders: 78 },
];

function PinLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const addDigit = (d) => {
    const next = pin + d;
    if (next.length > 4) return;
    setPin(next);
    setError('');
    if (next.length === 4) {
      const found = MANAGERS.find(m => m.pin === next);
      if (found) {
        onLogin(found);
      } else {
        setTimeout(() => { setPin(''); setError('Incorrect PIN. Try again.'); }, 300);
      }
    }
  };

  const del = () => { setPin(p => p.slice(0, -1)); setError(''); };

  return (
    <div className="pin-gate">
      <div className="pin-card">
        <p className="pin-title">The Tap Room</p>
        <p className="pin-subtitle">Enter your manager PIN</p>
        <div className="pin-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        <p className="pin-error-text">{error}</p>
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="pin-key" onClick={() => addDigit(String(n))}>{n}</button>
          ))}
          <button className="pin-key pin-del" onClick={del}>⌫</button>
          <button className="pin-key pin-zero" onClick={() => addDigit('0')}>0</button>
          <div />
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const [manager, setManager] = useState(null);
  const [servers, setServers] = useState(INITIAL_SERVERS);
  const [activeTab, setActiveTab] = useState('overview');
  const [newServerName, setNewServerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!manager) return <PinLogin onLogin={setManager} />;

  const addServer = () => {
    if (!newServerName.trim()) return;
    setServers(prev => [...prev, { id: Date.now(), name: newServerName.trim(), sales: 0, tips: 0, orders: 0 }]);
    setNewServerName('');
    setShowAddForm(false);
  };

  const removeServer = (id) => setServers(prev => prev.filter(s => s.id !== id));

  const tabs = ['overview', 'tables', 'servers', 'venue', 'reports'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>The Tap Room — Manager</h1>
        <div className="manager-header-right">
          <div className="dashboard-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="manager-badge">{manager.name}</div>
          <button className="lock-btn" onClick={() => setManager(null)}>Lock</button>
        </div>
      </div>
      {activeTab === 'overview' && <SalesStats servers={servers} />}
      {activeTab === 'servers' && (
        <ServerTable
          servers={servers}
          onRemove={removeServer}
          showAddForm={showAddForm}
          newServerName={newServerName}
          onNameChange={setNewServerName}
          onAdd={addServer}
          onToggleForm={() => setShowAddForm(f => !f)}
        />
      )}
      {activeTab === 'tables' && <ActiveTables managerName={manager.name} />}
      {activeTab === 'venue' && <VenueStats />}
      {activeTab === 'reports' && <Reports />}
    </div>
  );
}
