const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://qkjzanjtneiilsgctvxe.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFranphbmp0bmVpaWxzZ2N0dnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTE3NzcsImV4cCI6MjA5MjUyNzc3N30.Qr2TJrRpbtuSE0gBxzIPe5zbgej9ySDd6TDK8jhGOSw'
);

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

const toEvent = (e) => ({
  id: e.id,
  name: e.name,
  greeting: e.greeting,
  subgreeting: e.subgreeting,
  photoUrl: e.photo_url,
  eventType: e.event_type,
  barType: e.bar_type,
  tableCount: e.table_count,
  seatsPerTable: e.seats_per_table,
  date: e.date,
  managerPin: e.manager_pin,
  status: e.status,
  menu: e.menu,
  eightySixed: e.eighty_sixed,
  galleryOpen: e.gallery_open,
  createdAt: e.created_at,
  orderCount: e.order_count || 0,
});

const toOrder = (o) => ({
  id: o.id,
  guestName: o.guest_name,
  table: o.table_num,
  seat: o.seat,
  items: o.items,
  total: o.total,
  barType: o.bar_type,
  status: o.status,
  createdAt: o.created_at,
});

const toPhoto = (p) => ({
  id: p.id,
  url: p.url,
  guestName: p.guest_name,
  table: p.table_num,
  uploadedAt: p.uploaded_at,
});

// ── Events ───────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const { data: orders } = await supabase.from('titi_orders').select('event_id');
  const countMap = {};
  (orders || []).forEach(o => { countMap[o.event_id] = (countMap[o.event_id] || 0) + 1; });
  res.json((data || []).map(e => ({ ...toEvent(e), orderCount: countMap[e.id] || 0 })));
});

router.post('/', async (req, res) => {
  const d = req.body;
  const record = {
    id: `evt-${Date.now()}`,
    name: d.name || 'Special Event',
    greeting: d.greeting || `Welcome to ${d.name || 'our special event'}!`,
    subgreeting: d.subgreeting || "Order drinks and they'll be brought right to you.",
    photo_url: d.photoUrl || '',
    event_type: d.eventType || 'wedding',
    bar_type: d.barType || 'open',
    table_count: parseInt(d.tableCount) || 10,
    seats_per_table: parseInt(d.seatsPerTable) || 10,
    date: d.date || '',
    manager_pin: d.managerPin || '0000',
    status: 'active',
    menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
    eighty_sixed: [],
    gallery_open: false,
  };
  const { data, error } = await supabase.from('titi_events').insert(record).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(toEvent(data));
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  const { data: orders } = await supabase.from('titi_orders').select('id').eq('event_id', req.params.id);
  res.json({ ...toEvent(data), orderCount: (orders || []).length });
});

router.put('/:id', async (req, res) => {
  const d = req.body;
  const updates = {};
  if (d.name !== undefined) updates.name = d.name;
  if (d.greeting !== undefined) updates.greeting = d.greeting;
  if (d.subgreeting !== undefined) updates.subgreeting = d.subgreeting;
  if (d.photoUrl !== undefined) updates.photo_url = d.photoUrl;
  if (d.eventType !== undefined) updates.event_type = d.eventType;
  if (d.barType !== undefined) updates.bar_type = d.barType;
  if (d.tableCount !== undefined) updates.table_count = parseInt(d.tableCount);
  if (d.seatsPerTable !== undefined) updates.seats_per_table = parseInt(d.seatsPerTable);
  if (d.date !== undefined) updates.date = d.date;
  if (d.managerPin !== undefined) updates.manager_pin = d.managerPin;
  if (d.status !== undefined) updates.status = d.status;
  const { data, error } = await supabase.from('titi_events').update(updates).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(toEvent(data));
});

router.delete('/:id', async (req, res) => {
  await supabase.from('titi_events').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ── Menu ─────────────────────────────────────────────────────────────────────

router.get('/:id/menu', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').select('menu, eighty_sixed').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(data.menu.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({ ...item, soldOut: data.eighty_sixed.includes(item.id) })),
  })));
});

router.put('/:id/menu', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').update({ menu: req.body.menu }).eq('id', req.params.id).select('menu').single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(data.menu);
});

// ── Orders ───────────────────────────────────────────────────────────────────

router.get('/:id/orders', async (req, res) => {
  const { data, error } = await supabase.from('titi_orders').select('*').eq('event_id', req.params.id).order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(toOrder));
});

router.post('/:id/orders', async (req, res) => {
  const { guestName, table, seat, items, total, barType } = req.body;
  const record = {
    id: `o-${Date.now()}`,
    event_id: req.params.id,
    guest_name: guestName || 'Guest',
    table_num: table || '',
    seat: seat || '',
    items: items || [],
    total: total || 0,
    bar_type: barType || 'open',
    status: 'pending',
  };
  const { data, error } = await supabase.from('titi_orders').insert(record).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(toOrder(data));
});

router.patch('/:id/orders/:orderId', async (req, res) => {
  const { data, error } = await supabase.from('titi_orders').update({ status: req.body.status }).eq('id', req.params.orderId).select().single();
  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  res.json(toOrder(data));
});

// ── 86 ───────────────────────────────────────────────────────────────────────

router.get('/:id/eightysix', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').select('eighty_sixed').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(data.eighty_sixed);
});

router.post('/:id/eightysix', async (req, res) => {
  const { data: ev, error } = await supabase.from('titi_events').select('eighty_sixed').eq('id', req.params.id).single();
  if (error || !ev) return res.status(404).json({ error: 'Not found' });
  const list = [...ev.eighty_sixed];
  const idx = list.indexOf(req.body.itemId);
  if (idx >= 0) list.splice(idx, 1); else list.push(req.body.itemId);
  await supabase.from('titi_events').update({ eighty_sixed: list }).eq('id', req.params.id);
  res.json(list);
});

// ── Photos ───────────────────────────────────────────────────────────────────

router.get('/:id/photos', async (req, res) => {
  const [{ data: ev }, { data: photos }] = await Promise.all([
    supabase.from('titi_events').select('gallery_open').eq('id', req.params.id).single(),
    supabase.from('titi_photos').select('*').eq('event_id', req.params.id).order('uploaded_at'),
  ]);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  res.json({ photos: (photos || []).map(toPhoto), galleryOpen: ev.gallery_open });
});

router.post('/:id/photos', async (req, res) => {
  const { url, guestName, table } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const record = {
    id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event_id: req.params.id,
    url,
    guest_name: guestName || 'Guest',
    table_num: table || '',
  };
  const { data, error } = await supabase.from('titi_photos').insert(record).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(toPhoto(data));
});

router.delete('/:id/photos/:photoId', async (req, res) => {
  await supabase.from('titi_photos').delete().eq('id', req.params.photoId);
  res.json({ success: true });
});

router.patch('/:id/gallery', async (req, res) => {
  const { data, error } = await supabase.from('titi_events').update({ gallery_open: !!req.body.open }).eq('id', req.params.id).select('gallery_open').single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json({ galleryOpen: data.gallery_open });
});

module.exports = router;
