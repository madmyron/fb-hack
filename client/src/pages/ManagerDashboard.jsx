import { useState } from 'react';
import '../operations.css';
import SalesStats from '../components/dashboard/SalesStats';
import ServerTable from '../components/dashboard/ServerTable';
import VenueStats from '../components/dashboard/VenueStats';

const INITIAL_SERVERS = [
  { id: 1, name: 'Jessica Martinez', sales: 4200, tips: 850, orders: 127 },
  { id: 2, name: 'Marcus Johnson', sales: 3800, tips: 720, orders: 114 },
  { id: 3, name: 'Sara Kim', sales: 5100, tips: 920, orders: 156 },
  { id: 4, name: 'Tyler Brown', sales: 2600, tips: 480, orders: 78 },
];

export default function ManagerDashboard() {
  const [servers, setServers] = useState(INITIAL_SERVERS);
  const [activeTab, setActiveTab] = useState('overview');
  const [newServerName, setNewServerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addServer = () => {
    if (!newServerName.trim()) return;
    setServers(prev => [...prev, { id: Date.now(), name: newServerName.trim(), sales: 0, tips: 0, orders: 0 }]);
    setNewServerName('');
    setShowAddForm(false);
  };

  const removeServer = (id) => setServers(prev => prev.filter(s => s.id !== id));

  const tabs = ['overview', 'servers', 'venue'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>The Tap Room — Manager</h1>
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
      {activeTab === 'venue' && <VenueStats />}
    </div>
  );
}
