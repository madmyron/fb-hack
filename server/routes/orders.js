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
    const { location, items, total, paymentMethod, promoCode, promoDiscount } = req.body;
    const order = {
      id: uuidv4(),
      location,
      items,
      total,
      paymentMethod: paymentMethod || 'pending',
      status: 'received',
      createdAt: new Date().toISOString(),
      ...(promoCode && { promoCode, promoDiscount }),
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

  router.post('/close-table', (req, res) => {
    const { location } = req.body;
    const tableOrders = orders.filter(o =>
      o.location.type === location.type &&
      o.location.number === location.number &&
      o.status !== 'delivered'
    );
    tableOrders.forEach(o => {
      o.status = 'delivered';
      o.closedAt = new Date().toISOString();
      io.emit('order_updated', o);
    });
    res.json({ success: true, closed: tableOrders.length });
  });

  router.post('/discount', (req, res) => {
    const { location, pct, managerName } = req.body;
    const tableOrders = orders.filter(o =>
      o.location.type === location.type &&
      o.location.number === location.number &&
      o.status !== 'delivered'
    );
    tableOrders.forEach(o => {
      if (!o.originalTotal) o.originalTotal = o.total;
      o.discount = { pct, managerName, appliedAt: new Date().toISOString() };
      o.total = Math.max(0, o.originalTotal * (1 - pct));
      io.emit('order_updated', o);
    });
    res.json({ success: true });
  });

  router.post('/transfer', (req, res) => {
    const { transfers, toLocation } = req.body;
    const affected = new Set();
    const itemsToAdd = [];
    let totalMoved = 0;

    transfers.forEach(({ orderId, itemName, qty }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      const itemIdx = order.items.findIndex(i => i.name === itemName);
      if (itemIdx === -1) return;

      const item = order.items[itemIdx];
      const moveQty = Math.min(qty, item.qty);
      const moved$ = item.price * moveQty;

      if (item.qty === moveQty) order.items.splice(itemIdx, 1);
      else item.qty -= moveQty;

      order.total = Math.max(0, order.total - moved$);
      totalMoved += moved$;
      itemsToAdd.push({ ...item, qty: moveQty });
      affected.add(order);
    });

    let dest = orders.find(o =>
      o.location.type === toLocation.type &&
      o.location.number === toLocation.number &&
      o.status !== 'delivered'
    );

    if (dest) {
      itemsToAdd.forEach(item => {
        const existing = dest.items.find(i => i.name === item.name);
        if (existing) existing.qty += item.qty;
        else dest.items.push({ ...item });
      });
      dest.total += totalMoved;
    } else {
      dest = {
        id: uuidv4(), location: toLocation, items: itemsToAdd,
        total: totalMoved, paymentMethod: 'pending',
        status: 'received', createdAt: new Date().toISOString(),
      };
      orders.push(dest);
      io.emit('new_order', dest);
    }

    affected.forEach(o => io.emit('order_updated', o));
    io.emit('order_updated', dest);
    res.json({ success: true });
  });

  return router;
};
