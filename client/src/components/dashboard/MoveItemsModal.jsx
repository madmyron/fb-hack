import { useState } from 'react';
import { API_URL } from '../../config';

export default function MoveItemsModal({ table, onClose, onMoved }) {
  const [selected, setSelected] = useState({});
  const [destType, setDestType] = useState('table');
  const [destNumber, setDestNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = table.orders
    .filter(o => o.status !== 'delivered')
    .flatMap(o => o.items.map(item => ({ ...item, orderId: o.id })));

  const key = (item) => `${item.orderId}||${item.name}`;

  const toggle = (item) => {
    const k = key(item);
    setSelected(prev => {
      if (prev[k]) { const { [k]: _, ...rest } = prev; return rest; }
      return { ...prev, [k]: item.qty };
    });
  };

  const setQty = (item, qty) => setSelected(prev => ({ ...prev, [key(item)]: qty }));

  const handleMove = async () => {
    if (!destNumber.trim()) { setError('Enter a destination.'); return; }
    const transfers = Object.entries(selected).map(([k, qty]) => {
      const [orderId, itemName] = k.split('||');
      return { orderId, itemName, qty };
    });
    if (transfers.length === 0) { setError('Select at least one item.'); return; }

    setLoading(true);
    try {
      await fetch(`${API_URL}/api/orders/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transfers, toLocation: { type: destType, number: destNumber.trim() } }),
      });
      onMoved();
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const sourceLabel = `${table.location.type === 'table' ? 'Table' : 'Bar'} ${table.location.number}`;
  const anySelected = Object.keys(selected).length > 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Move Items — {sourceLabel}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-items">
          {items.map(item => {
            const k = key(item);
            const isSelected = !!selected[k];
            const qty = selected[k] || item.qty;
            return (
              <div key={k} className="modal-item">
                <input type="checkbox" checked={isSelected} onChange={() => toggle(item)} />
                <span className="modal-item-name">{item.name}</span>
                {isSelected && item.qty > 1 ? (
                  <div className="modal-item-qty">
                    <button onClick={() => setQty(item, Math.max(1, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(item, Math.min(item.qty, qty + 1))}>+</button>
                  </div>
                ) : (
                  <span className="modal-item-count">×{item.qty}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="modal-destination">
          <h4>Move to</h4>
          <div className="dest-toggle">
            <button className={destType === 'table' ? 'active' : ''} onClick={() => setDestType('table')}>Table</button>
            <button className={destType === 'bar' ? 'active' : ''} onClick={() => setDestType('bar')}>Bar Spot</button>
          </div>
          <input
            className="dest-input"
            type="text"
            placeholder={destType === 'table' ? 'Table number (e.g. 5)' : 'Bar spot (e.g. B3)'}
            value={destNumber}
            onChange={e => { setDestNumber(e.target.value); setError(''); }}
          />
        </div>

        {error && <p className="modal-error">{error}</p>}
        <button className="btn-primary" onClick={handleMove} disabled={loading || !anySelected}>
          {loading ? 'Moving...' : 'Move Selected Items'}
        </button>
      </div>
    </div>
  );
}
