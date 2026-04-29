import { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import { API_URL } from '../../config';

const EMOJI = {
  happyhour: '🎉', specials: '⭐', food: '🍔', beer: '🍺',
  cocktails: '🍹', winelist: '🍾', wine: '🍷', na: '🥤',
};

const TAB_COLORS = {
  happyhour: 'linear-gradient(135deg, #f59e0b, #f97316)',
  specials: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  food: 'linear-gradient(135deg, #f97316, #ef4444)',
  beer: 'linear-gradient(135deg, #f59e0b, #d97706)',
  cocktails: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  winelist: 'linear-gradient(135deg, #7c3aed, #dc2626)',
  wine: 'linear-gradient(135deg, #dc2626, #9f1239)',
  na: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
};

export default function MenuBrowser({ cart, cartCount, onAdd, onRemove, onViewCart }) {
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(r => r.json())
      .then(data => {
        setMenu(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      });
  }, []);

  const active = menu.find(c => c.id === activeCategory);

  return (
    <div className="menu-browser">
      <div className="menu-header">
        <h2>Menu</h2>
        {cartCount > 0 && (
          <button className="cart-btn" onClick={onViewCart}>Cart ({cartCount})</button>
        )}
      </div>
      <div className="category-tabs-wrapper">
        <div className="category-tabs">
          {menu.map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              style={activeCategory === cat.id ? { background: TAB_COLORS[cat.id] || 'var(--grad)' } : {}}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="cat-emoji">{EMOJI[cat.id]}</span>
              <span>{cat.category}</span>
            </button>
          ))}
        </div>
      </div>
      {active && <MenuSection category={active} cart={cart} onAdd={onAdd} onRemove={onRemove} />}
      {cartCount > 0 && (
        <div className="cart-footer">
          <button className="btn-primary" onClick={onViewCart}>
            View Cart ({cartCount} items)
          </button>
        </div>
      )}
    </div>
  );
}
