const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['CREATED', 'PLACED', 'CANCELLED'],
    default: 'CREATED'
  },
  paymentMethod: {
    type: String,
    default: 'Cash'
  },
  country: {
    type: String,
    enum: ['India', 'America'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
