const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  selectedServices: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  note: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
