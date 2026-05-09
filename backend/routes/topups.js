const express = require('express');
const router = express.Router();
const TopUp = require('../models/TopUp');
const authMiddleware = require('../middleware/auth');
const customerAuthMiddleware = require('../middleware/customerAuth');

// Submit a top-up request (customer or guest)
router.post('/', async (req, res) => {
  try {
    const { network, amount, seri, code, customerId, customerEmail } = req.body;

    if (!network || !amount || !seri || !code) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin thẻ' });
    }

    const topup = new TopUp({
      network,
      amount: Number(amount),
      seri,
      code,
      customerId: customerId || null,
      customerEmail: customerEmail || ''
    });

    await topup.save();
    res.status(201).json({ message: 'Yêu cầu nạp thẻ đã được gửi', topup });
  } catch (error) {
    console.error('Create topup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all top-up requests (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const topups = await TopUp.find().sort({ createdAt: -1 });
    res.json(topups);
  } catch (error) {
    console.error('Get topups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update top-up status (admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const topup = await TopUp.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!topup) {
      return res.status(404).json({ message: 'Top-up not found' });
    }

    res.json({ message: 'Top-up updated successfully', topup });
  } catch (error) {
    console.error('Update topup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a top-up request (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const topup = await TopUp.findByIdAndDelete(req.params.id);

    if (!topup) {
      return res.status(404).json({ message: 'Top-up not found' });
    }

    res.json({ message: 'Top-up deleted successfully' });
  } catch (error) {
    console.error('Delete topup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
