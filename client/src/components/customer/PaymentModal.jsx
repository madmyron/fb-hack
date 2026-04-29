import { useState } from 'react';
import { API_URL } from '../../config';

const PAYMENT_METHODS = ['Credit/Debit Card', 'Cash', 'Split Bill'];

export default function PaymentModal({ cart, total, location, onBack, onOrderPlaced }) {
  const [method, setMethod] = useState('Credit/Debit Card');
  const [loading, setLoading] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  const splitAmount = (total / splitCount).toFixed(2);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          items: cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price, tag: c.item.tag })),
          total,
          paymentMethod: method,
        }),
      });
      const order = await res.json();
      onOrderPlaced(order.id);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Cart</button>
        <h2>Payment</h2>
      </div>
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.map(({ item, qty }) => (
          <div key={item.id} className="summary-row">
            <span>{item.name} × {qty}</span>
            <span>${(item.price * qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="payment-methods">
        <h3>How would you like to pay?</h3>
        {PAYMENT_METHODS.map(m => (
          <button key={m} className={`method-btn ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
            {m}
          </button>
        ))}
      </div>
      {method === 'Split Bill' && (
        <div className="split-control">
          <p>Split between:</p>
          <div className="qty-control">
            <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))}>−</button>
            <span>{splitCount} people</span>
            <button onClick={() => setSplitCount(splitCount + 1)}>+</button>
          </div>
          <p className="split-amount">${splitAmount} per person</p>
        </div>
      )}
      <button className="btn-primary pay-btn" onClick={handlePay} disabled={loading}>
        {loading ? 'Placing Order...' : `Pay Now — $${total.toFixed(2)}`}
      </button>
      <p className="payment-note">
        {method === 'Cash' ? 'Your server will collect payment at your table.' : 'Secure payment processed on next screen.'}
      </p>
    </div>
  );
}
