import { API_URL } from '../../config';

const STATUS_COLORS = { received: '#f59e0b', preparing: '#3b82f6', ready: '#10b981', delivered: '#6b7280' };
const NEXT_STATUS = { received: 'preparing', preparing: 'ready', ready: 'delivered' };
const STATUS_LABELS = { received: 'Received', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered' };

export default function OrderCard({ order, filter }) {
  const items = filter ? order.items.filter(i => i.tag === filter) : order.items;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
  const next = NEXT_STATUS[order.status];

  const updateStatus = async () => {
    if (!next) return;
    await fetch(`${API_URL}/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  };

  return (
    <div className="order-card" style={{ borderTop: `4px solid ${STATUS_COLORS[order.status]}` }}>
      <div className="order-card-header">
        <div>
          <span className="order-location">
            {order.location.type === 'table' ? 'Table' : 'Bar'} {order.location.number}
          </span>
          <span className="order-time">{elapsed}m ago</span>
        </div>
        <span className="order-status" style={{ color: STATUS_COLORS[order.status] }}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="order-items">
        {items.map((item, i) => (
          <div key={i} className="order-item-row">
            <span className="item-qty">{item.qty}×</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      {next && (
        <button
          className="status-btn"
          style={{ background: STATUS_COLORS[next] }}
          onClick={updateStatus}
        >
          Mark as {STATUS_LABELS[next]}
        </button>
      )}
    </div>
  );
}
