const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  country: {
    type: String,
    enum: ['India', 'America'],
    required: [true, 'Country is required']
  },
  menuItems: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
