import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config';

const ICONS = [
  { e: '🍺', d: '0s' }, { e: '🍹', d: '0.6s' }, { e: '🥂', d: '1.2s' }, { e: '🍔', d: '0.3s' },
  { e: '🌮', d: '1.5s' }, { e: '🍕', d: '0.9s' }, { e: '🍸', d: '0.4s' }, { e: '🎉', d: '1.1s' },
];

export default function LocationEntry({ onConfirm }) {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const [screen, setScreen] = useState('welcome');
  const [type, setType] = useState('table');
  const [number, setNumber] = useState('');
  const [saved, setSaved] = useState(null);
  const [venueName, setVenueName] = useState('The Tap Room');
  const [venueTagline, setVenueTagline] = useState('Order food & drinks from your seat. No waiting. No flagging.');

  useEffect(() => {
    if (!isDemo) {
      try {
        const s = localStorage.getItem('taproom_loc');
        if (s) setSaved(JSON.parse(s));
      } catch {}
    }
    fetch(`${API_URL}/api/config`)
      .then(r => r.json())
      .then(cfg => {
        if (cfg.venueName) setVenueName(cfg.venueName);
        if (cfg.venueTagline) setVenueTagline(cfg.venueTagline);
      })
      .catch(() => {});
  }, []);

  const confirm = (loc) => {
    localStorage.setItem('taproom_loc', JSON.stringify(loc));
    onConfirm(loc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number.trim()) return;
    confirm({ type, number: number.trim() });
  };

  if (screen === 'welcome') {
    return (
      <div className="welcome-screen">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />

        <div className="icon-grid">
          {ICONS.map(({ e, d }, i) => (
            <span key={i} className="float-icon" style={{ animationDelay: d }}>{e}</span>
          ))}
        </div>

        <div className="welcome-panel">
          <span className="venue-badge">✦ Est. Good Times ✦</span>
          <h1 className="venue-title">{venueName}</h1>
          <p className="venue-sub">{venueTagline}</p>

          {saved ? (
            <>
              <button className="quick-btn" onClick={() => confirm(saved)}>
                ⚡ Back to {saved.type === 'table' ? 'Table' : 'Bar'} {saved.number}
              </button>
              <button className="btn-primary welcome-main-btn" onClick={() => setScreen('location')}>
                I'm Somewhere New
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary welcome-main-btn" onClick={() => setScreen('location')}>
                Let's Order
              </button>
              <button className="skip-link" onClick={() => setScreen('location')}>
                Been here before? Skip setup →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="location-entry">
      <div className="location-header">
        <button className="back-btn" style={{ marginBottom: 32 }} onClick={() => setScreen('welcome')}>← Back</button>
        <div className="step-tag">Where are you sitting?</div>
        <h1>Find Your Spot</h1>
        <p>We'll send your order right to you.</p>
      </div>
      <form onSubmit={handleSubmit} className="location-form">
        <div className="type-toggle">
          <button type="button" className={type === 'table' ? 'active' : ''} onClick={() => setType('table')}>
            🪑 Table
          </button>
          <button type="button" className={type === 'bar' ? 'active' : ''} onClick={() => setType('bar')}>
            🍺 Bar Spot
          </button>
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder={type === 'table' ? 'Table number (e.g. 7)' : 'Bar spot (e.g. B3)'}
          value={number}
          onChange={e => setNumber(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={!number.trim()}>
          See the Menu →
        </button>
      </form>
    </div>
  );
}
