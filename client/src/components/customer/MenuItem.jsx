import { useState } from 'react';
import CustomizeModal from './CustomizeModal';

export default function MenuItem({ item, qty, onAdd, onRemove }) {
  const [showModal, setShowModal] = useState(false);
  const hasOptions = item.options?.length > 0;

  if (item.soldOut) {
    return (
      <div className="menu-item menu-item-soldout">
        <div className="menu-item-info">
          <div className="menu-item-name-row">
            <h3>{item.name}</h3>
            <span className="item-badge" style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>Sold Out</span>
          </div>
          <p>{item.description}</p>
          <span className="price" style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>${item.price.toFixed(2)}</span>
        </div>
        <span style={{ fontSize: 22, opacity: 0.3 }}>✕</span>
      </div>
    );
  }

  const handleAdd = () => {
    if (hasOptions) setShowModal(true);
    else onAdd(item, {});
  };

  const handleConfirm = (itm, customizations) => {
    onAdd(itm, customizations);
    setShowModal(false);
  };

  return (
    <>
      <div className="menu-item">
        <div className="menu-item-info">
          <div className="menu-item-name-row">
            <h3>{item.name}</h3>
            {item.badge && <span className="item-badge">{item.badge}</span>}
            {hasOptions && <span className="item-badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Customize</span>}
          </div>
          <p>{item.description}</p>
          <span className="price">${item.price.toFixed(2)}</span>
        </div>
        <div className="qty-control">
          {qty > 0 && !hasOptions ? (
            <>
              <button onClick={onRemove}>−</button>
              <span>{qty}</span>
              <button onClick={handleAdd}>+</button>
            </>
          ) : qty > 0 && hasOptions ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span className="item-count-badge">{qty} in cart</span>
              <button className="add-btn" onClick={handleAdd}>+ Add</button>
            </div>
          ) : (
            <button className="add-btn" onClick={handleAdd}>Add</button>
          )}
        </div>
      </div>
      {showModal && (
        <CustomizeModal item={item} onConfirm={handleConfirm} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
