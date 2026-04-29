import { useState } from 'react';
import { API_URL } from '../../config';

const PAYMENT_METHODS = ['Credit/Debit Card', 'Cash', 'Split Bill'];

export default function PaymentModal({ cart, total, location, onBack, onOrderPlaced }) {
  const [method, setMethod] = useState('Credit/Debit Card');
  const [loading, setLoading] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState({ text: '', type: '' });

  const finalTotal = total * (1 - promoDiscount);
  const splitAmount = (finalTotal / splitCount).toFixed(2);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/promos/${promoCode.trim().toUpperCase()}`);
      if (!res.ok) {
        setPromoDiscount(0);
        setPromoMsg({ text: 'Invalid promo code.', type: 'error' });
        return;
      }
      const data = await res.json();
      setPromoDiscount(data.discount);
      setPromoMsg({ text: `${Math.round(data.discount * 100)}% discount applied!`, type: 'success' });
    } catch {
      setPromoMsg({ text: 'Could not apply code. Try again.', type: 'error' });
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          items: cart.map(c => ({
            name: c.item.name,
            qty: c.qty,
            price: c.item.price,
            tag: c.item.tag,
            customizations: c.customizations || {},
          })),
          total: finalTotal,
          paymentMethod: method,
          ...(promoDiscount > 0 && { promoCode: promoCode.trim().toUpperCase(), promoDiscount }),
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
        {cart.map((entry) => (
          <div key={entry.cartKey} className="summary-row">
            <span>{entry.item.name} × {entry.qty}</span>
            <span>${(entry.item.price * entry.qty).toFixed(2)}</span>
          </div>
        ))}
        {promoDiscount > 0 && (
          <div className="summary-row" style={{ color: 'var(--green)' }}>
            <span>Promo ({Math.round(promoDiscount * 100)}% off)</span>
            <span>−${(total * promoDiscount).toFixed(2)}</span>
          </div>
        )}
        <div className="summary-total">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="promo-section">
        <h3>Promo Code</h3>
        <div className="promo-row">
          <input
            className="promo-input"
            type="text"
            placeholder="Enter code"
            value={promoCode}
            onChange={e => { setPromoCode(e.target.value); setPromoMsg({ text: '', type: '' }); setPromoDiscount(0); }}
          />
          <button className="promo-apply-btn" onClick={applyPromo}>Apply</button>
        </div>
        {promoMsg.text && (
          <p className={`promo-feedback ${promoMsg.type}`}>{promoMsg.text}</p>
        )}
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
        {loading ? 'Placing Order...' : `Pay Now — $${finalTotal.toFixed(2)}`}
      </button>
      <p className="payment-note">
        {method === 'Cash' ? 'Your server will collect payment at your table.' : 'Secure payment processed on next screen.'}
      </p>
    </div>
  );
}
