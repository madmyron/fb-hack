import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../../config';

const DUMMY_HISTORY = [
  { id: 'h1', location: { type: 'table', number: '3' }, items: [{ name: 'Smash Burger', qty: 2, tag: 'food' }, { name: 'Draft Lager', qty: 2, tag: 'drink' }], total: 50.00, paymentMethod: 'Credit/Debit Card', createdAt: '2026-04-29T18:30:00Z' },
  { id: 'h2', location: { type: 'bar', number: 'B2' }, items: [{ name: 'Classic Margarita', qty: 3, tag: 'drink' }, { name: 'Loaded Nachos', qty: 1, tag: 'food' }], total: 53.00, paymentMethod: 'Cash', createdAt: '2026-04-29T17:15:00Z' },
  { id: 'h3', location: { type: 'table', number: '8' }, items: [{ name: 'Margherita Pizza', qty: 1, tag: 'food' }, { name: 'House Red', qty: 2, tag: 'drink' }], total: 39.00, paymentMethod: 'Split Bill', createdAt: '2026-04-29T16:45:00Z' },
  { id: 'h4', location: { type: 'table', number: '12' }, items: [{ name: 'Buffalo Wings', qty: 1, tag: 'food' }, { name: 'IPA', qty: 4, tag: 'drink' }], total: 48.00, paymentMethod: 'Credit/Debit Card', createdAt: '2026-04-29T15:00:00Z' },
  { id: 'h5', location: { type: 'bar', number: 'B5' }, items: [{ name: 'Old Fashioned', qty: 2, tag: 'drink' }, { name: 'Truffle Fries', qty: 1, tag: 'food' }], total: 38.00, paymentMethod: 'Credit/Debit Card', createdAt: '2026-04-29T14:30:00Z' },
];

const STATUS_COLORS = { received: '#f59e0b', preparing: '#3b82f6', ready: '#22c55e', delivered: '#6b7280' };
const STATUS_LABELS = { received: 'Waiting', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered' };

function getTableStatus(orders) {
  if (orders.some(o => o.status === 'received')) return 'received';
  if (orders.some(o => o.status === 'preparing')) return 'preparing';
  if (orders.some(o => o.status === 'ready')) return 'ready';
  return 'delivered';
}

const elapsed = (ts) => Math.floor((Date.now() - new Date(ts)) / 60000);

const btnStyle = { width: 'auto', padding: '10px 20px', borderRadius: '10px', fontSize: '14px' };

export default function ActiveTables() {
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState('active');

  useEffect(() => {
    fetch(`${API_URL}/api/orders`).then(r => r.json()).then(setOrders);
    const socket = io(API_URL);
    socket.on('new_order', order => setOrders(prev => [...prev, order]));
    socket.on('order_updated', updated => setOrders(prev => prev.map(o => o.id === updated.id ? updated : o)));
    return () => socket.disconnect();
  }, []);

  const tableMap = {};
  orders.forEach(order => {
    const key = `${order.location.type}-${order.location.number}`;
    if (!tableMap[key]) tableMap[key] = { location: order.location, orders: [], total: 0, firstOrder: order.createdAt };
    tableMap[key].orders.push(order);
    tableMap[key].total += order.total;
  });
  const activeTables = Object.values(tableMap).filter(t => t.orders.some(o => o.status !== 'delivered'));

  if (view === 'history') {
    return (
      <div className="table-history">
        <div className="section-header">
          <div>
            <h2>Table History</h2>
            <span className="tables-subtitle" style={{ marginBottom: 0 }}>Today's completed orders</span>
          </div>
          <button className="btn-primary" style={btnStyle} onClick={() => setView('active')}>← Active Tables</button>
        </div>
        <div className="history-list">
          {DUMMY_HISTORY.map(order => (
            <div key={order.id} className="history-card">
              <div className="history-info">
                <div>
                  <div className="history-table">{order.location.type === 'table' ? 'Table' : 'Bar'} {order.location.number}</div>
                  <div className="history-time">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="history-items">{order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
              </div>
              <div className="history-right">
                <div className="history-total">${order.total.toFixed(2)}</div>
                <div className="history-method">{order.paymentMethod}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="active-tables">
      <div className="section-header">
        <div>
          <h2>Active Tables</h2>
          <span className="tables-subtitle">{activeTables.length} table{activeTables.length !== 1 ? 's' : ''} currently open</span>
        </div>
        <button className="btn-primary" style={btnStyle} onClick={() => setView('history')}>View History</button>
      </div>
      {activeTables.length === 0 ? (
        <div className="no-tables">No active tables right now</div>
      ) : (
        <div className="tables-grid">
          {activeTables.map(table => {
            const status = getTableStatus(table.orders);
            const items = table.orders.flatMap(o => o.items);
            const key = `${table.location.type}-${table.location.number}`;
            return (
              <div key={key} className="table-card" style={{ borderTopColor: STATUS_COLORS[status] }}>
                <div className="table-card-header">
                  <div>
                    <div className="table-label">{table.location.type === 'table' ? 'Table' : 'Bar'} {table.location.number}</div>
                    <div className="table-time">{elapsed(table.firstOrder)}m ago</div>
                  </div>
                  <span className="table-status-badge" style={{ background: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status] }}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <div className="table-items">
                  {items.map((item, i) => (
                    <div key={i} className="table-item-row">
                      <span className="table-item-qty">{item.qty}×</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="table-total">
                  <span>Tab Total</span>
                  <span>${table.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
