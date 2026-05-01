import { useState } from 'react';
import LocationEntry from '../components/customer/LocationEntry';
import MenuBrowser from '../components/customer/MenuBrowser';
import CartReview from '../components/customer/CartReview';
import PaymentModal from '../components/customer/PaymentModal';
import OrderTracker from '../components/customer/OrderTracker';

export default function CustomerOrder() {
  const [step, setStep] = useState('location');
  const [location, setLocation] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderId, setOrderId] = useState(null);

  const addToCart = (item, customizations = {}) => {
    const cartKey = `${item.id}__${JSON.stringify(Object.entries(customizations).sort())}`;
    setCart(prev => {
      const existing = prev.find(c => c.cartKey === cartKey);
      if (existing) return prev.map(c => c.cartKey === cartKey ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1, customizations, cartKey }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => {
      const existing = prev.find(c => c.cartKey === cartKey);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(c => c.cartKey !== cartKey);
      return prev.map(c => c.cartKey === cartKey ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="customer-app">
      {step === 'location' && (
        <LocationEntry onConfirm={(loc) => { setLocation(loc); setStep('menu'); }} />
      )}
      {step === 'menu' && (
        <MenuBrowser
          cart={cart}
          cartCount={cartCount}
          location={location}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onViewCart={() => setStep('cart')}
        />
      )}
      {step === 'cart' && (
        <CartReview
          cart={cart}
          total={cartTotal}
          location={location}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onBack={() => setStep('menu')}
          onCheckout={() => setStep('payment')}
        />
      )}
      {step === 'payment' && (
        <PaymentModal
          cart={cart}
          total={cartTotal}
          location={location}
          onBack={() => setStep('cart')}
          onOrderPlaced={(id) => { setOrderId(id); setStep('status'); }}
        />
      )}
      {step === 'status' && <OrderTracker orderId={orderId} />}
    </div>
  );
}
