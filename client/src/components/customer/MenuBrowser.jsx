import { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import { API_URL } from '../../config';

const EMOJI = { food: '🍔', beer: '🍺', cocktails: '🍹', wine: '🍷', na: '🥤' };

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
      <div className="category-tabs">
        {menu.map(cat => (
          <button
            key={cat.id}
            className={activeCategory === cat.id ? 'active' : ''}
            onClick={() => setActiveCategory(cat.id)}
          >
            {EMOJI[cat.id]} {cat.category}
          </button>
        ))}
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
