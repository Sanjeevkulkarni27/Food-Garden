const express = require('express');
const router = express.Router();

const Contact = require('../models/Contact');
const requireAuth = require('../middleware/auth');
const { sendContactNotification, sendAdminAlert } = require('../utils/mailer');

// ─── POST /  —  Create a new contact message (public) ───────────────────────
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Notify restaurant about the new message (non-blocking)
    sendContactNotification(contact);

    // Send admin alert (non-blocking)
    sendAdminAlert('contact', contact);

    return res.status(201).json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error creating contact message:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again.'
    });
  }
});

// ─── GET /  —  Get all contact messages (admin only) ────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages.'
    });
  }
});

// ─── PATCH /:id  —  Update isRead status (admin only) ──────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: req.body.isRead },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    return res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error updating contact:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact message.'
    });
  }
});

// ─── DELETE /:id  —  Delete a contact message (admin only) ──────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting contact:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact message.'
    });
  }
});

module.exports = router;
