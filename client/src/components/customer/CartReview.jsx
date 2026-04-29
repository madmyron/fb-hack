export default function CartReview({ cart, total, onAdd, onRemove, onBack, onCheckout }) {
  return (
    <div className="cart-review">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Menu</button>
        <h2>Your Order</h2>
      </div>
      <div className="cart-items">
        {cart.map((entry) => (
          <div key={entry.cartKey} className="cart-item">
            <div className="cart-item-info">
              <div>
                <span className="cart-item-name">{entry.item.name}</span>
                {entry.customizations && Object.keys(entry.customizations).length > 0 && (
                  <div className="cart-item-customizations">
                    {Object.entries(entry.customizations).map(([k, v]) => (
                      <span key={k}>{typeof v === 'boolean' ? k.replace(/_/g, ' ') : v}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="cart-item-price">${(entry.item.price * entry.qty).toFixed(2)}</span>
            </div>
            <div className="qty-control">
              <button onClick={() => onRemove(entry.cartKey)}>−</button>
              <span>{entry.qty}</span>
              <button onClick={() => onAdd(entry.item, entry.customizations)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button className="btn-primary" onClick={onCheckout}>Proceed to Payment</button>
    </div>
  );
}
