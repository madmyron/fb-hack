import { useEffect, useState } from 'react';
import { API_URL } from '../../config';

export default function Reports() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/orders`).then(r => r.json()).then(setOrders);
  }, []);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const discountedOrders = orders.filter(o => o.discount);
  const promoOrders = orders.filter(o => o.promoCode);

  const byManager = discountedOrders.reduce((acc, o) => {
    const name = o.discount.managerName;
    if (!acc[name]) acc[name] = { count: 0, pcts: [] };
    acc[name].count++;
    acc[name].pcts.push(Math.round(o.discount.pct * 100));
    return acc;
  }, {});

  const byPromo = promoOrders.reduce((acc, o) => {
    acc[o.promoCode] = (acc[o.promoCode] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="sales-stats">
      <h2>Reports — Today</h2>
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Sales</span>
          <span className="stat-value">${totalSales.toFixed(2)}</span>
          <span className="stat-sub">{orders.length} orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Discounts Applied</span>
          <span className="stat-value">{discountedOrders.length}</span>
          <span className="stat-sub">by managers</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Promo Codes Used</span>
          <span className="stat-value">{promoOrders.length}</span>
          <span className="stat-sub">by customers</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="venue-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Discounts by Manager</h3>
          {Object.keys(byManager).length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No discounts applied this session.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Count</th>
                  <th>Discounts</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byManager).map(([name, data]) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 700 }}>{name}</td>
                    <td>{data.count}</td>
                    <td style={{ color: '#64748b' }}>{data.pcts.map(p => `${p}%`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="venue-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>Promo Codes Used</h3>
          {Object.keys(byPromo).length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No promo codes used this session.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Times Used</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byPromo).map(([code, count]) => (
                  <tr key={code}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{code}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
