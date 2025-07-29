// routes/bookOrders.js
const express = require('express');
const router = express.Router();
const BookOrder = require('../models/BookOrder');


// POST a new order
router.post('/', async (req, res) => {
  try {
    const order = new BookOrder(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('POST /api/book-orders error:', error);
    res.status(400).json({ message: 'Error creating book order', error });
  }
});



// GET all book orders
router.get('/', async (req, res) => {
  try {
    const orders = await BookOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('GET /api/book-orders error:', error);
    res.status(500).json({ message: 'Error fetching book orders', error });
  }
});

module.exports = router;
