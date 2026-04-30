import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';

export default function CustomerView() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [menu, setMenu] = useState([]);
  const [screen, setScreen] = useState('welcome');
  const [guestName, setGuestName] = useState('');
  const [table, setTable] = useState(searchParams.get('table') || '');
  const [seat, setSeat] = useState(searchParams.get('seat') || '');
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/events/${eventId}`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/menu`).then(r => r.json()),
    ]).then(([ev, mn]) => {
      setEvent(ev);
      setMenu(mn);
      if (mn.length) setActiveCategory(mn[0].id);
    }).catch(() => {});
  }, [eventId]);

  if (!event) return (
    <div className="ev-loading"><div className="ev-spinner" /></div>
  );

  const addToCart = (item) => setCart(prev => {
    const ex = prev.find(c => c.id === item.id);
    if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    return [...prev, { ...item, qty: 1 }];
  });

  const removeFromCart = (id) => setCart(prev => {
    const ex = prev.find(c => c.id === id);
    if (!ex) return prev;
    if (ex.qty === 1) return prev.filter(c => c.id !== id);
    return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
  });

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.qty * c.price, 0);

  const placeOrder = async () => {
    if (!guestName.trim()) return;
    setSubmitting(true);
    await fetch(`${API_URL}/api/events/${eventId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: guestName.trim(),
        table: table.trim(),
        seat: seat.trim(),
        items: cart,
        total: event.barType === 'open' ? 0 : totalPrice,
        barType: event.barType,
      }),
    });
    setSubmitting(false);
    setOrdered(true);
    setCart([]);
    setScreen('welcome');
  };

  const bgStyle = event.photoUrl
    ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.78)), url(${event.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' };

  if (ordered) return (
    <div className="ev-screen" style={bgStyle}>
      <div className="ev-confirm-card">
        <div style={{ fontSize: 56, marginBottom: 16 }}>🥂</div>
        <h2 style={{ color: '#d4a843', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 4 }}>We'll bring your drinks right to you, {guestName}.</p>
        {table && <p style={{ color: '#94a3b8', fontSize: 14 }}>Table {table}{seat ? `, Seat ${seat}` : ''}</p>}
        <button className="ev-btn" style={{ marginTop: 28 }} onClick={() => setOrdered(false)}>
          Order More
        </button>
      </div>
    </div>
  );

  if (screen === 'welcome') return (
    <div className="ev-screen" style={bgStyle}>
      <div className="ev-welcome-panel">
        <span className="ev-badge">🥂 Tap It Tap It Events</span>
        <h1 className="ev-title">{event.greeting}</h1>
        <p className="ev-sub">{event.subgreeting}</p>
        <div className="ev-form-group">
          <input className="ev-input" placeholder="Your name *" value={guestName} onChange={e => setGuestName(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="ev-input" placeholder="Table #" value={table} onChange={e => setTable(e.target.value)} style={{ flex: 1 }} />
            <input className="ev-input" placeholder="Seat #" value={seat} onChange={e => setSeat(e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <button className="ev-btn" disabled={!guestName.trim()} onClick={() => setScreen('menu')}>
          See the Drink Menu →
        </button>
        {event.barType === 'open' && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 12 }}>Open bar — drinks are on the house 🎉</p>
        )}
      </div>
    </div>
  );

  if (screen === 'cart') {
    return (
      <div className="ev-menu-screen">
        <div className="ev-menu-header">
          <button className="ev-back-btn" onClick={() => setScreen('menu')}>← Menu</button>
          <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 18 }}>Your Order</h2>
          <div />
        </div>
        <div style={{ padding: '0 20px' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e293b' }}>
              <div>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>{item.name}</p>
                {event.barType !== 'open' && <p style={{ color: '#64748b', fontSize: 13 }}>${item.price.toFixed(2)} each</p>}
              </div>
              <div className="ev-qty">
                <button onClick={() => removeFromCart(item.id)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <p style={{ color: '#64748b', padding: '32px 0', textAlign: 'center' }}>Your cart is empty.</p>}
          <button className="ev-btn" style={{ marginTop: 24, width: '100%' }} onClick={placeOrder} disabled={submitting || cart.length === 0}>
            {submitting ? 'Placing order...' : `Place Order${event.barType !== 'open' ? ` · $${totalPrice.toFixed(2)}` : ''}`}
          </button>
        </div>
      </div>
    );
  }

  // menu screen
  const activeCat = menu.find(c => c.id === activeCategory);
  return (
    <div className="ev-menu-screen">
      <div className="ev-menu-header">
        <div>
          <p className="ev-menu-event-name">{event.name}</p>
          <p className="ev-menu-guest">Hi, {guestName}{table ? ` · Table ${table}${seat ? ` Seat ${seat}` : ''}` : ''}</p>
        </div>
        {totalItems > 0 ? (
          <button className="ev-cart-btn" onClick={() => setScreen('cart')}>
            🛒 {totalItems} {event.barType !== 'open' ? `· $${totalPrice.toFixed(2)}` : ''}
          </button>
        ) : (
          <button className="ev-back-btn" onClick={() => setScreen('welcome')}>← Back</button>
        )}
      </div>

      <div className="ev-category-tabs">
        {menu.map(cat => (
          <button
            key={cat.id}
            className={`ev-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.category}
          </button>
        ))}
      </div>

      <div className="ev-items">
        {activeCat?.items.map(item => {
          const qty = cart.find(c => c.id === item.id)?.qty || 0;
          if (item.soldOut) return (
            <div key={item.id} className="ev-item ev-item-soldout">
              <div>
                <p className="ev-item-name">{item.name}</p>
                <p className="ev-item-desc">{item.description}</p>
              </div>
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>Sold Out</span>
            </div>
          );
          return (
            <div key={item.id} className="ev-item">
              <div style={{ flex: 1 }}>
                <p className="ev-item-name">{item.name}</p>
                <p className="ev-item-desc">{item.description}</p>
                {event.barType !== 'open' && <p className="ev-item-price">${item.price.toFixed(2)}</p>}
              </div>
              <div className="ev-qty">
                {qty > 0 ? (
                  <>
                    <button onClick={() => removeFromCart(item.id)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </>
                ) : (
                  <button className="ev-add-btn" onClick={() => addToCart(item)}>Add</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
