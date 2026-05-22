const express = require('express');
const router = express.Router();

const Reservation = require('../models/Reservation');
const requireAuth = require('../middleware/auth');
const { sendReservationConfirmation, sendAdminAlert } = require('../utils/mailer');

// ─── POST /  —  Create a new reservation (public) ───────────────────────────
router.post('/', async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();

    // Send confirmation email to the guest (non-blocking)
    sendReservationConfirmation(reservation);

    // Notify admin about the new reservation (non-blocking)
    sendAdminAlert('reservation', reservation);

    return res.status(201).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reservation. Please try again.'
    });
  }
});

// ─── GET /  —  Get all reservations (admin only) ────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations.'
    });
  }
});

// ─── PATCH /:id  —  Update reservation status (admin only) ─────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    return res.json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Error updating reservation:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reservation.'
    });
  }
});

// ─── DELETE /:id  —  Delete a reservation (admin only) ──────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting reservation:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete reservation.'
    });
  }
});

module.exports = router;
