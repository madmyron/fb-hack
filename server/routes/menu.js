const express = require('express');
const router = express.Router();
const menu = require('../data/menuData');

let liveSpecials = JSON.parse(JSON.stringify(
  menu.find(c => c.id === 'specials')?.items || []
));

router.get('/', (req, res) => {
  const out = menu.map(cat =>
    cat.id === 'specials' ? { ...cat, items: liveSpecials } : cat
  );
  res.json(out);
});

router.get('/specials', (req, res) => {
  res.json(liveSpecials);
});

router.put('/specials', (req, res) => {
  liveSpecials = req.body.items || [];
  res.json({ success: true });
});

module.exports = router;
