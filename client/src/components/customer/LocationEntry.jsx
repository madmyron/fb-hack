import { useState } from 'react';

export default function LocationEntry({ onConfirm }) {
  const [type, setType] = useState('table');
  const [number, setNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number.trim()) return;
    onConfirm({ type, number: number.trim() });
  };

  return (
    <div className="location-entry">
      <div className="location-header">
        <h1>The Tap Room</h1>
        <p>Welcome! Where are you sitting?</p>
      </div>
      <form onSubmit={handleSubmit} className="location-form">
        <div className="type-toggle">
          <button type="button" className={type === 'table' ? 'active' : ''} onClick={() => setType('table')}>
            Table
          </button>
          <button type="button" className={type === 'bar' ? 'active' : ''} onClick={() => setType('bar')}>
            Bar Spot
          </button>
        </div>
        <input
          type="text"
          placeholder={type === 'table' ? 'Table number (e.g. 7)' : 'Bar spot (e.g. B3)'}
          value={number}
          onChange={e => setNumber(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={!number.trim()}>
          See the Menu
        </button>
      </form>
    </div>
  );
}
