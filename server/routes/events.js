const express = require('express');
const router = express.Router();

const DEFAULT_MENU = [
  {
    id: 'cat-beer', category: 'Beer',
    items: [
      { id: 'e-beer-1', name: 'Draft Lager', price: 7, description: 'Crisp and refreshing' },
      { id: 'e-beer-2', name: 'IPA', price: 8, description: 'Hoppy and bold' },
      { id: 'e-beer-3', name: 'Hard Seltzer', price: 7, description: 'Light and bubbly' },
    ],
  },
  {
    id: 'cat-wine', category: 'Wine',
    items: [
      { id: 'e-wine-1', name: 'Chardonnay', price: 10, description: 'Crisp white wine' },
      { id: 'e-wine-2', name: 'Cabernet Sauvignon', price: 11, description: 'Full-bodied red' },
      { id: 'e-wine-3', name: 'Rosé', price: 10, description: 'Light and fruity' },
      { id: 'e-wine-4', name: 'Prosecco', price: 10, description: 'Sparkling Italian wine' },
    ],
  },
  {
    id: 'cat-cocktails', category: 'Cocktails',
    items: [
      { id: 'e-cock-1', name: 'Classic Margarita', price: 13, description: 'Tequila, lime, triple sec' },
      { id: 'e-cock-2', name: 'Old Fashioned', price: 14, description: 'Bourbon, bitters, sugar' },
      { id: 'e-cock-3', name: 'Mojito', price: 12, description: 'Rum, mint, lime, soda' },
      { id: 'e-cock-4', name: 'Aperol Spritz', price: 12, description: 'Aperol, prosecco, soda' },
      { id: 'e-cock-5', name: 'Moscow Mule', price: 12, description: 'Vodka, ginger beer, lime' },
    ],
  },
  {
    id: 'cat-na', category: 'Non-Alcoholic',
    items: [
      { id: 'e-na-1', name: 'Sparkling Water', price: 3, description: 'Chilled and refreshing' },
      { id: 'e-na-2', name: 'Soft Drink', price: 4, description: 'Coke, Diet Coke, Sprite, Ginger Ale' },
      { id: 'e-na-3', name: 'Juice', price: 5, description: 'Orange, cranberry, or pineapple' },
      { id: 'e-na-4', name: 'Virgin Mojito', price: 8, description: 'Mint, lime, soda, sugar' },
    ],
  },
];

const events = new Map();

const makeEvent = (data) => ({
  id: `evt-${Date.now()}`,
  name: data.name || 'Special Event',
  greeting: data.greeting || `Welcome to ${data.name || 'our special event'}!`,
  subgreeting: data.subgreeting || 'Order drinks and they\'ll be brought right to you.',
  photoUrl: data.photoUrl || '',
  eventType: data.eventType || 'wedding',
  barType: data.barType || 'open',
  tableCount: parseInt(data.tableCount) || 10,
  seatsPerTable: parseInt(data.seatsPerTable) || 10,
  date: data.date || '',
  managerPin: data.managerPin || '0000',
  status: 'active',
  menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
  eightySixed: [],
  orders: [],
  createdAt: new Date().toISOString(),
});

router.get('/', (req, res) => {
  res.json([...events.values()].map(e => ({
    id: e.id, name: e.name, date: e.date, eventType: e.eventType,
    barType: e.barType, tableCount: e.tableCount, seatsPerTable: e.seatsPerTable,
    status: e.status, orderCount: e.orders.length, createdAt: e.createdAt,
    greeting: e.greeting, photoUrl: e.photoUrl, managerPin: e.managerPin,
  })));
});

router.post('/', (req, res) => {
  const event = makeEvent(req.body);
  events.set(event.id, event);
  res.json(event);
});

router.get('/:id', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const { orders, ...rest } = event;
  res.json({ ...rest, orderCount: orders.length });
});

router.put('/:id', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const updated = { ...event, ...req.body, id: event.id, orders: event.orders, menu: event.menu, eightySixed: event.eightySixed };
  events.set(event.id, updated);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  events.delete(req.params.id);
  res.json({ success: true });
});

router.get('/:id/menu', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event.menu.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, soldOut: event.eightySixed.includes(item.id) })),
  })));
});

router.put('/:id/menu', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  event.menu = req.body.menu || event.menu;
  res.json(event.menu);
});

router.get('/:id/orders', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event.orders);
});

router.post('/:id/orders', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const order = { id: `o-${Date.now()}`, ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  event.orders.push(order);
  res.json(order);
});

router.patch('/:id/orders/:orderId', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const order = event.orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status || order.status;
  res.json(order);
});

router.get('/:id/eightysix', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event.eightySixed);
});

router.post('/:id/eightysix', (req, res) => {
  const event = events.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const { itemId } = req.body;
  const idx = event.eightySixed.indexOf(itemId);
  if (idx >= 0) event.eightySixed.splice(idx, 1);
  else event.eightySixed.push(itemId);
  res.json(event.eightySixed);
});

module.exports = router;
