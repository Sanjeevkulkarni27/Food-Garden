const express = require('express');
const router = express.Router();

const MenuItem = require('../models/MenuItem');
const requireAuth = require('../middleware/auth');

// ─── GET /  —  Get all menu items (public) ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, createdAt: -1 });

    return res.json({
      success: true,
      menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items.'
    });
  }
});

// ─── POST /  —  Create a new menu item (admin only) ────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();

    return res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create menu item.'
    });
  }
});

// ─── PATCH /:id  —  Update a menu item (admin only) ────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    return res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item.'
    });
  }
});

// ─── DELETE /:id  —  Delete a menu item (admin only) ────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting menu item:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete menu item.'
    });
  }
});

module.exports = router;
