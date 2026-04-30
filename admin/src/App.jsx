import { useState, useEffect } from 'react';
import './admin.css';
import ClientView from './pages/ClientView.jsx';

const OWNER_PIN = '1111';
const API_URL = 'https://fb-hack-nx6t.onrender.com';

const DEFAULT_CLIENTS = [
  {
    id: 'tap-room',
    name: 'The Tap Room',
    contact: 'Jenny',
    email: 'jenny@loveme.com',
    phone: '867-5309',
    city: 'My Dreams',
    startDate: '2026-01-01',
    rate: 3.5,
    status: 'active',
  },
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
      if (next === OWNER_PIN) {
        onLogin();
      } else {
        setTimeout(() => { setPin(''); setError('Incorrect PIN.'); }, 300);
      }
    }
  };

  const del = () => { setPin(p => p.slice(0, -1)); setError(''); };

  return (
    <div className="pin-gate">
      <div className="pin-card">
        <div className="admin-logo-text">Tap It Tap It</div>
        <p className="pin-title">Owner Portal</p>
        <p className="pin-subtitle">Enter your PIN to continue</p>
        <div className="pin-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        <p className="pin-error">{error}</p>
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="pin-key" onClick={() => addDigit(String(n))}>{n}</button>
          ))}
          <button className="pin-key pin-del" onClick={del}>⌫</button>
          <button className="pin-key" onClick={() => addDigit('0')}>0</button>
          <div />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('fbhack_clients_v2');
      return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
    } catch { return DEFAULT_CLIENTS; }
  });
  const [orders, setOrders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', contact: '', email: '', phone: '', city: '', rate: '3.5', startDate: '',
  });

  useEffect(() => {
    if (!authed) return;
    fetch(`${API_URL}/api/orders`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [authed]);

  const saveClients = (updated) => {
    setClients(updated);
    localStorage.setItem('fbhack_clients_v2', JSON.stringify(updated));
  };

  const addClient = () => {
    if (!newClient.name.trim()) return;
    const client = {
      id: `client-${Date.now()}`,
      name: newClient.name.trim(),
      contact: newClient.contact.trim(),
      email: newClient.email.trim(),
      phone: newClient.phone.trim(),
      city: newClient.city.trim(),
      startDate: newClient.startDate || new Date().toISOString().slice(0, 10),
      rate: parseFloat(newClient.rate) || 3.5,
      status: 'active',
    };
    saveClients([...clients, client]);
    setNewClient({ name: '', contact: '', email: '', phone: '', city: '', rate: '3.5', startDate: '' });
    setShowAddForm(false);
  };

  const removeClient = (id) => {
    if (!window.confirm('Remove this client?')) return;
    saveClients(clients.filter(c => c.id !== id));
  };

  const updateClientRate = (id, rate) => {
    const updated = clients.map(c => c.id === id ? { ...c, rate } : c);
    saveClients(updated);
    if (selectedClient?.id === id) setSelectedClient(c => ({ ...c, rate }));
  };

  if (!authed) return <PinLogin onLogin={() => setAuthed(true)} />;

  const getClientData = (client) => {
    const clientOrders = client.id === 'tap-room' ? orders : [];
    const total = clientOrders.reduce((s, o) => s + (o.total || 0), 0);
    return { orders: clientOrders, total, cut: total * client.rate / 100 };
  };

  const totalRevenue = clients.reduce((s, c) => s + getClientData(c).total, 0);
  const totalCut = clients.reduce((s, c) => s + getClientData(c).cut, 0);
  const totalOrders = clients.reduce((s, c) => s + getClientData(c).orders.length, 0);

  if (selectedClient) {
    const data = getClientData(selectedClient);
    return (
      <ClientView
        client={selectedClient}
        orders={data.orders}
        onBack={() => setSelectedClient(null)}
        onUpdateRate={(rate) => updateClientRate(selectedClient.id, rate)}
      />
    );
  }

  const inp = {
    padding: '10px 14px', border: '1px solid #2d3748', borderRadius: 8, fontSize: 14,
    background: '#1a202c', color: '#e2e8f0', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div className="admin-app">
      <div className="admin-header">
        <div className="admin-brand">
          <span className="admin-logo-text">Tap It Tap It</span>
          <span className="admin-portal-badge">Owner Portal</span>
        </div>
        <button className="admin-lock-btn" onClick={() => setAuthed(false)}>Lock</button>
      </div>

      <div className="admin-content">
        <div className="admin-stats-row">
          <div className="admin-stat">
            <span className="admin-stat-label">Active Clients</span>
            <span className="admin-stat-value">{clients.filter(c => c.status === 'active').length}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Platform Revenue</span>
            <span className="admin-stat-value">${totalRevenue.toFixed(2)}</span>
            <span className="admin-stat-sub">tracked this session</span>
          </div>
          <div className="admin-stat highlight">
            <span className="admin-stat-label">Your Cut</span>
            <span className="admin-stat-value">${totalCut.toFixed(2)}</span>
            <span className="admin-stat-sub">this session</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Total Orders</span>
            <span className="admin-stat-value">{totalOrders}</span>
            <span className="admin-stat-sub">across all venues</span>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Restaurant Clients</h2>
            <button className="admin-add-btn" onClick={() => setShowAddForm(f => !f)}>
              {showAddForm ? 'Cancel' : '+ Add Client'}
            </button>
          </div>

          {showAddForm && (
            <div className="admin-add-form">
              <h3>New Client</h3>
              <div className="admin-form-grid">
                <input style={inp} placeholder="Restaurant name *" value={newClient.name} onChange={e => setNewClient(f => ({...f, name: e.target.value}))} />
                <input style={inp} placeholder="Contact person" value={newClient.contact} onChange={e => setNewClient(f => ({...f, contact: e.target.value}))} />
                <input style={inp} placeholder="Email" value={newClient.email} onChange={e => setNewClient(f => ({...f, email: e.target.value}))} />
                <input style={inp} placeholder="Phone" value={newClient.phone} onChange={e => setNewClient(f => ({...f, phone: e.target.value}))} />
                <input style={inp} placeholder="City" value={newClient.city} onChange={e => setNewClient(f => ({...f, city: e.target.value}))} />
                <input style={inp} placeholder="Contract start date" type="date" value={newClient.startDate} onChange={e => setNewClient(f => ({...f, startDate: e.target.value}))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <input style={{...inp, width: 100}} type="number" step="0.1" placeholder="Rate %" value={newClient.rate} onChange={e => setNewClient(f => ({...f, rate: e.target.value}))} />
                <span style={{ color: '#64748b', fontSize: 14 }}>% commission on app revenue</span>
              </div>
              <button className="admin-save-btn" onClick={addClient} disabled={!newClient.name.trim()}>
                Add Client
              </button>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>City</th>
                <th>Client Since</th>
                <th>Rate</th>
                <th>Revenue</th>
                <th>Your Cut</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const { total, cut, orders: clientOrders } = getClientData(client);
                return (
                  <tr key={client.id} className="client-row" onClick={() => setSelectedClient(client)}>
                    <td>
                      <strong style={{ color: '#e2e8f0' }}>{client.name}</strong>
                      {client.contact && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{client.contact}</div>}
                    </td>
                    <td>{client.city || '—'}</td>
                    <td>{client.startDate ? new Date(client.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</td>
                    <td style={{ color: '#f97316', fontWeight: 700 }}>{client.rate}%</td>
                    <td style={{ color: '#e2e8f0', fontWeight: 600 }}>${total.toFixed(2)}</td>
                    <td style={{ color: '#22c55e', fontWeight: 700 }}>${cut.toFixed(2)}</td>
                    <td><span className={`status-badge ${client.status}`}>{client.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="admin-remove-btn" onClick={() => removeClient(client.id)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
