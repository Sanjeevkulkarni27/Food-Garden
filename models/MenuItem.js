const mongoose = require('mongoose');

/**
 * MenuItem Schema
 * Stores dishes displayed on the restaurant menu.
 */
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['starters', 'mains', 'tandoor', 'desserts', 'beverages', 'specials'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  badges: [{
    type: String   // e.g. 'veg', 'spicy', 'chef-special', 'new'
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
