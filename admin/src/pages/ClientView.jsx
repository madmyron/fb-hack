import { useState } from 'react';

export default function ClientView({ client, orders, onBack, onUpdateRate }) {
  const [showInvoice, setShowInvoice] = useState(false);
  const [rate, setRate] = useState(String(client.rate));
  const [editingRate, setEditingRate] = useState(false);

  const total = orders.reduce((s, o) => s + (o.total || 0), 0);
  const cut = total * client.rate / 100;
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${client.name.slice(0, 3).toUpperCase()}`;

  const saveRate = () => {
    onUpdateRate(parseFloat(rate) || client.rate);
    setEditingRate(false);
  };

  if (showInvoice) {
    return (
      <div className="admin-app">
        <div className="admin-header no-print">
          <div className="admin-brand">
            <span className="admin-logo-text">F&B Hack</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="admin-back-btn" onClick={() => setShowInvoice(false)}>← Back</button>
            <button className="admin-save-btn" onClick={() => window.print()}>Print / Save PDF</button>
          </div>
        </div>

        <div className="invoice-page">
          <div className="invoice-header">
            <div>
              <h1 className="invoice-brand">F&B Hack</h1>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>fnbhack.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="invoice-number">{invoiceNum}</p>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Date: {now.toLocaleDateString()}</p>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>Period: {monthName}</p>
            </div>
          </div>

          <div className="invoice-parties">
            <div>
              <p className="invoice-party-label">From</p>
              <p className="invoice-party-name">F&B Hack</p>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Platform Services</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>michael@dasaroland.com</p>
            </div>
            <div>
              <p className="invoice-party-label">Bill To</p>
              <p className="invoice-party-name">{client.name}</p>
              {client.contact && <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{client.contact}</p>}
              {client.email && <p style={{ color: '#64748b', fontSize: 14 }}>{client.email}</p>}
              {client.phone && <p style={{ color: '#64748b', fontSize: 14 }}>{client.phone}</p>}
              {client.city && <p style={{ color: '#64748b', fontSize: 14 }}>{client.city}</p>}
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th style={{ textAlign: 'right' }}>Amount Due</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>F&B Hack Platform Fee — {monthName}</td>
                <td style={{ textAlign: 'center' }}>{orders.length}</td>
                <td style={{ textAlign: 'right' }}>${total.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{client.rate}%</td>
                <td style={{ textAlign: 'right' }}><strong>${cut.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-total">
            <span>Total Due</span>
            <span>${cut.toFixed(2)}</span>
          </div>

          <p style={{ marginTop: 48, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
            Thank you for partnering with F&B Hack. Questions? michael@dasaroland.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <div className="admin-header">
        <div className="admin-brand">
          <button className="admin-back-btn" onClick={onBack}>← Clients</button>
          <span style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 18 }}>{client.name}</span>
        </div>
        <button className="admin-save-btn" onClick={() => setShowInvoice(true)}>
          Generate Invoice
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-stats-row">
          <div className="admin-stat">
            <span className="admin-stat-label">Total Orders</span>
            <span className="admin-stat-value">{orders.length}</span>
            <span className="admin-stat-sub">this session</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Gross Revenue</span>
            <span className="admin-stat-value">${total.toFixed(2)}</span>
            <span className="admin-stat-sub">through the app</span>
          </div>
          <div className="admin-stat highlight">
            <span className="admin-stat-label">Your Cut ({client.rate}%)</span>
            <span className="admin-stat-value">${cut.toFixed(2)}</span>
            <span className="admin-stat-sub">owed to you</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Commission Rate</span>
            <span className="admin-stat-value" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {editingRate ? (
                <>
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    style={{ width: 70, padding: '6px 10px', borderRadius: 8, border: '1px solid #f97316', background: '#1a202c', color: '#f97316', fontSize: 18, fontWeight: 700, outline: 'none' }}
                  />
                  <span style={{ fontSize: 18 }}>%</span>
                  <button onClick={saveRate} style={{ padding: '6px 14px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Save</button>
                </>
              ) : (
                <>
                  <span>{client.rate}%</span>
                  <button onClick={() => setEditingRate(true)} style={{ padding: '5px 12px', background: '#2d3748', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Edit</button>
                </>
              )}
            </span>
          </div>
        </div>

        {(client.contact || client.email || client.phone || client.city) && (
          <div className="admin-section" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: 12 }}>Contact Info</h3>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {client.contact && <span style={{ color: '#e2e8f0', fontSize: 14 }}>{client.contact}</span>}
              {client.email && <span style={{ color: '#94a3b8', fontSize: 14 }}>{client.email}</span>}
              {client.phone && <span style={{ color: '#94a3b8', fontSize: 14 }}>{client.phone}</span>}
              {client.city && <span style={{ color: '#94a3b8', fontSize: 14 }}>{client.city}</span>}
            </div>
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Order History</h2>
            <span style={{ color: '#64748b', fontSize: 14 }}>{orders.length} orders this session</span>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: '#64748b', padding: '16px 0', fontSize: 14 }}>No orders recorded yet this session.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Items</th>
                  <th>Order Total</th>
                  <th>Promo</th>
                  <th>Manager Discount</th>
                  <th>Your Cut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const loc = order.location
                    ? `${order.location.type === 'table' ? 'Table' : 'Bar'} ${order.location.number}`
                    : '—';
                  const itemCount = order.items?.reduce((s, it) => s + (it.qty || 1), 0) || 0;
                  const orderCut = (order.total || 0) * client.rate / 100;
                  return (
                    <tr key={i}>
                      <td style={{ color: '#e2e8f0', fontWeight: 600 }}>{loc}</td>
                      <td>{itemCount} items</td>
                      <td style={{ color: '#e2e8f0', fontWeight: 600 }}>${(order.total || 0).toFixed(2)}</td>
                      <td style={{ color: order.promoCode ? '#a78bfa' : '#475569' }}>
                        {order.promoCode || '—'}
                      </td>
                      <td style={{ color: order.discount ? '#f97316' : '#475569' }}>
                        {order.discount ? `${Math.round(order.discount.pct * 100)}% by ${order.discount.managerName}` : '—'}
                      </td>
                      <td style={{ color: '#22c55e', fontWeight: 700 }}>${orderCut.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
