export default function MenuItem({ item, qty, onAdd, onRemove }) {
  return (
    <div className="menu-item">
      <div className="menu-item-info">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <span className="price">${item.price.toFixed(2)}</span>
      </div>
      <div className="qty-control">
        {qty > 0 ? (
          <>
            <button onClick={onRemove}>−</button>
            <span>{qty}</span>
            <button onClick={onAdd}>+</button>
          </>
        ) : (
          <button className="add-btn" onClick={onAdd}>Add</button>
        )}
      </div>
    </div>
  );
}
