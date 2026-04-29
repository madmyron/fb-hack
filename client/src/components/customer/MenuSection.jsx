import MenuItem from './MenuItem';

export default function MenuSection({ category, cart, onAdd, onRemove }) {
  const getQty = (itemId) => {
    const found = cart.find(c => c.item.id === itemId);
    return found ? found.qty : 0;
  };

  return (
    <div className="menu-section">
      {category.items.map(item => (
        <MenuItem
          key={item.id}
          item={item}
          qty={getQty(item.id)}
          onAdd={() => onAdd(item)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </div>
  );
}
