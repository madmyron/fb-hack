import { useState } from 'react';

export default function CustomizeModal({ item, onConfirm, onClose }) {
  const [choices, setChoices] = useState({});

  const set = (id, val) => setChoices(prev => ({ ...prev, [id]: val }));

  const canSubmit = item.options.filter(o => o.required).every(o => choices[o.id]);

  const handleAdd = () => {
    const customizations = {};
    item.options.forEach(opt => {
      const val = choices[opt.id];
      if (val !== undefined && val !== '' && val !== false) {
        customizations[opt.id] = val;
      }
    });
    onConfirm(item, customizations);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h3>{item.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-items">
          {item.options.map(opt => (
            <div key={opt.id} className="customize-option">
              <label className="customize-label">
                {opt.label}
                {opt.required && <span className="required-star"> *</span>}
              </label>
              {opt.type === 'select' && (
                <div className="choice-row">
                  {opt.choices.map(choice => (
                    <button
                      key={choice}
                      className={`choice-btn ${choices[opt.id] === choice ? 'active' : ''}`}
                      onClick={() => set(opt.id, choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              {opt.type === 'toggle' && (
                <button
                  className={`choice-btn ${choices[opt.id] ? 'toggle-active' : ''}`}
                  onClick={() => set(opt.id, !choices[opt.id])}
                >
                  {choices[opt.id] ? '✓ Yes' : 'No'}
                </button>
              )}
              {opt.type === 'text' && (
                <input
                  className="dest-input"
                  type="text"
                  placeholder="Type here..."
                  value={choices[opt.id] || ''}
                  onChange={e => set(opt.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={!canSubmit}>
          Add to Order — ${item.price.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
