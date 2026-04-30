import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

export default function BarDisplay() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/events/${eventId}`).then(r => r.json()).then(setEvent).catch(() => {});
  }, [eventId]);

  useEffect(() => {
    const load = () => fetch(`${API_URL}/api/events/${eventId}/orders`).then(r => r.json()).then(setOrders).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const updateStatus = async (orderId, status) => {
    await fetch(`${API_URL}/api/events/${eventId}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const pending = orders.filter(o => o.status === 'pending');
  const ready = orders.filter(o => o.status === 'ready');
  const delivered = orders.filter(o => o.status === 'delivered');

  return (
    <div className="ev-bar-display">
      <div className="ev-bar-header">
        <div>
          <h1 className="ev-bar-title">Bar Display</h1>
          {event && <p className="ev-bar-event">{event.name}</p>}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="ev-bar-count pending">{pending.length} pending</span>
          <span className="ev-bar-count ready">{ready.length} ready</span>
          <span className="ev-bar-count delivered">{delivered.length} delivered</span>
        </div>
      </div>

      <div className="ev-bar-columns">
        <div className="ev-bar-col">
          <h2 className="ev-col-title pending-title">🔔 Pending</h2>
          {pending.length === 0 && <p className="ev-empty">All caught up!</p>}
          {pending.map(order => (
            <div key={order.id} className="ev-order-card pending-card">
              <div className="ev-order-top">
                <span className="ev-order-guest">{order.guestName}</span>
                <span className="ev-order-loc">
                  {order.table ? `Table ${order.table}${order.seat ? ` · Seat ${order.seat}` : ''}` : 'Roaming'}
                </span>
              </div>
              <div className="ev-order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="ev-order-item">
                    <span className="ev-order-qty">{item.qty}×</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
              <button className="ev-action-btn ready-btn" onClick={() => updateStatus(order.id, 'ready')}>
                Mark Ready →
              </button>
            </div>
          ))}
        </div>

        <div className="ev-bar-col">
          <h2 className="ev-col-title ready-title">✓ Ready to Deliver</h2>
          {ready.length === 0 && <p className="ev-empty">Nothing ready yet.</p>}
          {ready.map(order => (
            <div key={order.id} className="ev-order-card ready-card">
              <div className="ev-order-top">
                <span className="ev-order-guest">{order.guestName}</span>
                <span className="ev-order-loc">
                  {order.table ? `Table ${order.table}${order.seat ? ` · Seat ${order.seat}` : ''}` : 'Roaming'}
                </span>
              </div>
              <div className="ev-order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="ev-order-item">
                    <span className="ev-order-qty">{item.qty}×</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
              <button className="ev-action-btn delivered-btn" onClick={() => updateStatus(order.id, 'delivered')}>
                Delivered ✓
              </button>
            </div>
          ))}
        </div>

        <div className="ev-bar-col">
          <h2 className="ev-col-title delivered-title">✓✓ Delivered</h2>
          {delivered.length === 0 && <p className="ev-empty">None yet.</p>}
          {delivered.map(order => (
            <div key={order.id} className="ev-order-card delivered-card">
              <div className="ev-order-top">
                <span className="ev-order-guest" style={{ color: '#64748b' }}>{order.guestName}</span>
                <span className="ev-order-loc">
                  {order.table ? `Table ${order.table}${order.seat ? ` · Seat ${order.seat}` : ''}` : 'Roaming'}
                </span>
              </div>
              <div className="ev-order-items" style={{ opacity: 0.5 }}>
                {order.items?.map((item, i) => (
                  <div key={i} className="ev-order-item">
                    <span className="ev-order-qty">{item.qty}×</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
