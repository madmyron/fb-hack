const STATS = {
  today: { total: 12700, bar: 7500, kitchen: 5200, orders: 184 },
  month: { total: 245000, bar: 142000, kitchen: 103000, orders: 3420 },
  ytd: { total: 1840000, bar: 1050000, kitchen: 790000, orders: 27800 },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

export default function SalesStats({ servers }) {
  const { today, month, ytd } = STATS;
  const totalTips = servers.reduce((sum, s) => sum + s.tips, 0);

  return (
    <div className="sales-stats">
      <h2>Sales Overview</h2>
      <div className="stats-row">
        <StatCard label="Today" value={`$${today.total.toLocaleString()}`} sub={`${today.orders} orders`} />
        <StatCard label="This Month" value={`$${month.total.toLocaleString()}`} sub={`${month.orders} orders`} />
        <StatCard label="YTD" value={`$${ytd.total.toLocaleString()}`} sub={`${ytd.orders} orders`} />
      </div>
      <div className="stats-row">
        <StatCard label="Bar Revenue (Today)" value={`$${today.bar.toLocaleString()}`} />
        <StatCard label="Kitchen Revenue (Today)" value={`$${today.kitchen.toLocaleString()}`} />
        <StatCard label="Total Tips (Month)" value={`$${totalTips.toLocaleString()}`} />
      </div>
    </div>
  );
}
