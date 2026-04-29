import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const blank = { name: '', description: '', price: '', badge: '', tag: 'food' };

export default function SpecialsEditor() {
  const [specials, setSpecials] = useState([]);
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/menu/specials`).then(r => r.json()).then(setSpecials);
  }, []);

  const save = async (items) => {
    setStatus('Saving...');
    await fetch(`${API_URL}/api/menu/specials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    setStatus('Saved ✓');
    setTimeout(() => setStatus(''), 2000);
  };

  const remove = (id) => {
    const updated = specials.filter(s => s.id !== id);
    setSpecials(updated);
    save(updated);
  };

  const add = () => {
    if (!form.name.trim() || !form.price) return;
    const item = {
      id: `sp-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      tag: form.tag,
      badge: form.badge.trim() || 'Special',
    };
    const updated = [...specials, item];
    setSpecials(updated);
    save(updated);
    setForm(blank);
  };

  const inp = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b', outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div className="server-table">
      <div className="section-header">
        <h2>Today's Specials</h2>
        <span style={{ color: status.includes('✓') ? '#22c55e' : '#94a3b8', fontSize: 14, fontWeight: 600 }}>{status || `${specials.length} active`}</span>
      </div>

      {specials.length === 0 ? (
        <p style={{ color: '#94a3b8', padding: '20px 0', fontSize: 15 }}>No specials today. Add one below.</p>
      ) : (
        <table style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Type</th>
              <th>Badge</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {specials.map(s => (
              <tr key={s.id}>
                <td>
                  <strong style={{ color: '#1e293b' }}>{s.name}</strong>
                  {s.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.description}</div>}
                </td>
                <td>${s.price.toFixed(2)}</td>
                <td style={{ color: s.tag === 'food' ? '#f97316' : '#3b82f6', fontWeight: 700, fontSize: 13 }}>{s.tag}</td>
                <td style={{ fontSize: 13, color: '#64748b' }}>{s.badge}</td>
                <td><button className="remove-btn" onClick={() => remove(s.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>Add a Special</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <input style={inp} placeholder="Item name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input style={inp} placeholder="Price (e.g. 22)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input style={inp} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 16 }}>
          <input style={inp} placeholder="Badge label (e.g. Chef's Pick)" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} />
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => setForm(f => ({ ...f, tag: 'food' }))} style={{ padding: '10px 16px', background: form.tag === 'food' ? '#f97316' : 'white', color: form.tag === 'food' ? 'white' : '#64748b', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>Food</button>
            <button onClick={() => setForm(f => ({ ...f, tag: 'drink' }))} style={{ padding: '10px 16px', background: form.tag === 'drink' ? '#3b82f6' : 'white', color: form.tag === 'drink' ? 'white' : '#64748b', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>Drink</button>
          </div>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }} onClick={add} disabled={!form.name.trim() || !form.price}>
          + Add Special
        </button>
      </div>
    </div>
  );
}
