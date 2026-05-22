const mongoose = require('mongoose');

/**
 * Contact Schema
 * Stores messages submitted through the contact form.
 */
const contactSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  topic: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);
