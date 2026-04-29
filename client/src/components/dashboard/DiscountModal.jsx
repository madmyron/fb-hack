import { useState } from 'react';
import { API_URL } from '../../config';

const OPTIONS = [
  { label: '10% Off', pct: 0.10 },
  { label: '20% Off', pct: 0.20 },
  { label: '25% Off', pct: 0.25 },
  { label: '50% Off', pct: 0.50 },
  { label: '100% Comp', pct: 1.00 },
];

export default function DiscountModal({ table, managerName, onClose, onApplied }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const label = `${table.location.type === 'table' ? 'Table' : 'Bar'} ${table.location.number}`;
  const discountedTotal = selected !== null ? table.total * (1 - selected) : table.total;

  const apply = async () => {
    if (selected === null) return;
    setLoading(true);
    await fetch(`${API_URL}/api/orders/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: table.location, pct: selected, managerName }),
    });
    onApplied();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Discount — {label}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-items">
          {OPTIONS.map(opt => (
            <div key={opt.pct} className="modal-item" style={{ cursor: 'pointer' }} onClick={() => setSelected(opt.pct)}>
              <input type="radio" readOnly checked={selected === opt.pct} style={{ width: 18, height: 18, accentColor: '#f97316' }} />
              <span className="modal-item-name">{opt.label}</span>
              {selected === opt.pct && (
                <span className="modal-item-count">${(table.total * (1 - opt.pct)).toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
        {selected !== null && (
          <p style={{ textAlign: 'center', marginBottom: 16, color: '#64748b', fontSize: 14 }}>
            Tab total: <strong style={{ color: '#1e293b' }}>${discountedTotal.toFixed(2)}</strong>
          </p>
        )}
        <button className="btn-primary" onClick={apply} disabled={loading || selected === null}>
          {loading ? 'Applying...' : 'Apply Discount'}
        </button>
      </div>
    </div>
  );
}
