import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import OrderCard from '../components/display/OrderCard';
import '../operations.css';
import { API_URL } from '../config';

export default function BarDisplay() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/orders`).then(r => r.json()).then(setOrders);

    const socket = io(API_URL);
    socket.on('new_order', (order) => setOrders(prev => [order, ...prev]));
    socket.on('order_updated', (updated) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    });
    return () => socket.disconnect();
  }, []);

  const active = orders
    .filter(o => o.status !== 'delivered')
    .filter(o => o.items.some(i => i.tag === 'drink'));

  return (
    <div className="display-screen bar">
      <div className="display-header">
        <h1>Bar Display</h1>
        <span className="order-count">{active.length} active</span>
      </div>
      <div className="order-grid">
        {active.length === 0
          ? <div className="empty-state">No active drink orders</div>
          : active.map(order => <OrderCard key={order.id} order={order} filter="drink" />)
        }
      </div>
    </div>
  );
}
