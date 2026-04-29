const VENUE_DATA = {
  bar: {
    today: 7500, month: 142000, ytd: 1050000, avgOrder: 38,
    topItems: ['Draft Lager', 'Classic Margarita', 'IPA', 'Old Fashioned', 'Aperol Spritz'],
  },
  kitchen: {
    today: 5200, month: 103000, ytd: 790000, avgOrder: 52,
    topItems: ['Smash Burger', 'Buffalo Wings', 'Loaded Nachos', 'Margherita Pizza', 'Truffle Fries'],
  },
};

function VenueCard({ name, data }) {
  return (
    <div className="venue-card">
      <h3>{name}</h3>
      <div className="venue-stats">
        <div className="venue-stat"><span>Today</span><strong>${data.today.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>This Month</span><strong>${data.month.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>YTD</span><strong>${data.ytd.toLocaleString()}</strong></div>
        <div className="venue-stat"><span>Avg Order</span><strong>${data.avgOrder}</strong></div>
      </div>
      <div className="top-items">
        <h4>Top Items</h4>
        <ol>{data.topItems.map((item, i) => <li key={i}>{item}</li>)}</ol>
      </div>
    </div>
  );
}

export default function VenueStats() {
  return (
    <div className="venue-stats-page">
      <h2>Venue Performance</h2>
      <div className="venue-grid">
        <VenueCard name="Bar" data={VENUE_DATA.bar} />
        <VenueCard name="Kitchen" data={VENUE_DATA.kitchen} />
      </div>
    </div>
  );
}
