import { useState, useEffect } from 'react';

const API_URL = 'https://fb-hack-nx6t.onrender.com';
const EVENTS_URL = 'https://tapittapitevents.vercel.app';

const blank = { name: '', greeting: '', subgreeting: '', photoUrl: '', eventType: 'wedding', barType: 'open', tableCount: '10', seatsPerTable: '10', date: '', managerPin: '' };

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const load = () => fetch(`${API_URL}/api/events`).then(r => r.json()).then(setEvents).catch(() => {});

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      greeting: form.greeting || `Welcome to ${form.name}!`,
      subgreeting: form.subgreeting || 'Order drinks and they\'ll be brought right to you.',
      managerPin: form.managerPin || '0000',
    };
    await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setForm(blank);
    setShowForm(false);
    load();
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE' });
    setSelectedEvent(null);
    load();
  };

  const inp = {
    padding: '10px 14px', border: '1px solid #2d3748', borderRadius: 8, fontSize: 14,
    background: '#1a202c', color: '#e2e8f0', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const eventTypeLabel = { wedding: '💍 Wedding', birthday: '🎂 Birthday', corporate: '💼 Corporate', other: '🎉 Other' };
  const barTypeLabel = { open: 'Open Bar', cash: 'Cash Bar', cocktail: 'Cocktail Hour' };

  if (selectedEvent) {
    const guestUrl = `${EVENTS_URL}/${selectedEvent.id}`;
    const barUrl = `${EVENTS_URL}/${selectedEvent.id}/bar`;
    const managerUrl = `${EVENTS_URL}/${selectedEvent.id}/manager`;

    const QRUrl = (url) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setSelectedEvent(null)} style={{ background: '#2d3748', color: '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>← Events</button>
          <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 20 }}>{selectedEvent.name}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Event Type', value: eventTypeLabel[selectedEvent.eventType] || selectedEvent.eventType },
            { label: 'Bar Type', value: barTypeLabel[selectedEvent.barType] || selectedEvent.barType },
            { label: 'Tables', value: `${selectedEvent.tableCount} tables · ${selectedEvent.seatsPerTable} seats each` },
            { label: 'Date', value: selectedEvent.date || '—' },
            { label: 'Manager PIN', value: selectedEvent.managerPin },
            { label: 'Orders', value: selectedEvent.orderCount || 0 },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e293b', border: '1px solid #2d3748', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginTop: 6 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #2d3748', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Event Links & QR Codes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { label: 'Guest Ordering', url: guestUrl, desc: 'Share with guests or put on tables' },
              { label: 'Bar Display', url: barUrl, desc: 'Open on bar/tablet for bartenders' },
              { label: 'Manager Access', url: managerUrl, desc: `PIN: ${selectedEvent.managerPin}` },
            ].map(link => (
              <div key={link.label} style={{ textAlign: 'center' }}>
                <img src={QRUrl(link.url)} alt={link.label} style={{ width: 160, height: 160, borderRadius: 8, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{link.label}</p>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>{link.desc}</p>
                <a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#f97316', fontSize: 12, wordBreak: 'break-all' }}>{link.url}</a>
              </div>
            ))}
          </div>
        </div>

        {selectedEvent.tableCount > 0 && (
          <div style={{ background: '#1e293b', border: '1px solid #2d3748', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h3 style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: 16, fontSize: 16 }}>Table QR Codes</h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Print this page to get cut-out QR codes for each table.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {Array.from({ length: parseInt(selectedEvent.tableCount) }, (_, i) => i + 1).map(t => {
                const url = `${EVENTS_URL}/${selectedEvent.id}?table=${t}`;
                return (
                  <div key={t} style={{ textAlign: 'center', background: '#0f172a', border: '1px solid #2d3748', borderRadius: 10, padding: 12, width: 140 }}>
                    <img src={QRUrl(url)} alt={`Table ${t}`} style={{ width: 110, height: 110 }} />
                    <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 14, marginTop: 8 }}>Table {t}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={() => deleteEvent(selectedEvent.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          Delete Event
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 18 }}>Events</h2>
        <button onClick={() => setShowForm(f => !f)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#162032', border: '1px solid #2d3748', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>New Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input style={inp} placeholder="Event name * (e.g. Sarah & Mike's Wedding)" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <input style={inp} placeholder="Date" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            <input style={inp} placeholder="Welcome greeting (auto-filled if blank)" value={form.greeting} onChange={e => setForm(f => ({...f, greeting: e.target.value}))} />
            <input style={inp} placeholder="Sub-greeting (e.g. Order drinks, we'll bring them to you)" value={form.subgreeting} onChange={e => setForm(f => ({...f, subgreeting: e.target.value}))} />
            <input style={inp} placeholder="Photo URL (link to couple's photo)" value={form.photoUrl} onChange={e => setForm(f => ({...f, photoUrl: e.target.value}))} />
            <input style={inp} placeholder="Manager PIN (default: 0000)" value={form.managerPin} onChange={e => setForm(f => ({...f, managerPin: e.target.value}))} maxLength={4} />
            <input style={inp} placeholder="Number of tables" type="number" value={form.tableCount} onChange={e => setForm(f => ({...f, tableCount: e.target.value}))} />
            <input style={inp} placeholder="Seats per table" type="number" value={form.seatsPerTable} onChange={e => setForm(f => ({...f, seatsPerTable: e.target.value}))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#64748b', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Event Type</label>
              <select style={{...inp}} value={form.eventType} onChange={e => setForm(f => ({...f, eventType: e.target.value}))}>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#64748b', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Bar Type</label>
              <select style={{...inp}} value={form.barType} onChange={e => setForm(f => ({...f, barType: e.target.value}))}>
                <option value="open">Open Bar</option>
                <option value="cash">Cash Bar</option>
                <option value="cocktail">Cocktail Hour</option>
              </select>
            </div>
          </div>
          <button onClick={create} disabled={saving || !form.name.trim()} style={{ background: '#f97316', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #2d3748', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🥂</p>
          <p style={{ color: '#64748b', fontSize: 15 }}>No events yet. Create your first one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(ev => (
            <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ background: '#1e293b', border: '1px solid #2d3748', borderRadius: 14, padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2d3748'}
            >
              <div>
                <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{ev.name}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{eventTypeLabel[ev.eventType]}</span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{barTypeLabel[ev.barType]}</span>
                  {ev.date && <span style={{ color: '#64748b', fontSize: 13 }}>{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#f97316', fontWeight: 700, fontSize: 14 }}>{ev.orderCount} orders</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>{ev.tableCount} tables</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
