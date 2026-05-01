import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import PhotoUpload from '../components/PhotoUpload.jsx';

export default function CustomerView() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [menu, setMenu] = useState([]);
  const [screen, setScreen] = useState('welcome');
  const [guestName, setGuestName] = useState('');
  const [table, setTable] = useState(searchParams.get('table') || '');
  const [seat, setSeat] = useState(searchParams.get('seat') || '');
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [initialImgSrc, setInitialImgSrc] = useState(null);

  useEffect(() => {
    if (searchParams.get('demo') === '1') return;
    try {
      const saved = JSON.parse(localStorage.getItem(`titi_${eventId}`) || '{}');
      if (saved.guestName) setGuestName(saved.guestName);
      if (saved.table && !searchParams.get('table')) setTable(saved.table);
      if (saved.seat && !searchParams.get('seat')) setSeat(saved.seat);
      if ((saved.screen === 'hub' || saved.screen === 'menu') && saved.guestName) {
        setScreen(saved.screen);
      }
    } catch {}
  }, [eventId]);

  useEffect(() => {
    if (!guestName) return;
    try {
      localStorage.setItem(`titi_${eventId}`, JSON.stringify({ guestName, table, seat, screen }));
    } catch {}
  }, [eventId, guestName, table, seat, screen]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/events/${eventId}`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/menu`).then(r => r.json()),
    ]).then(([ev, mn]) => {
      if (ev.error) { setNotFound(true); return; }
      setEvent(ev);
      setMenu(mn);
      if (mn.length) setActiveCategory(mn[0].id);
    }).catch(() => setNotFound(true));
  }, [eventId]);

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🔗</div>
      <h2 style={{ color: '#d4a843', fontWeight: 900, fontSize: 22 }}>Event Not Found</h2>
      <p style={{ color: '#64748b', fontSize: 15, maxWidth: 300 }}>This link may have expired. Please scan your table QR code again or ask the organizer for the correct link.</p>
    </div>
  );

  if (!event) return <div className="ev-loading"><div className="ev-spinner" /></div>;

  const handlePhotoFile = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const url = URL.createObjectURL(f);
    setInitialImgSrc(url);
    setShowPhotoUpload(true);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

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
  };

  const bgStyle = event.photoUrl
    ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.22)), url(${event.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #fdf4e7 0%, #fce8c2 50%, #f5d5a0 100%)' };

  const menuBgStyle = event.photoUrl
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.62)), url(${event.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const photoUploadEl = showPhotoUpload && (
    <PhotoUpload
      eventId={eventId}
      guestName={guestName}
      table={table}
      photoUrl={event.photoUrl}
      initialImgSrc={initialImgSrc}
      onClose={() => { setShowPhotoUpload(false); setInitialImgSrc(null); }}
      onUploaded={() => {}}
    />
  );

  // ── Order confirmed ──────────────────────────────────────────
  if (ordered) return (
    <div className="ev-screen" style={bgStyle}>
      <div className="ev-confirm-card">
        <div style={{ fontSize: 56, marginBottom: 16 }}>🥂</div>
        <h2 style={{ color: '#f0d080', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 4 }}>We'll bring your drinks right to you, {guestName}.</p>
        {table && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>Table {table}{seat ? `, Seat ${seat}` : ''}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="ev-btn" onClick={() => { setOrdered(false); setScreen('hub'); }}>
            🎉 Back to Party
          </button>
          <button onClick={() => { setOrdered(false); setScreen('menu'); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Order More
          </button>
        </div>
      </div>
    </div>
  );

  // ── Welcome ──────────────────────────────────────────────────
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
        <button className="ev-btn" disabled={!guestName.trim()} onClick={() => setScreen('hub')}>
          Let's Party →
        </button>
        {event.barType === 'open' && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10 }}>Open bar — drinks are on the house 🎉</p>
        )}
      </div>
    </div>
  );

  // ── Hub ──────────────────────────────────────────────────────
  if (screen === 'hub') return (
    <div className="ev-screen" style={bgStyle}>
      <div className="ev-welcome-panel" style={{ gap: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{event.name}</p>
        <h1 className="ev-title" style={{ fontSize: 22, marginBottom: 6 }}>Hi, {guestName}! 🥂</h1>
        {table && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>Table {table}{seat ? ` · Seat ${seat}` : ''}</p>}
        {event.subgreeting && <p className="ev-sub" style={{ marginBottom: 24, fontSize: 13 }}>"{event.subgreeting}"</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button className="ev-btn" onClick={() => setScreen('menu')}>🍹 Order Drinks</button>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <label style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', textAlign: 'center', display: 'block' }}>
              📸 Camera
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoFile} />
            </label>
            <label style={{ flex: 1, padding: '15px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', textAlign: 'center', display: 'block' }}>
              🖼 Gallery
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoFile} />
            </label>
          </div>
        </div>
        <button onClick={() => setScreen('welcome')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}>
          Change Name / Seat
        </button>
      </div>
      {photoUploadEl}
    </div>
  );

  // ── Cart ─────────────────────────────────────────────────────
  if (screen === 'cart') return (
    <div className="ev-menu-screen" style={menuBgStyle}>
      <div className="ev-menu-header">
        <button className="ev-back-btn" onClick={() => setScreen('menu')}>← Menu</button>
        <h2 style={{ color: '#ffffff', fontWeight: 800, fontSize: 18 }}>Your Order</h2>
        <div />
      </div>
      <div style={{ padding: '0 20px', overflowY: 'auto', flex: 1 }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>{item.name}</p>
              {event.barType !== 'open' && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>${item.price.toFixed(2)} each</p>}
            </div>
            <div className="ev-qty">
              <button onClick={() => removeFromCart(item.id)}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => addToCart(item)}>+</button>
            </div>
          </div>
        ))}
        {cart.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)', padding: '32px 0', textAlign: 'center' }}>Your cart is empty.</p>}
        <button className="ev-btn" style={{ marginTop: 24, width: '100%' }} onClick={placeOrder} disabled={submitting || cart.length === 0}>
          {submitting ? 'Placing order...' : `Place Order${event.barType !== 'open' ? ` · $${totalPrice.toFixed(2)}` : ''}`}
        </button>
      </div>
    </div>
  );

  // ── Menu ─────────────────────────────────────────────────────
  const activeCat = menu.find(c => c.id === activeCategory);
  return (
    <div className="ev-menu-screen" style={menuBgStyle}>
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
          <button className="ev-back-btn" onClick={() => setScreen('hub')}>← Back</button>
        )}
      </div>

      <div className="ev-category-tabs">
        {menu.map(cat => (
          <button key={cat.id} className={`ev-tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
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
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700 }}>Sold Out</span>
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

      <div className="ev-photo-bar">
        <label className="ev-photo-btn">
          📸 Camera
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoFile} />
        </label>
        <label className="ev-photo-btn" style={{ marginLeft: 10 }}>
          🖼 Gallery
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoFile} />
        </label>
      </div>

      {photoUploadEl}
    </div>
  );
}
