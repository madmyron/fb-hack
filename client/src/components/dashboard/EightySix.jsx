import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

export default function EightySix() {
  const [menu, setMenu] = useState([]);
  const [soldOut, setSoldOut] = useState(new Set());
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/menu`).then(r => r.json()),
      fetch(`${API_URL}/api/menu/eightysix`).then(r => r.json()),
    ]).then(([menuData, esData]) => {
      setMenu(menuData);
      setSoldOut(new Set(esData));
    });
  }, []);

  const toggle = async (itemId) => {
    setSaving(itemId);
    const res = await fetch(`${API_URL}/api/menu/eightysix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    setSoldOut(new Set(data.eightySixed));
    setSaving(null);
  };

  const allItems = menu.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.category }))
  );
  const soldOutCount = soldOut.size;

  return (
    <div className="server-table">
      <div className="section-header">
        <div>
          <h2>86 Items</h2>
          <span style={{ color: '#64748b', fontSize: 14, display: 'block', marginTop: 4 }}>
            Mark items as sold out — they'll appear as unavailable to customers
          </span>
        </div>
        <span style={{
          padding: '8px 18px', borderRadius: 20, fontWeight: 800, fontSize: 14,
          background: soldOutCount > 0 ? '#fee2e2' : '#f0fdf4',
          color: soldOutCount > 0 ? '#ef4444' : '#16a34a',
        }}>
          {soldOutCount === 0 ? 'All items available' : `${soldOutCount} item${soldOutCount !== 1 ? 's' : ''} 86'd`}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Type</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allItems.map(item => {
            const is86 = soldOut.has(item.id);
            return (
              <tr key={item.id} style={{ opacity: is86 ? 0.55 : 1 }}>
                <td>
                  <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>${item.price.toFixed(2)}</div>
                </td>
                <td style={{ color: '#64748b', fontSize: 14 }}>{item.categoryName}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: item.tag === 'food' ? '#fff7ed' : '#eff6ff',
                    color: item.tag === 'food' ? '#f97316' : '#3b82f6',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{item.tag}</span>
                </td>
                <td>
                  <span style={{ fontSize: 13, fontWeight: 700, color: is86 ? '#ef4444' : '#22c55e' }}>
                    {is86 ? "86'd" : 'Available'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggle(item.id)}
                    disabled={saving === item.id}
                    style={{
                      padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                      background: is86 ? '#f0fdf4' : '#fee2e2',
                      color: is86 ? '#16a34a' : '#ef4444',
                    }}
                  >
                    {saving === item.id ? '...' : is86 ? 'Restore' : '86 It'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
