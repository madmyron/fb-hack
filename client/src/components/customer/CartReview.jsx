export default function CartReview({ cart, total, onAdd, onRemove, onBack, onCheckout }) {
  return (
    <div className="cart-review">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Menu</button>
        <h2>Your Order</h2>
      </div>
      <div className="cart-items">
        {cart.map(({ item, qty }) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">${(item.price * qty).toFixed(2)}</span>
            </div>
            <div className="qty-control">
              <button onClick={() => onRemove(item.id)}>−</button>
              <span>{qty}</span>
              <button onClick={() => onAdd(item)}>+</button>
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
