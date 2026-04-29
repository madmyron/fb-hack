const express = require('express');
const { v4: uuidv4 } = require('uuid');

const orders = [];

module.exports = (io) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(orders);
  });

  router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  router.post('/', (req, res) => {
    const { location, items, total, paymentMethod } = req.body;
    const order = {
      id: uuidv4(),
      location,
      items,
      total,
      paymentMethod: paymentMethod || 'pending',
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    io.emit('new_order', order);
    res.status(201).json(order);
  });

  router.patch('/:id/status', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = req.body.status;
    io.emit('order_updated', order);
    res.json(order);
  });

  return router;
};
