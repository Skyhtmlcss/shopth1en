const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const customerAuthMiddleware = require('../middleware/customerAuth');

router.post('/', async (req, res) => {
  try {
    const { selectedServices, totalPrice, username, password, note, customerId } = req.body;

    if (!selectedServices || selectedServices.length === 0) {
      return res.status(400).json({ message: 'Please select at least one service' });
    }
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const order = new Order({
      customerId: customerId || null,
      selectedServices,
      totalPrice,
      username,
      password,
      note: note || ''
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-orders', customerAuthMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
