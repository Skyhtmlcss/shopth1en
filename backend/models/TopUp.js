const mongoose = require('mongoose');

const topUpSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerEmail: { type: String, default: '' },
  network: { type: String, required: true },
  amount: { type: Number, required: true },
  seri: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TopUp', topUpSchema);
