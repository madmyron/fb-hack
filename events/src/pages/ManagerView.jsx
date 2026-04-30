import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

export default function ManagerView() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [soldOut, setSoldOut] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    fetch(`${API_URL}/api/events/${eventId}`).then(r => r.json()).then(setEvent).catch(() => {});
  }, [eventId]);

  useEffect(() => {
    if (!authed) return;
    const load = () => Promise.all([
      fetch(`${API_URL}/api/events/${eventId}/orders`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/menu`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/eightysix`).then(r => r.json()),
      fetch(`${API_URL}/api/events/${eventId}/photos`).then(r => r.json()),
    ]).then(([o, m, es, ph]) => { setOrders(o); setMenu(m); setSoldOut(es); setPhotos(ph.photos || []); setGalleryOpen(ph.galleryOpen); }).catch(() => {});
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [authed, eventId]);

  const addDigit = (d) => {
    if (!event) return;
    const next = pin + d;
    if (next.length > 4) return;
    setPin(next);
    setError('');
    if (next.length === 4) {
      if (next === event.managerPin) { setAuthed(true); }
      else { setTimeout(() => { setPin(''); setError('Incorrect PIN.'); }, 300); }
    }
  };

  const deletePhoto = async (photoId) => {
    await fetch(`${API_URL}/api/events/${eventId}/photos/${photoId}`, { method: 'DELETE' });
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const toggleGallery = async () => {
    const res = await fetch(`${API_URL}/api/events/${eventId}/gallery`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open: !galleryOpen }),
    });
    const data = await res.json();
    setGalleryOpen(data.galleryOpen);
  };

  const toggle86 = async (itemId) => {
    const res = await fetch(`${API_URL}/api/events/${eventId}/eightysix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    setSoldOut(data);
  };

  if (!event) return <div className="ev-loading"><div className="ev-spinner" /></div>;

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      <div className="ev-pin-card">
        <p style={{ color: '#d4a843', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>{event.name}</p>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>Caterer / Manager Access</p>
        <div className="ev-pin-dots">
          {[0,1,2,3].map(i => <div key={i} className={`ev-pin-dot ${i < pin.length ? 'filled' : ''}`} />)}
        </div>
        <p style={{ color: '#ef4444', fontSize: 13, minHeight: 20, marginBottom: 8 }}>{error}</p>
        <div className="ev-pin-grid">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="ev-pin-key" onClick={() => addDigit(String(n))}>{n}</button>
          ))}
          <button className="ev-pin-key" onClick={() => { setPin(p => p.slice(0,-1)); setError(''); }}>⌫</button>
          <button className="ev-pin-key" onClick={() => addDigit('0')}>0</button>
          <div />
        </div>
      </div>
    </div>
  );

  const allItems = menu.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.category })));
  const pending = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(8,1,20,0.97)', position: 'relative', zIndex: 1 }}>
      <div style={{ background: 'linear-gradient(135deg, #0d0920, #130d28)', borderBottom: '1px solid rgba(212,168,67,0.2)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
        <div>
          <span style={{ color: '#d4a843', fontWeight: 900, fontSize: 16 }}>{event.name}</span>
          <span style={{ color: '#64748b', fontSize: 13, marginLeft: 12 }}>Manager</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['orders', '86', 'photos'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: tab === t ? '#d4a843' : '#1f2937', color: tab === t ? '#0a0a0a' : '#64748b',
            }}>
              {t === 'orders' ? `Orders${pending > 0 ? ` (${pending})` : ''}` : t === '86' ? '86 Items' : `Photos${photos.length > 0 ? ` (${photos.length})` : ''}`}
            </button>
          ))}
          <button onClick={() => setAuthed(false)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#1f2937', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Lock</button>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        {tab === 'orders' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Orders', value: orders.length },
                { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
                { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
              ].map(s => (
                <div key={s.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px' }}>
                  <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                  <p style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 900, marginTop: 4 }}>{s.value}</p>
                </div>
              ))}
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No orders yet.</p>
            ) : (
              [...orders].reverse().map(order => (
                <div key={order.id} style={{ background: '#111827', border: `1px solid ${order.status === 'pending' ? '#d4a843' : '#1f2937'}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{order.guestName}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: order.status === 'pending' ? 'rgba(212,168,67,0.15)' : order.status === 'ready' ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)',
                      color: order.status === 'pending' ? '#d4a843' : order.status === 'ready' ? '#22c55e' : '#64748b',
                    }}>{order.status}</span>
                  </div>
                  {order.table && <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Table {order.table}{order.seat ? ` · Seat ${order.seat}` : ''}</p>}
                  {order.items?.map((item, i) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: 14 }}>{item.qty}× {item.name}</p>
                  ))}
                </div>
              ))
            )}
          </>
        )}

        {tab === '86' && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 20 }}>
            <h2 style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: 16 }}>86 Items</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '0 12px 10px', borderBottom: '1px solid #1f2937' }}>Item</th>
                  <th style={{ textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '0 12px 10px', borderBottom: '1px solid #1f2937' }}>Category</th>
                  <th style={{ textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '0 12px 10px', borderBottom: '1px solid #1f2937' }}>Status</th>
                  <th style={{ borderBottom: '1px solid #1f2937' }}></th>
                </tr>
              </thead>
              <tbody>
                {allItems.map(item => {
                  const is86 = soldOut.includes(item.id);
                  return (
                    <tr key={item.id} style={{ opacity: is86 ? 0.6 : 1 }}>
                      <td style={{ padding: '12px', color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: 13 }}>{item.categoryName}</td>
                      <td style={{ padding: '12px', color: is86 ? '#ef4444' : '#22c55e', fontSize: 13, fontWeight: 700 }}>{is86 ? "86'd" : 'Available'}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => toggle86(item.id)} style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                          background: is86 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: is86 ? '#22c55e' : '#ef4444',
                        }}>
                          {is86 ? 'Restore' : '86 It'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'photos' && (
          <div>
            {/* Gallery toggle + share link */}
            <div style={{ background: 'rgba(13,9,32,0.8)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>Guest Gallery Link</p>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                  {galleryOpen ? 'Guests can view the gallery at the link below' : 'Enable to give guests access to the full gallery'}
                </p>
                {galleryOpen && (
                  <p style={{ color: '#d4a843', fontSize: 12, marginTop: 6, wordBreak: 'break-all' }}>
                    {window.location.origin}/{eventId}/gallery
                  </p>
                )}
              </div>
              <button onClick={toggleGallery} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: galleryOpen ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                color: galleryOpen ? '#ef4444' : '#22c55e',
              }}>
                {galleryOpen ? 'Close Gallery' : 'Open Gallery'}
              </button>
            </div>

            {photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                <p style={{ fontSize: 15 }}>No photos yet — guests can share from the drink menu.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {[...photos].reverse().map(photo => (
                  <div key={photo.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0d0920', aspectRatio: '1' }}>
                    <img src={photo.url} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '20px 8px 8px' }}>
                      <p style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{photo.guestName}</p>
                      {photo.table && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Table {photo.table}</p>}
                    </div>
                    <button onClick={() => deletePhoto(photo.id)} style={{
                      position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none',
                      color: '#ef4444', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
