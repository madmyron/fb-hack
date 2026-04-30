const express = require('express');
const router = express.Router();

let config = {
  venueName: 'The Tap Room',
  venueTagline: 'Order food & drinks from your seat. No waiting. No flagging.',
};

router.get('/', (req, res) => res.json(config));

router.put('/', (req, res) => {
  const { venueName, venueTagline } = req.body;
  if (venueName !== undefined) config.venueName = venueName;
  if (venueTagline !== undefined) config.venueTagline = venueTagline;
  res.json(config);
});

module.exports = router;
