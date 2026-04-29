const express = require('express');
const router = express.Router();
const menu = require('../data/menuData');

let liveSpecials = JSON.parse(JSON.stringify(
  menu.find(c => c.id === 'specials')?.items || []
));

const eightySixed = new Set();

router.get('/', (req, res) => {
  const out = menu.map(cat =>
    cat.id === 'specials' ? { ...cat, items: liveSpecials } : cat
  ).map(cat => ({
    ...cat,
    items: cat.items.map(item => ({
      ...item,
      soldOut: eightySixed.has(item.id),
    })),
  }));
  res.json(out);
});

router.get('/specials', (req, res) => {
  res.json(liveSpecials);
});

router.put('/specials', (req, res) => {
  liveSpecials = req.body.items || [];
  res.json({ success: true });
});

router.get('/eightysix', (req, res) => {
  res.json([...eightySixed]);
});

router.post('/eightysix', (req, res) => {
  const { itemId } = req.body;
  if (eightySixed.has(itemId)) eightySixed.delete(itemId);
  else eightySixed.add(itemId);
  res.json({ eightySixed: [...eightySixed] });
});

module.exports = router;
