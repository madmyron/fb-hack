import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const VENUE_DATA = {
  bar: {
    today: 7500, month: 142000, ytd: 1050000, avgOrder: 38,
    topItems: ['Draft Lager', 'Classic Margarita', 'IPA', 'Old Fashioned', 'Aperol Spritz'],
  },
  kitchen: {
    today: 5200, month: 103000, ytd: 790000, avgOrder: 52,
    topItems: ['Smash Burger', 'Buffalo Wings', 'Loaded Nachos', 'Margherita Pizza', 'Truffle Fries'],
  },
};

function VenueCard({ name, data }) {
  return (
    <div className="venue-card">
      <h3>{name}</h3>
      <div className="venue-stats">
        <div className="venue-stat"><span>Today</span><strong>${data.today.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>This Month</span><strong>${data.month.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>YTD</span><strong>${data.ytd.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>Avg Order</span><strong>${data.avgOrder}</strong></div>
      </div>
      <div className="top-items">
        <h4>Top Items</h4>
        <ol>{data.topItems.map((item, i) => <li key={i}>{item}</li>)}</ol>
      </div>
    </div>
  );
}

export default function VenueStats() {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/config`)
      .then(r => r.json())
      .then(cfg => {
        setName(cfg.venueName || '');
        setTagline(cfg.venueTagline || '');
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setStatus('Saving...');
    await fetch(`${API_URL}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueName: name, venueTagline: tagline }),
    });
    setStatus('Saved ✓');
    setTimeout(() => setStatus(''), 2000);
  };

  const inp = {
    padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, color: '#1e293b', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div className="venue-stats-page">
      <h2>Venue Performance</h2>
      <div className="venue-grid">
        <VenueCard name="Bar" data={VENUE_DATA.bar} />
        <VenueCard name="Kitchen" data={VENUE_DATA.kitchen} />
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Venue Settings</h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: status.includes('✓') ? '#22c55e' : '#94a3b8' }}>{status}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Venue Name</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Tap Room" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Welcome Tagline</label>
            <input style={inp} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Order from your seat. No waiting." />
          </div>
          <button
            onClick={save}
            disabled={!name.trim()}
            style={{ alignSelf: 'flex-start', padding: '10px 24px', background: '#f97316', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
