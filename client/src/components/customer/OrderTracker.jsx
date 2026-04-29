import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../../config';

const STEPS = ['received', 'preparing', 'ready', 'delivered'];
const LABELS = { received: 'Order Received', preparing: 'Being Prepared', ready: 'Ready!', delivered: 'Delivered' };
const DESCRIPTIONS = {
  received: "We got your order and it's in the queue.",
  preparing: 'The kitchen and bar are working on it.',
  ready: 'Your order is on its way to you!',
  delivered: 'Enjoy! Thanks for visiting.',
};

export default function OrderTracker({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/orders/${orderId}`).then(r => r.json()).then(setOrder);

    const socket = io(API_URL);
    socket.on('order_updated', (updated) => {
      if (updated.id === orderId) setOrder(updated);
    });
    return () => socket.disconnect();
  }, [orderId]);

  if (!order) return <div className="loading">Loading your order...</div>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="order-tracker">
      <h2>Order Status</h2>
      <p className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      <div className="status-steps">
        {STEPS.map((step, i) => (
          <div key={step} className={`status-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
            <div className="step-dot" />
            <span>{LABELS[step]}</span>
          </div>
        ))}
      </div>
      <div className="status-message">
        <h3>{LABELS[order.status]}</h3>
        <p>{DESCRIPTIONS[order.status]}</p>
      </div>
    </div>
  );
}
