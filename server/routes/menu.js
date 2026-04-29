const express = require('express');
const router = express.Router();
const menu = require('../data/menuData');

router.get('/', (req, res) => {
  res.json(menu);
});

module.exports = router;
