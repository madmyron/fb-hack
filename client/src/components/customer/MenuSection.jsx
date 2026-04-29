import MenuItem from './MenuItem';

export default function MenuSection({ category, cart, onAdd, onRemove }) {
  const getQty = (itemId) =>
    cart.filter(c => c.item.id === itemId).reduce((s, c) => s + c.qty, 0);

  const simpleKey = (itemId) => `${itemId}__${JSON.stringify([])}`;

  return (
    <div className="menu-section">
      {category.banner && (
        <div className="menu-banner">
          <div className="menu-banner-top">
            <span className="menu-banner-title">{category.banner.text}</span>
            <span className="menu-banner-hours">{category.banner.hours}</span>
          </div>
          <p className="menu-banner-note">{category.banner.note}</p>
        </div>
      )}
      {category.items.map(item => (
        <MenuItem
          key={item.id}
          item={item}
          qty={getQty(item.id)}
          onAdd={(itm, customizations) => onAdd(itm, customizations)}
          onRemove={() => onRemove(simpleKey(item.id))}
        />
      ))}
    </div>
  );
}
