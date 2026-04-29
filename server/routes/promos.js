const express = require('express');
const router = express.Router();

const PROMOS = { FLY15: 0.15, NYT25: 0.25, OWN100: 1.00 };

router.get('/:code', (req, res) => {
  const pct = PROMOS[req.params.code.toUpperCase()];
  if (!pct) return res.status(404).json({ error: 'Invalid promo code' });
  res.json({ code: req.params.code.toUpperCase(), discount: pct });
});

module.exports = router;
